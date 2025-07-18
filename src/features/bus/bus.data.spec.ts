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
    describe('when updating existing user data', () => {
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

      it('should handle special characters in bus stop query', () => {
        const userId = 22222;
        const userFirstName = 'Alice';
        const busStopQueried = '12345@#$%';

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

    it('should handle empty user first name', () => {
      const userId = 33333;
      const userFirstName = '';
      const busStopQueried = 'empty-name';

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

    it('should handle very long bus stop query', () => {
      const userId = 44444;
      const userFirstName = 'LongUser';
      const busStopQueried = 'A'.repeat(1000);

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

    it('should handle unicode characters in names', () => {
      const userId = 55555;
      const userFirstName = 'José María';
      const busStopQueried = 'unicode-test';

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

  describe('getLastBusStopQuery', () => {
    describe('when user data exists', () => {
      it('should return the last queried bus stop for existing user', () => {
        const userId = 12345;
        const userFirstName = 'John';
        const busStopQueried = '83139';

        // First update the data
        underTest.updateLastBusStopQuery(userId, userFirstName, busStopQueried);

        // Then retrieve it
        const result = underTest.getLastBusStopQuery(userId);

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

        const result1 = underTest.getLastBusStopQuery(userId1);
        expect(result1).toEqual(busStopQueried);

        const result2 = underTest.getLastBusStopQuery(userId2);
        expect(result2).toBeNull();
      });
    });

    describe('when user data does not exist', () => {
      it('should return null for non-existent user', () => {
        const userId = 99999;

        const result = underTest.getLastBusStopQuery(userId);

        expect(result).toBeNull();
      });

      it('should handle very large user ID', () => {
        const userId = Number.MAX_SAFE_INTEGER;

        const result = underTest.getLastBusStopQuery(userId);

        expect(result).toBeNull();
      });

      it('should handle decimal user ID (should be converted to string)', () => {
        const userId = 123.45;

        const result = underTest.getLastBusStopQuery(userId);

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

      const retrieveResult = underTest.getLastBusStopQuery(userId);
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

      const retrieveResult = underTest.getLastBusStopQuery(userId);
      expect(retrieveResult).toEqual(busStop2);
    });

    it('should handle multiple users with different data', () => {
      const user1 = { id: 11111, name: 'User1', busStop: 'stop1' };
      const user2 = { id: 22222, name: 'User2', busStop: 'stop2' };
      const user3 = { id: 33333, name: 'User3', busStop: 'stop3' };

      underTest.updateLastBusStopQuery(user1.id, user1.name, user1.busStop);
      underTest.updateLastBusStopQuery(user2.id, user2.name, user2.busStop);
      underTest.updateLastBusStopQuery(user3.id, user3.name, user3.busStop);

      const result1 = underTest.getLastBusStopQuery(user1.id);
      const result2 = underTest.getLastBusStopQuery(user2.id);
      const result3 = underTest.getLastBusStopQuery(user3.id);

      expect(result1).toEqual(user1.busStop);
      expect(result2).toEqual(user2.busStop);
      expect(result3).toEqual(user3.busStop);
    });

    it('should handle data persistence across operations', () => {
      const userId = 44444;
      const userFirstName = 'PersistentUser';
      const busStopQueried = 'persistent-stop';

      underTest.updateLastBusStopQuery(userId, userFirstName, busStopQueried);

      const immediateResult = underTest.getLastBusStopQuery(userId);
      expect(immediateResult).toEqual(busStopQueried);

      const newBusData = new BusData();
      const persistentResult = newBusData.getLastBusStopQuery(userId);
      expect(persistentResult).toEqual(busStopQueried);
    });

    it('should handle concurrent operations on different users', () => {
      const users = [
        { id: 10001, name: 'Concurrent1', busStop: 'concurrent1' },
        { id: 10002, name: 'Concurrent2', busStop: 'concurrent2' },
        { id: 10003, name: 'Concurrent3', busStop: 'concurrent3' },
      ];

      users.forEach((user) => {
        underTest.updateLastBusStopQuery(user.id, user.name, user.busStop);
      });

      users.forEach((user) => {
        const result = underTest.getLastBusStopQuery(user.id);
        expect(result).toEqual(user.busStop);
      });
    });
  });
});
