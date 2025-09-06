import { hasKey } from '@core/util/predicates';
import {
  MockBusArrivalResponseBody,
  MockBusFeatureUrlFetchApp,
} from './bus.mock';
import { MockLogger } from '@core/googleAppsScript';
import { constants } from './bus.constants';
import { Builder } from '@core/util/builder';
import { canParseMarkdownV2, sendMessage } from '@core/telegram/telegram.mock';
import { getBusArrivals, sendBusArrivalTimings } from './bus.service';

describe('bus.service', () => {
  beforeAll(() => {
    global.Logger = MockLogger;
    global.UrlFetchApp = MockBusFeatureUrlFetchApp;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBusArrivals', () => {
    describe('valid bus stop code', () => {
      it('should return the bus arrival details', () => {
        const expected = ['15', '150', '155'];
        const actual = getBusArrivals('83139');
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
        const actual = getBusArrivals('123');
        if (!hasKey(actual, 'Services') || actual.Services === undefined) {
          throw 'Response body has no services';
        }
        const serviceNumbers = actual.Services.map((s) => s.ServiceNo);

        expect(serviceNumbers).toEqual(expected);
      });
    });

    describe('invalid bus stop code', () => {
      it('should not have services field', () => {
        const actual = getBusArrivals('ABC');

        expect(actual.Services).toBeUndefined();
      });
    });
  });

  describe('sendBusArrivalTimings', () => {
    it('should send formatted bus arrival timings', () => {
      sendBusArrivalTimings(12345, MockBusArrivalResponseBody);

      expect(sendMessage).toHaveBeenCalledTimes(1);
      expect(sendMessage.mock.calls[0][0]).toContain('12345');
      expect(sendMessage.mock.calls[0][0]).toContain('1A');
      expect(sendMessage.mock.calls[0][0]).toContain('Refresh');
      expect(sendMessage.mock.calls[0][0]).toContain('inline_keyboard');
      expect(canParseMarkdownV2).toHaveBeenCalledTimes(1);
    });

    it('should handle empty services', () => {
      const emptyResponse = new Builder(MockBusArrivalResponseBody)
        .with({ Services: [] })
        .build();

      sendBusArrivalTimings(123456, emptyResponse);

      expect(sendMessage).toHaveBeenCalledTimes(1);
      expect(sendMessage.mock.calls[0][0]).toContain(
        encodeURIComponent(constants.MSG_NO_BUSES),
      );
    });

    it('should handle invalid bus stop code', () => {
      const invalidResponse = {
        'odata.metadata': 'metadata',
        BusStopCode: '13579',
      };

      sendBusArrivalTimings(123456, invalidResponse);

      expect(sendMessage).toHaveBeenCalledTimes(1);
      expect(sendMessage.mock.calls[0][0]).toContain(
        encodeURIComponent(constants.MSG_INVALID_BUS_CODE),
      );
    });
  });
});
