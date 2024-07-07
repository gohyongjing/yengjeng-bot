import { hasKey } from '@core/util/predicates';
import { MockBusArrivalResponseBody, MockLTAUrlFetchApp } from './bus.mock';
import { BusService } from './bus.service';
import { MockSpreadsheetApp, MockUrlFetchApp } from '@core/googleAppsScript';
import { constants } from './bus.constants';
import { Builder } from '@core/util/builder';
import {
  MockMessage,
  MockTelegramUrlFetchApp,
} from '@core/telegram/telegram.mock';

describe('BusService', () => {
  let underTest: BusService;

  beforeAll(() => {
    global.SpreadsheetApp = MockSpreadsheetApp;
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
    underTest = new BusService();
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

  describe('formatBusArrivals', () => {
    describe('valid bus stop code', () => {
      it('should return the bus arrival details', () => {
        const actual = underTest.formatBusArrivals(MockBusArrivalResponseBody);
        const arrivalTimes = actual.split('\n')[0].split(' ').slice(1);

        expect(
          actual.includes(MockBusArrivalResponseBody.BusStopCode),
        ).toBeTruthy();
        expect(
          actual.includes(
            (MockBusArrivalResponseBody.Services ?? [])[0].ServiceNo,
          ),
        ).toBeTruthy();
        for (const arrivalTime of arrivalTimes) {
          expect(arrivalTime.includes('.')).toBeFalsy();
        }
      });

      it('should return the bus arrival timing as a non-negative integer', () => {
        const actual = underTest.formatBusArrivals(MockBusArrivalResponseBody);
        const arrivalTimes = actual
          .split('\n')[2]
          .split(' ')
          .filter((s) => s.length > 0 && !['\\-', '\\|', ':', ','].includes(s))
          .slice(1);

        for (const arrivalTime of arrivalTimes) {
          expect(parseInt(arrivalTime, 10).toString()).toStrictEqual(
            arrivalTime,
          );
          expect(parseInt(arrivalTime, 10)).toBeGreaterThanOrEqual(0);
        }
      });
    });

    describe('no bus services available', () => {
      it('should return no buses found message', () => {
        const actual = underTest.formatBusArrivals(
          new Builder(MockBusArrivalResponseBody)
            .with({ Services: [] })
            .build(),
        );

        expect(actual.includes(constants.MSG_NO_BUSES)).toBeTruthy();
      });
    });

    describe('invalid bus stop code', () => {
      it('should return invalid bus code message', () => {
        const actual = underTest.formatBusArrivals({
          'odata.metadata': 'metadata',
          BusStopCode: '13579',
        });

        expect(actual.includes(constants.MSG_INVALID_BUS_CODE)).toBeTruthy();
      });
    });
  });

  describe('processMessage', () => {
    describe('valid bus stop code', () => {
      it('should return the bus arrival details', () => {
        const actual = underTest.processMessage(
          new Builder(MockMessage).with({ text: 'bus 83139' }).build(),
        );

        expect(actual).toBeUndefined();
      });
    });

    describe('no bus services available', () => {
      it('should return no buses found message', () => {
        const actual = underTest.processMessage(
          new Builder(MockMessage).with({ text: 'bus 123' }).build(),
        );

        expect(actual).toBeUndefined();
      });
    });

    describe('invalid bus stop code', () => {
      it('should return invalid bus code message', () => {
        const actual = underTest.processMessage(
          new Builder(MockMessage).with({ text: 'bus abc' }).build(),
        );

        expect(actual).toBeUndefined();
      });
    });
  });
});
