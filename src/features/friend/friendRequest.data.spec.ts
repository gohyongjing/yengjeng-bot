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
    it('should delete the request successfully', () => {
      friendRequestData.setFriendRequest({
        senderId: 1,
        recipientId: 2,
        status: 'pending',
      });

      const result = friendRequestData.deleteFriendRequest(1, 2);
      expect(result).toBe(true);
    });

    it('should return false for non-existent request', () => {
      const result = friendRequestData.deleteFriendRequest(1, 2);
      expect(result).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should read updated friend request after update', () => {
      friendRequestData.setFriendRequest({
        senderId: 100,
        recipientId: 200,
        status: 'pending',
      });

      let readRequest = friendRequestData.getFriendRequest(100, 200);
      expect(readRequest).not.toBeNull();
      expect(readRequest?.senderId).toBe(100);
      expect(readRequest?.recipientId).toBe(200);
      expect(readRequest?.status).toBe('pending');

      friendRequestData.setFriendRequest({
        senderId: 100,
        recipientId: 200,
        status: 'rejected',
      });

      readRequest = friendRequestData.getFriendRequest(100, 200);
      expect(readRequest?.senderId).toBe(100);
      expect(readRequest?.recipientId).toBe(200);
      expect(readRequest?.status).toBe('rejected');
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

    it('should handle multiple friend requests independently', () => {
      friendRequestData.setFriendRequest({
        senderId: 1,
        recipientId: 2,
        status: 'pending',
      });

      friendRequestData.setFriendRequest({
        senderId: 3,
        recipientId: 4,
        status: 'rejected',
      });

      friendRequestData.setFriendRequest({
        senderId: 5,
        recipientId: 6,
        status: 'rejected',
      });

      const read1 = friendRequestData.getFriendRequest(1, 2);
      const read2 = friendRequestData.getFriendRequest(3, 4);
      const read3 = friendRequestData.getFriendRequest(5, 6);

      expect(read1?.status).toBe('pending');
      expect(read2?.status).toBe('rejected');
      expect(read3?.status).toBe('rejected');
    });
  });
});
