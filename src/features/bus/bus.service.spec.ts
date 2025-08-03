import { hasKey } from '@core/util/predicates';
import {
  MockBusArrivalResponseBody,
  MockBusDetails,
  MockBusServiceDetails,
  MockLTAUrlFetchApp,
} from './bus.mock';
import { BusService } from './bus.service';
import { MockLogger, MockUrlFetchApp } from '@core/googleAppsScript';
import { constants } from './bus.constants';
import { Builder } from '@core/util/builder';
import {
  canParseMarkdownV2,
  MockMessage,
  MockCallbackQuery,
  MockTelegramUrlFetchApp,
  sendMessage,
  MockUser,
} from '@core/telegram/telegram.mock';
import { BusServiceDetails } from './bus.type';
import { Command } from '@core/util/command';
import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';

describe('BusService', () => {
  let underTest: BusService;

  beforeAll(() => {
    global.Logger = MockLogger;
    global.UrlFetchApp = new Builder(MockUrlFetchApp)
      .with({
        fetch: (url) => {
          if (url.includes('datamall2.mytransport.sg')) {
            return MockLTAUrlFetchApp.fetch(url);
          } else if (url.includes('api.telegram.org/bot')) {
            return MockTelegramUrlFetchApp.fetch(url);
          }
          return MockUrlFetchApp.fetch(url);
        },
      })
      .build();
  });

  beforeEach(() => {
    global.SpreadsheetApp = createMockSpreadsheetApp();
    underTest = new BusService();
    jest.clearAllMocks();
  });

  describe('getBusArrivals', () => {
    describe('valid bus stop code', () => {
      it('should return the bus arrival details', () => {
        const expected = ['15', '150', '155'];
        const actual = underTest.getBusArrivals('83139');
        if (!hasKey(actual, 'Services') || actual.Services === undefined) {
          throw 'Response body has no services';
        }
        const serviceNumbers = actual.Services.map((s) => s.ServiceNo);

        expect(serviceNumbers).toEqual(expected);
      });
    });

    describe('no buses available', () => {
      it('should return empty array', () => {
        const expected: string[] = [];
        const actual = underTest.getBusArrivals('123');
        if (!hasKey(actual, 'Services') || actual.Services === undefined) {
          throw 'Response body has no services';
        }
        const serviceNumbers = actual.Services.map((s) => s.ServiceNo);

        expect(serviceNumbers).toEqual(expected);
      });
    });

    describe('invalid bus stop code', () => {
      it('should not have services field', () => {
        const actual = underTest.getBusArrivals('ABC');

        expect(actual.Services).toBeUndefined();
      });
    });
  });

  describe('formatBusArrivalHeader', () => {
    describe('bus services available', () => {
      it('should return bus stop details', () => {
        const actual = underTest.formatBusArrivalHeader(
          MockBusArrivalResponseBody,
        );
        expect(
          actual.includes(MockBusArrivalResponseBody.BusStopCode),
        ).toBeTruthy();
      });
    });

    describe('no bus services available', () => {
      it('should return no buses found message', () => {
        const actual = underTest.formatBusArrivalHeader(
          new Builder(MockBusArrivalResponseBody)
            .with({ Services: [] })
            .build(),
        );

        expect(actual.includes(constants.MSG_NO_BUSES)).toBeTruthy();
      });
    });

    describe('invalid bus stop code', () => {
      it('should return invalid bus code message', () => {
        const actual = underTest.formatBusArrivalHeader({
          'odata.metadata': 'metadata',
          BusStopCode: '13579',
        });

        expect(actual.includes(constants.MSG_INVALID_BUS_CODE)).toBeTruthy();
      });
    });
  });

  describe('formatBusArrivalTimings', () => {
    it('should return the bus arrival details', () => {
      const actual = underTest.formatBusArrivalTimings([MockBusServiceDetails]);
      expect(
        actual.includes(
          (MockBusArrivalResponseBody.Services ?? [])[0].ServiceNo,
        ),
      ).toBeTruthy();
    });

    it('should return the bus service number', () => {
      const actual = underTest.formatBusArrivalTimings([
        new Builder(MockBusServiceDetails)
          .with({
            NextBus: MockBusDetails,
            NextBus2: MockBusDetails,
            NextBus3: MockBusDetails,
          })
          .build(),
      ]);

      const arrivalTimes = actual
        .split('\n')[0]
        .split('\\|')
        .filter((s) => s.length > 0 && !['\\-', '\\|', ':', ','].includes(s))
        .slice(1);
      for (const arrivalTime of arrivalTimes) {
        expect(arrivalTime.includes('.')).toBeFalsy();
        expect(parseInt(arrivalTime, 10).toString().trim()).toStrictEqual(
          arrivalTime.trim(),
        );
        expect(parseInt(arrivalTime, 10)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return details sorted by service number', () => {
      const services: BusServiceDetails[] = [
        new Builder(MockBusServiceDetails).with({ ServiceNo: '2A' }).build(),
        new Builder(MockBusServiceDetails).with({ ServiceNo: '10' }).build(),
        new Builder(MockBusServiceDetails).with({ ServiceNo: '2' }).build(),
        new Builder(MockBusServiceDetails).with({ ServiceNo: '1' }).build(),
      ];
      const expected = ['1', '2', '2A', '10'];

      const actual = underTest
        .formatBusArrivalTimings(services)
        .split('\n')
        .map((row) => row.split('|')[1].trim());
      expect(actual).toEqual(expected);
    });
  });

  describe('processCommand', () => {
    describe('valid bus stop code', () => {
      it('should return the bus arrival details', () => {
        const command = new Command('bus 83139');
        underTest['processCommand'](command, MockUser, 123456);

        expect(sendMessage.mock.calls[1][0].includes('83139')).toBeTruthy();
        expect(sendMessage.mock.calls[1][0].includes('15')).toBeTruthy();
        expect(sendMessage.mock.calls[1][0].includes('150')).toBeTruthy();
        expect(sendMessage.mock.calls[1][0].includes('155')).toBeTruthy();
        expect(
          canParseMarkdownV2.mock.results.every(
            (result) => result.value === true,
          ),
        ).toBeTruthy();
      });
    });

    describe('no bus services available', () => {
      it('should return no buses found message', () => {
        const command = new Command('bus 123');
        underTest['processCommand'](command, MockUser, 123456);

        expect(
          sendMessage.mock.calls[1][0].includes(
            encodeURIComponent(constants.MSG_NO_BUSES),
          ),
        ).toBeTruthy();
        expect(
          canParseMarkdownV2.mock.results.every(
            (result) => result.value === true,
          ),
        ).toBeTruthy();
      });
    });

    describe('invalid bus stop code', () => {
      it('should return invalid bus code message', () => {
        const command = new Command('bus abc');
        underTest['processCommand'](command, MockUser, 123456);

        expect(
          sendMessage.mock.calls[1][0].includes(
            encodeURIComponent(constants.MSG_INVALID_BUS_CODE),
          ),
        ).toBeTruthy();
        expect(
          canParseMarkdownV2.mock.results.every(
            (result) => result.value === true,
          ),
        ).toBeTruthy();
      });
    });
  });

  describe('processMessage', () => {
    it('should process message and call processCommand', () => {
      const message = new Builder(MockMessage)
        .with({ text: 'bus 83139' })
        .build();
      underTest.processMessage(message);

      expect(sendMessage.mock.calls[1][0].includes('83139')).toBeTruthy();
    });
  });

  describe('processCallbackQuery', () => {
    it('should process callback query and call processCommand', () => {
      const callbackQuery = new Builder(MockCallbackQuery)
        .with({ data: '/bus 83139' })
        .build();
      underTest.processCallbackQuery(callbackQuery);

      expect(sendMessage.mock.calls[1][0].includes('83139')).toBeTruthy();
    });
  });
});
