import { FriendRequestData } from './friendRequest.data';
import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';

describe('FriendRequestData', () => {
  let friendRequestData: FriendRequestData;

  beforeEach(() => {
    global.SpreadsheetApp = createMockSpreadsheetApp();
    friendRequestData = new FriendRequestData();
  });

  describe('getFriendRequest', () => {
    it('should return null for non-existent request', () => {
      const result = friendRequestData.getFriendRequest(1, 2);
      expect(result).toBeNull();
    });
  });

  describe('setFriendRequest', () => {
    it('should create a new friend request', () => {
      const request = friendRequestData.setFriendRequest({
        senderId: 1,
        recipientId: 2,
        status: 'pending',
      });

      expect(request.senderId).toBe(1);
      expect(request.recipientId).toBe(2);
      expect(request.status).toBe('pending');
      expect(request.id).toBe('1-2');
    });

    it('should update existing friend request', () => {
      friendRequestData.setFriendRequest({
        senderId: 1,
        recipientId: 2,
        status: 'pending',
      });

      const updated = friendRequestData.setFriendRequest({
        senderId: 1,
        recipientId: 2,
        status: 'rejected',
      });
      expect(updated.status).toBe('rejected');
    });
  });

  describe('deleteFriendRequest', () => {
    it('should delete the request row', () => {
      friendRequestData.setFriendRequest({
        senderId: 1,
        recipientId: 2,
        status: 'pending',
      });

      const result = friendRequestData.deleteFriendRequest(1, 2);
      expect(result).toBe(true);

      const request = friendRequestData.getFriendRequest(1, 2);
      expect(request).toBeNull();
    });

    it('should return false for non-existent request', () => {
      const result = friendRequestData.deleteFriendRequest(1, 2);
      expect(result).toBe(false);
    });
  });
});

//TODO: Add integration tests
