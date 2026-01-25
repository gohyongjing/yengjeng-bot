import { FriendService } from './friend.service';
import { Command } from '@core/util/command';
import {
  MockTelegramUrlFetchApp,
  MockUser,
  MockUser2,
  sendMessage,
} from '@core/telegram/telegram.mock';
import { requestRecipient, requestSender, setupState } from './friend.mock';

describe('FriendService', () => {
  let underTest: FriendService;

  beforeAll(() => {
    global.UrlFetchApp = MockTelegramUrlFetchApp;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('help', () => {
    it('should return help text', () => {
      global.SpreadsheetApp = setupState.noRequests();
      underTest = new FriendService();

      const help = underTest.help();
      expect(help).toContain('FRIEND ADD');
      expect(help).toContain('FRIEND REMOVE');
      expect(help).toContain('FRIEND LIST');
    });
  });

  describe('FRIEND ADD command', () => {
    describe('when sender user not found in database', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.senderNotFound();
        underTest = new FriendService();
      });

      it('should handle gracefully when sender is not in database', () => {
        const command = new Command(`/friend add ${MockUser2.username}`);
        underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls.length).toBeGreaterThan(0);
        const lastCallIndex = sendMessage.mock.calls.length - 1;
        const options = sendMessage.mock.calls[lastCallIndex][1];
        expect(options).toBeDefined();
        if (!options) throw new Error('Options should be defined');
        const payload = JSON.parse(options.payload?.toString() ?? '');
        expect(payload.text).toContain(
          'You are not registered in the system\\. Please talk to the bot first to create your account\\.',
        );
      });
    });

    describe('when recipient user not found in database', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.recipientNotFound();
        underTest = new FriendService();
      });

      it('should return error message', () => {
        const command = new Command('/friend add nonexistent_user');
        underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls.length).toBeGreaterThan(0);
        const options = sendMessage.mock.calls[0][1];
        expect(options).toBeDefined();
        if (!options) throw new Error('Options should be defined');
        const payload = JSON.parse(options.payload?.toString() ?? '');
        const text = payload.text;
        expect(text).toContain('User');
        expect(text).toContain('nonexistent');
        expect(text).toContain('found');
      });
    });

    describe('when no requests exist between users', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.noRequests();
        underTest = new FriendService();
      });

      it('should send friend request', () => {
        const command = new Command(`/friend add ${MockUser2.username}`);
        underTest.processCommand(command, MockUser, 123);

        expect(checkFriendRequestSent(sendMessage.mock.calls)).toBeTruthy();
      });
    });

    describe('when sender already has pending request to recipient', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.senderPendingRequest();
        underTest = new FriendService();
      });

      it('should return error message', () => {
        const command = new Command(`/friend add ${MockUser2.username}`);
        underTest.processCommand(command, MockUser, 123);

        expect(
          checkFriendRequestNotSentDueToExistingRequest(sendMessage.mock.calls),
        ).toBeTruthy();
      });
    });

    describe('when recipient has pending request to sender', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.recipientPendingRequest();
        underTest = new FriendService();
      });

      it('should accept the friend request', () => {
        const command = new Command(`/friend add ${MockUser2.username}`);
        underTest.processCommand(command, MockUser, 123);

        expect(checkFriendRequestAccepted(sendMessage.mock.calls)).toBeTruthy();
      });
    });

    describe('when sender has cancelled request to recipient', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.senderCancelledRequest();
        underTest = new FriendService();
      });

      it('should reactivate the request without notifying the recipient', () => {
        const command = new Command('/friend add janesmith');
        underTest.processCommand(command, MockUser, 123);

        expect(
          checkFriendRequestSent(sendMessage.mock.calls, false),
        ).toBeTruthy();
      });
    });

    describe('when recipient has cancelled request to sender', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.recipientCancelledRequest();
        underTest = new FriendService();
      });

      it('should delete old request and create new one', () => {
        const command = new Command(`/friend add ${MockUser2.username}`);
        underTest.processCommand(command, MockUser, 123);

        expect(checkFriendRequestSent(sendMessage.mock.calls)).toBeTruthy();
      });
    });

    describe('when sender has rejected request from recipient', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.senderRejectedRequest();
        underTest = new FriendService();
      });

      it('should send a new friend request', () => {
        const command = new Command(`/friend add ${MockUser2.username}`);
        underTest.processCommand(command, MockUser, 123);

        expect(checkFriendRequestSent(sendMessage.mock.calls)).toBeTruthy();
      });
    });

    describe('when recipient has rejected request from sender', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.recipientRejectedRequest();
        underTest = new FriendService();
      });

      it('should return error message', () => {
        const command = new Command(`/friend add ${MockUser2.username}`);
        underTest.processCommand(command, MockUser, 123);

        expect(
          checkFriendRequestNotSentDueToExistingRequest(sendMessage.mock.calls),
        ).toBeTruthy();
      });
    });

    describe('when users are already friends', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.alreadyFriends();
        underTest = new FriendService();
      });

      it('should return error message', () => {
        const command = new Command(`/friend add ${MockUser2.username}`);
        underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const options = sendMessage.mock.calls[0][1];
        expect(options).toBeDefined();
        if (!options) throw new Error('Options should be defined');
        const payload = JSON.parse(options.payload?.toString() ?? '');
        const text = payload.text;
        expect(text).toContain('already');
        expect(text).toContain('friends');
      });
    });

    describe('edge cases', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.noRequests();
        underTest = new FriendService();
      });

      it('should handle command without username', () => {
        const command = new Command('/friend add');
        underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const options = sendMessage.mock.calls[0][1];
        expect(options).toBeDefined();
        if (!options) throw new Error('Options should be defined');
        const payload = JSON.parse(options.payload?.toString() ?? '');
        expect(payload.text).toContain(
          'Please provide a username to add as friend',
        );
      });

      it('should prevent self-friending', () => {
        const command = new Command(`/friend add ${MockUser.username}`);
        underTest.processCommand(command, MockUser, MockUser.id);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const options = sendMessage.mock.calls[0][1];
        expect(options).toBeDefined();
        if (!options) throw new Error('Options should be defined');
        const payload = JSON.parse(options.payload?.toString() ?? '');
        expect(payload.text).toContain('You cannot add yourself as a friend');
      });
    });
  });

  describe('FRIEND REMOVE command', () => {
    describe('when sender user not found in database', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.senderNotFound();
        underTest = new FriendService();
      });

      it('should handle gracefully when sender is not in database', () => {
        const command = new Command(`/friend remove ${MockUser2.username}`);
        underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const options = sendMessage.mock.calls[0][1];
        expect(options).toBeDefined();
        if (!options) throw new Error('Options should be defined');
        const payload = JSON.parse(options.payload?.toString() ?? '');
        expect(payload.text).toContain(
          'You are not registered in the system\\. Please talk to the bot first to create your account\\.',
        );
      });
    });

    describe('when recipient user not found in database', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.recipientNotFound();
        underTest = new FriendService();
      });

      it('should return error message', () => {
        const command = new Command('/friend remove nonexistent_user');
        underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const options = sendMessage.mock.calls[0][1];
        expect(options).toBeDefined();
        if (!options) throw new Error('Options should be defined');
        const payload = JSON.parse(options.payload?.toString() ?? '');
        expect(payload.text).toContain(
          "User \\'nonexistent\\_user\\' not found",
        );
      });
    });

    describe('when no requests exist between users', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.noRequests();
        underTest = new FriendService();
      });

      it('should return error message', () => {
        const command = new Command(`/friend remove ${MockUser2.username}`);
        underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const options = sendMessage.mock.calls[0][1];
        expect(options).toBeDefined();
        if (!options) throw new Error('Options should be defined');
        const payload = JSON.parse(options.payload?.toString() ?? '');
        expect(payload.text).toContain(
          'No friend relationship or pending request found with janesmith',
        );
      });
    });

    describe('when sender has pending request to recipient', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.senderPendingRequest();
        underTest = new FriendService();
      });

      it('should cancel the friend request', () => {
        const command = new Command(`/friend remove ${MockUser2.username}`);
        underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const options = sendMessage.mock.calls[0][1];
        expect(options).toBeDefined();
        if (!options) throw new Error('Options should be defined');
        const payload = JSON.parse(options.payload?.toString() ?? '');
        expect(payload.text).toContain(
          'You have cancelled your friend request to janesmith',
        );
      });
    });

    describe('when recipient has pending request to sender', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.recipientPendingRequest();
        underTest = new FriendService();
      });

      it('should reject the friend request', () => {
        const command = new Command(`/friend remove ${MockUser2.username}`);
        underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const options = sendMessage.mock.calls[0][1];
        expect(options).toBeDefined();
        if (!options) throw new Error('Options should be defined');
        const payload = JSON.parse(options.payload?.toString() ?? '');
        expect(payload.text).toContain(
          'You have rejected the friend request from janesmith',
        );
      });
    });

    describe('when users are already friends', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.alreadyFriends();
        underTest = new FriendService();
      });

      it('should remove the friendship', () => {
        const command = new Command(`/friend remove ${MockUser2.username}`);
        underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const options = sendMessage.mock.calls[0][1];
        expect(options).toBeDefined();
        if (!options) throw new Error('Options should be defined');
        const payload = JSON.parse(options.payload?.toString() ?? '');
        expect(payload.text).toContain(
          'You have removed janesmith from your friends list',
        );
      });
    });

    describe('edge cases', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.noRequests();
        underTest = new FriendService();
      });

      it('should handle command without username', () => {
        const command = new Command('/friend remove');
        underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const options = sendMessage.mock.calls[0][1];
        expect(options).toBeDefined();
        if (!options) throw new Error('Options should be defined');
        const payload = JSON.parse(options.payload?.toString() ?? '');
        expect(payload.text).toContain('Please provide a username to remove');
      });
    });
  });

  describe('FRIEND LIST command', () => {
    describe('when sender user not found in database', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.senderNotFound();
        underTest = new FriendService();
      });

      it('should handle gracefully when sender is not in database', () => {
        const command = new Command('/friend list');
        underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const options = sendMessage.mock.calls[0][1];
        expect(options).toBeDefined();
        if (!options) throw new Error('Options should be defined');
        const payload = JSON.parse(options.payload?.toString() ?? '');
        expect(payload.text).toContain(
          'You are not registered in the system\\. Please talk to the bot first to create your account\\.',
        );
      });
    });

    describe('when user has no friends', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.noRequests();
        underTest = new FriendService();
      });

      it('should return no friends message', () => {
        const command = new Command('/friend list');
        underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const options = sendMessage.mock.calls[0][1];
        expect(options).toBeDefined();
        if (!options) throw new Error('Options should be defined');
        const payload = JSON.parse(options.payload?.toString() ?? '');
        expect(payload.text).toContain('You have no friends yet');
      });
    });

    describe('when user has friends', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.alreadyFriends();
        underTest = new FriendService();
      });

      it('should return friends list', () => {
        const command = new Command('/friend list');
        underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const options = sendMessage.mock.calls[0][1];
        expect(options).toBeDefined();
        if (!options) throw new Error('Options should be defined');
        const payload = JSON.parse(options.payload?.toString() ?? '');
        expect(payload.text).toContain('Your Friends');
        expect(payload.text).toContain(requestRecipient.username);
      });
    });
  });

  describe('Unknown commands', () => {
    beforeEach(() => {
      global.SpreadsheetApp = setupState.noRequests();
      underTest = new FriendService();
    });

    it('should handle unknown command', () => {
      const command = new Command('/friend unknown');
      underTest.processCommand(command, MockUser, 123);

      expect(sendMessage.mock.calls).toHaveLength(1);
      const options = sendMessage.mock.calls[0][1];
      expect(options).toBeDefined();
      if (!options) throw new Error('Options should be defined');
      const payload = JSON.parse(options.payload?.toString() ?? '');
      const text = payload.text;
      expect(text).toContain('UNKNOWN');
      expect(text).toContain('FRIEND ADD');
      expect(text).toContain('FRIEND REMOVE');
      expect(text).toContain('FRIEND LIST');
    });
  });

  describe('Complex workflow scenarios', () => {
    beforeEach(() => {
      global.SpreadsheetApp = setupState.multipleUsers();
      underTest = new FriendService();
    });

    it('should handle complete friend workflow: add, list, then remove', () => {
      const addCommand = new Command(`/friend add ${MockUser2.username}`);
      const listCommand = new Command('/friend list');
      const removeCommand = new Command(`/friend remove ${MockUser2.username}`);

      underTest.processCommand(addCommand, MockUser, 123);
      underTest.processCommand(listCommand, MockUser, 123);
      underTest.processCommand(removeCommand, MockUser, 123);
      underTest.processCommand(listCommand, MockUser, 123);

      expect(sendMessage.mock.calls).toHaveLength(5);

      const payload0 = JSON.parse(
        sendMessage.mock.calls[0][1]?.payload?.toString() ?? '',
      );
      expect(payload0?.text).toContain('Friend request sent');

      const payload1 = JSON.parse(
        sendMessage.mock.calls[1][1]?.payload?.toString() ?? '',
      );
      expect(payload1.text).toContain('wants to be your friend');

      const payload2 = JSON.parse(
        sendMessage.mock.calls[2][1]?.payload?.toString() ?? '',
      );
      expect(payload2.text).toContain('You have no friends yet');

      const payload3 = JSON.parse(
        sendMessage.mock.calls[3][1]?.payload?.toString() ?? '',
      );
      expect(payload3.text).toContain('You have cancelled your friend request');

      const payload4 = JSON.parse(
        sendMessage.mock.calls[4][1]?.payload?.toString() ?? '',
      );
      expect(payload4.text).toContain('You have no friends yet');
    });

    it('should handle multiple friend operations in sequence with different users', () => {
      const addCommand1 = new Command(`/friend add ${MockUser2.username}`);
      const addCommand2 = new Command(`/friend add ${MockUser.username}`);
      const listCommand1 = new Command('/friend list');
      const listCommand2 = new Command('/friend list');

      underTest.processCommand(addCommand1, MockUser, 123);
      underTest.processCommand(addCommand2, MockUser2, 123);
      underTest.processCommand(listCommand1, MockUser, 123);
      underTest.processCommand(listCommand2, MockUser2, 123);

      expect(sendMessage.mock.calls).toHaveLength(6);

      const payload0 = JSON.parse(
        sendMessage.mock.calls[0][1]?.payload?.toString() ?? '',
      );
      expect(payload0.text).toContain('Friend request sent');

      const payload1 = JSON.parse(
        sendMessage.mock.calls[1][1]?.payload?.toString() ?? '',
      );
      expect(payload1.text).toContain('wants to be your friend');

      const payload2 = JSON.parse(
        sendMessage.mock.calls[2][1]?.payload?.toString() ?? '',
      );
      expect(payload2.text).toContain('You are now friends with');

      const payload3 = JSON.parse(
        sendMessage.mock.calls[3][1]?.payload?.toString() ?? '',
      );
      expect(payload3.text).toContain('accepted your friend request');

      const payload4 = JSON.parse(
        sendMessage.mock.calls[4][1]?.payload?.toString() ?? '',
      );
      expect(payload4.text).toContain('Your Friends');
      expect(payload4.text).toContain(requestRecipient.username);

      const payload5 = JSON.parse(
        sendMessage.mock.calls[5][1]?.payload?.toString() ?? '',
      );
      expect(payload5.text).toContain('Your Friends');
      expect(payload5.text).toContain(requestSender.username);
    });

    it('should handle request cancellation and reactivation', () => {
      const addCommand = new Command(`/friend add ${MockUser2.username}`);
      underTest.processCommand(addCommand, MockUser, 123);

      const removeCommand = new Command(`/friend remove ${MockUser2.username}`);
      underTest.processCommand(removeCommand, MockUser, 123);

      const addCommand2 = new Command(`/friend add ${MockUser2.username}`);
      underTest.processCommand(addCommand2, MockUser, 123);

      expect(sendMessage.mock.calls).toHaveLength(4);

      const payload0 = JSON.parse(
        sendMessage.mock.calls[0][1]?.payload?.toString() ?? '',
      );
      expect(payload0.text).toContain('Friend request sent');

      const payload1 = JSON.parse(
        sendMessage.mock.calls[1][1]?.payload?.toString() ?? '',
      );
      expect(payload1.text).toContain('wants to be your friend');

      const payload2 = JSON.parse(
        sendMessage.mock.calls[2][1]?.payload?.toString() ?? '',
      );
      expect(payload2.text).toContain('You have cancelled your friend request');

      const payload3 = JSON.parse(
        sendMessage.mock.calls[3][1]?.payload?.toString() ?? '',
      );
      expect(payload3.text).toContain('Friend request sent');
    });

    it('should handle request rejection and new request creation', () => {
      const addCommand = new Command(`/friend add ${MockUser2.username}`);
      underTest.processCommand(addCommand, MockUser, MockUser.id);

      const removeCommand = new Command(`/friend remove ${MockUser.username}`);
      underTest.processCommand(removeCommand, MockUser2, MockUser2.id);

      const addCommand2 = new Command(`/friend add ${MockUser.username}`);
      underTest.processCommand(addCommand2, MockUser2, MockUser2.id);

      expect(sendMessage.mock.calls).toHaveLength(5);

      const payload0 = JSON.parse(
        sendMessage.mock.calls[0][1]?.payload?.toString() ?? '',
      );
      expect(payload0.text).toContain('Friend request sent');

      const payload1 = JSON.parse(
        sendMessage.mock.calls[1][1]?.payload?.toString() ?? '',
      );
      expect(payload1.text).toContain('wants to be your friend');

      const payload2 = JSON.parse(
        sendMessage.mock.calls[2][1]?.payload?.toString() ?? '',
      );
      expect(payload2.text).toContain(
        'You have rejected the friend request from',
      );

      const payload3 = JSON.parse(
        sendMessage.mock.calls[3][1]?.payload?.toString() ?? '',
      );
      expect(payload3.text).toContain('Friend request sent');

      const payload4 = JSON.parse(
        sendMessage.mock.calls[4][1]?.payload?.toString() ?? '',
      );
      expect(payload4.text).toContain('wants to be your friend');
    });
  });

  describe('Error handling and resilience', () => {
    beforeEach(() => {
      global.SpreadsheetApp = setupState.noRequests();
      underTest = new FriendService();
    });

    it('should handle error scenarios and continue processing subsequent commands', () => {
      const invalidCommand = new Command('/friend add');
      const validCommand = new Command('/friend list');
      const removeCommand = new Command('/friend remove nonexistent');

      underTest.processCommand(invalidCommand, MockUser, 123);
      underTest.processCommand(validCommand, MockUser, 123);
      underTest.processCommand(removeCommand, MockUser, 123);

      expect(sendMessage.mock.calls.length).toBeGreaterThan(2);

      const payload0 = JSON.parse(
        sendMessage.mock.calls[0][1]?.payload?.toString() ?? '',
      );
      expect(payload0.text).toContain(
        'Please provide a username to add as friend',
      );

      const payload1 = JSON.parse(
        sendMessage.mock.calls[1][1]?.payload?.toString() ?? '',
      );
      expect(payload1.text).toContain('You have no friends yet');

      const payload2 = JSON.parse(
        sendMessage.mock.calls[2][1]?.payload?.toString() ?? '',
      );
      expect(payload2.text).toContain("User \\'nonexistent\\' not found");
    });
  });

  function checkFriendRequestSent(
    calls: [
      url: string,
      options?: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions | undefined,
    ][],
    includeRecipientNotification: boolean = true,
  ) {
    expect(calls).toHaveLength(includeRecipientNotification ? 2 : 1);
    const senderCall = calls.find((call) => {
      const options = call[1];
      if (!options?.payload) return false;
      const payload = JSON.parse(options.payload.toString());
      return payload.chat_id === requestSender.userId;
    });
    expect(senderCall).toBeDefined();
    if (!senderCall?.[1]) throw new Error('Options should be defined');
    const senderPayload = JSON.parse(senderCall[1]?.payload?.toString() ?? '');
    expect(senderPayload.text).toContain('Friend request sent');
    expect(senderPayload.text).toContain(requestRecipient.username);

    if (includeRecipientNotification) {
      const recipientCall = calls.find((call) => {
        const options = call[1];
        if (!options?.payload) return false;
        const payload = JSON.parse(options.payload.toString());
        return payload.chat_id === requestRecipient.userId;
      });
      expect(recipientCall).toBeDefined();
      if (!recipientCall?.[1]) throw new Error('Options should be defined');
      const recipientPayload = JSON.parse(
        recipientCall[1]?.payload?.toString() ?? '',
      );
      expect(recipientPayload.text).toContain(requestSender.username);
      expect(recipientPayload.text).toContain('wants to be your friend');
    }

    return true;
  }

  function checkFriendRequestNotSentDueToExistingRequest(
    calls: [
      url: string,
      options?: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions | undefined,
    ][],
  ) {
    expect(calls).toHaveLength(1);
    const options = calls[0][1];
    expect(options).toBeDefined();
    if (!options?.payload) throw new Error('Options should be defined');
    const payload = JSON.parse(options.payload.toString());
    expect(payload.chat_id).toBe(requestSender.userId);
    expect(payload.text).toContain(
      'You already have a pending friend request to',
    );
    expect(payload.text).toContain(requestRecipient.username);
    return true;
  }

  function checkFriendRequestAccepted(
    calls: [
      url: string,
      options?: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions | undefined,
    ][],
  ) {
    expect(calls).toHaveLength(2);
    const senderCall = calls.find((call) => {
      const options = call[1];
      if (!options?.payload) return false;
      const payload = JSON.parse(options.payload.toString());
      return payload.chat_id === requestSender.userId;
    });
    expect(senderCall).toBeDefined();
    if (!senderCall?.[1]) throw new Error('Options should be defined');
    const senderPayload = JSON.parse(senderCall[1]?.payload?.toString() ?? '');
    expect(senderPayload.text).toContain('You are now friends with');
    expect(senderPayload.text).toContain(requestRecipient.username);

    const recipientCall = calls.find((call) => {
      const options = call[1];
      if (!options?.payload) return false;
      const payload = JSON.parse(options.payload.toString());
      return payload.chat_id === requestRecipient.userId;
    });
    expect(recipientCall).toBeDefined();
    if (!recipientCall?.[1]) throw new Error('Options should be defined');
    const recipientPayload = JSON.parse(
      recipientCall[1]?.payload?.toString() ?? '',
    );
    expect(recipientPayload.text).toContain(requestSender.username);
    expect(recipientPayload.text).toContain('accepted your friend request');
    return true;
  }
});
