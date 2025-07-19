import { BusData } from './bus.data';
import { MockLogger } from '@core/googleAppsScript';
import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';

// jest.mock('@core/config', () => ({
//   ConfigService: jest.fn().mockImplementation(() => ({
//     get: jest.fn().mockReturnValue('test-spreadsheet-id'),
//   })),
// }));

describe('BusData', () => {
  let underTest: BusData;

  beforeAll(() => {
    global.Logger = MockLogger;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.SpreadsheetApp = createMockSpreadsheetApp();
    underTest = new BusData();
  });

  describe('updateLastBusStopQuery', () => {
    it('should update existing row with new bus stop query data', () => {
      const userId = 12345;
      const userFirstName = 'John';
      const busStopQueried = '83139';

      const result = underTest.updateLastBusStopQuery(
        userId,
        userFirstName,
        busStopQueried,
      );

      expect(result).toEqual([
        userId,
        userFirstName,
        busStopQueried,
        expect.any(Date),
      ]);
    });

    it('should handle different user data types', () => {
      const userId = 67890;
      const userFirstName = 'Jane';
      const busStopQueried = 'ABC';

      const result = underTest.updateLastBusStopQuery(
        userId,
        userFirstName,
        busStopQueried,
      );

      expect(result).toEqual([
        userId,
        userFirstName,
        busStopQueried,
        expect.any(Date),
      ]);
    });

    it('should update with empty bus stop query', () => {
      const userId = 11111;
      const userFirstName = 'Bob';
      const busStopQueried = '';

      const result = underTest.updateLastBusStopQuery(
        userId,
        userFirstName,
        busStopQueried,
      );

      expect(result).toEqual([
        userId,
        userFirstName,
        busStopQueried,
        expect.any(Date),
      ]);
    });
  });

  describe('readLastBusStopQuery', () => {
    describe('when user data exists', () => {
      it('should return the last queried bus stop for existing user', () => {
        const userId = 12345;
        const userFirstName = 'John';
        const busStopQueried = '83139';

        // First update the data
        underTest.updateLastBusStopQuery(userId, userFirstName, busStopQueried);

        // Then retrieve it
        const result = underTest.readLastBusStopQuery(userId);

        expect(result).toEqual(busStopQueried);
      });

      it('should handle different user IDs', () => {
        const userId1 = 11111;
        const userId2 = 22222;
        const userFirstName = 'TestUser';
        const busStopQueried = 'test-stop';

        underTest.updateLastBusStopQuery(
          userId1,
          userFirstName,
          busStopQueried,
        );

        const result1 = underTest.readLastBusStopQuery(userId1);
        expect(result1).toEqual(busStopQueried);

        const result2 = underTest.readLastBusStopQuery(userId2);
        expect(result2).toBeNull();
      });
    });

    describe('when user data does not exist', () => {
      it('should return null for non-existent user', () => {
        const userId = 99999;

        const result = underTest.readLastBusStopQuery(userId);

        expect(result).toBeNull();
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete workflow: update and retrieve', () => {
      const userId = 77777;
      const userFirstName = 'IntegrationUser';
      const busStopQueried = 'integration-test';

      const updateResult = underTest.updateLastBusStopQuery(
        userId,
        userFirstName,
        busStopQueried,
      );
      expect(updateResult).toEqual([
        userId,
        userFirstName,
        busStopQueried,
        expect.any(Date),
      ]);

      const retrieveResult = underTest.readLastBusStopQuery(userId);
      expect(retrieveResult).toEqual(busStopQueried);
    });

    it('should handle multiple operations on same user', () => {
      const userId = 88888;
      const userFirstName = 'MultiUser';

      const busStop1 = 'first-stop';
      const result1 = underTest.updateLastBusStopQuery(
        userId,
        userFirstName,
        busStop1,
      );
      expect(result1).toEqual([
        userId,
        userFirstName,
        busStop1,
        expect.any(Date),
      ]);

      const busStop2 = 'second-stop';
      const result2 = underTest.updateLastBusStopQuery(
        userId,
        userFirstName,
        busStop2,
      );
      expect(result2).toEqual([
        userId,
        userFirstName,
        busStop2,
        expect.any(Date),
      ]);

      const retrieveResult = underTest.readLastBusStopQuery(userId);
      expect(retrieveResult).toEqual(busStop2);
    });
  });
});
