import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';
import { FriendData } from './friend.data';

describe('FriendDataService', () => {
  let underTest: FriendData;

  beforeAll(() => {});

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

  describe('integration scenarios', () => {
    it('should handle multiple friend relationships correctly', () => {
      underTest.addFriend(1, 2);
      underTest.addFriend(1, 3);
      underTest.addFriend(2, 4);
      underTest.addFriend(3, 5);

      expect(underTest.getFriends(1).sort()).toEqual([2, 3]);
      expect(underTest.getFriends(2).sort()).toEqual([1, 4]);
      expect(underTest.getFriends(3).sort()).toEqual([1, 5]);
      expect(underTest.getFriends(4).sort()).toEqual([2]);
      expect(underTest.getFriends(5).sort()).toEqual([3]);
    });

    it('should maintain data consistency after add and remove operations', () => {
      underTest.addFriend(1, 2);
      underTest.addFriend(1, 3);

      expect(underTest.areFriends(1, 2)).toBe(true);
      expect(underTest.areFriends(1, 3)).toBe(true);

      underTest.removeFriend(1, 2);

      expect(underTest.areFriends(1, 2)).toBe(false);
      expect(underTest.areFriends(1, 3)).toBe(true);
      expect(underTest.getFriends(1)).toEqual([3]);
    });

    it('should handle edge cases with user ID ordering', () => {
      underTest.addFriend(5, 1);
      underTest.addFriend(10, 2);

      expect(underTest.areFriends(1, 5)).toBe(true);
      expect(underTest.areFriends(2, 10)).toBe(true);
      expect(underTest.getFriends(1)).toEqual([5]);
      expect(underTest.getFriends(2)).toEqual([10]);
    });

    it('should support complex friend network scenarios', () => {
      underTest.addFriend(1, 2);
      underTest.addFriend(2, 3);
      underTest.addFriend(3, 4);
      underTest.addFriend(4, 5);

      const user1Friends = underTest.getFriends(1);
      const user3Friends = underTest.getFriends(3);

      expect(user1Friends).toContain(2);
      expect(user3Friends).toContain(2);
      expect(user3Friends).toContain(4);

      underTest.removeFriend(2, 3);

      expect(underTest.areFriends(2, 3)).toBe(false);
      expect(underTest.areFriends(1, 2)).toBe(true);
      expect(underTest.areFriends(3, 4)).toBe(true);
    });
  });
});
