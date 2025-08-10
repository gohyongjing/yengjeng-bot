import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';
import { FriendData } from './friend.data';
import { MockLogger } from '@core/googleAppsScript';
import { MockGoogleAppsScript } from '@core/googleAppsScript/googleAppsScript.mock';

describe('FriendDataService', () => {
  let underTest: FriendData;

  beforeAll(() => {
    global.Logger = MockLogger;
    global.GoogleAppsScript = MockGoogleAppsScript;
  });

  beforeEach(() => {
    global.SpreadsheetApp = createMockSpreadsheetApp();
    underTest = new FriendData();
  });

  describe('getFriends', () => {
    it('should return empty array for user with no friends', () => {
      const result = underTest.getFriends(1);
      expect(result).toEqual([]);
    });

    it('should return friend IDs for user with friends', () => {
      underTest.addFriend(1, 2);
      underTest.addFriend(1, 3);

      const result = underTest.getFriends(1);
      expect(result).toEqual([2, 3]);
    });

    it('should return friend IDs when user is the friendId', () => {
      underTest.addFriend(5, 1);

      const result = underTest.getFriends(1);
      expect(result).toEqual([5]);
    });
  });

  describe('addFriend', () => {
    it('should add a new friend relationship', () => {
      const friend = underTest.addFriend(1, 2);
      expect(friend.userId).toBe(1);
      expect(friend.friendId).toBe(2);
    });
  });

  describe('removeFriend', () => {
    it('should remove existing friend relationship', () => {
      underTest.addFriend(1, 2);
      const result = underTest.removeFriend(1, 2);
      expect(result).toBe(true);

      const friends = underTest.getFriends(1);
      expect(friends).not.toContain(2);
    });

    it('should return false for non-existent relationship', () => {
      const result = underTest.removeFriend(1, 2);
      expect(result).toBe(false);
    });
  });

  describe('areFriends', () => {
    it('should return true for existing friends', () => {
      underTest.addFriend(1, 2);
      const result = underTest.areFriends(1, 2);
      expect(result).toBe(true);
    });

    it('should return false for non-friends', () => {
      const result = underTest.areFriends(1, 2);
      expect(result).toBe(false);
    });

    it('should work in both directions', () => {
      underTest.addFriend(1, 2);
      const result1 = underTest.areFriends(1, 2);
      const result2 = underTest.areFriends(2, 1);
      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });
  });
});

//TODO: Add integration tests
