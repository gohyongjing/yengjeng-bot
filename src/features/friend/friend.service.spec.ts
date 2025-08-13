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

      it('should handle gracefully when sender is not in database', async () => {
        const command = new Command(`/friend add ${MockUser2.username}`);
        await underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls.length).toBeGreaterThan(0);
        const lastCall =
          sendMessage.mock.calls[sendMessage.mock.calls.length - 1][0];
        expect(
          lastCall.includes(
            encodeURIComponent(
              'You are not registered in the system\\. Please talk to the bot first to create your account\\.',
            ),
          ),
        ).toBeTruthy();
      });
    });

    describe('when recipient user not found in database', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.recipientNotFound();
        underTest = new FriendService();
      });

      it('should return error message', async () => {
        const command = new Command('/friend add nonexistent_user');
        await underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls.length).toBeGreaterThan(0);
        const firstCall = sendMessage.mock.calls[0][0];
        expect(
          firstCall.includes('User') &&
            firstCall.includes('nonexistent') &&
            firstCall.includes('found'),
        ).toBeTruthy();
      });
    });

    describe('when no requests exist between users', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.noRequests();
        underTest = new FriendService();
      });

      it('should send friend request', async () => {
        const command = new Command(`/friend add ${MockUser2.username}`);
        await underTest.processCommand(command, MockUser, 123);

        expect(checkFriendRequestSent(sendMessage.mock.calls)).toBeTruthy();
      });
    });

    describe('when sender already has pending request to recipient', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.senderPendingRequest();
        underTest = new FriendService();
      });

      it('should return error message', async () => {
        const command = new Command(`/friend add ${MockUser2.username}`);
        await underTest.processCommand(command, MockUser, 123);

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

      it('should accept the friend request', async () => {
        const command = new Command(`/friend add ${MockUser2.username}`);
        await underTest.processCommand(command, MockUser, 123);

        expect(checkFriendRequestAccepted(sendMessage.mock.calls)).toBeTruthy();
      });
    });

    describe('when sender has cancelled request to recipient', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.senderCancelledRequest();
        underTest = new FriendService();
      });

      it('should reactivate the request without notifying the recipient', async () => {
        const command = new Command('/friend add janesmith');
        await underTest.processCommand(command, MockUser, 123);

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

      it('should delete old request and create new one', async () => {
        const command = new Command(`/friend add ${MockUser2.username}`);
        await underTest.processCommand(command, MockUser, 123);

        expect(checkFriendRequestSent(sendMessage.mock.calls)).toBeTruthy();
      });
    });

    describe('when sender has rejected request from recipient', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.senderRejectedRequest();
        underTest = new FriendService();
      });

      it('should send a new friend request', async () => {
        const command = new Command(`/friend add ${MockUser2.username}`);
        await underTest.processCommand(command, MockUser, 123);

        expect(checkFriendRequestSent(sendMessage.mock.calls)).toBeTruthy();
      });
    });

    describe('when recipient has rejected request from sender', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.recipientRejectedRequest();
        underTest = new FriendService();
      });

      it('should return error message', async () => {
        const command = new Command(`/friend add ${MockUser2.username}`);
        await underTest.processCommand(command, MockUser, 123);

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

      it('should return error message', async () => {
        const command = new Command(`/friend add ${MockUser2.username}`);
        await underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const lastCall = sendMessage.mock.calls[0][0];
        expect(
          lastCall.includes('already') && lastCall.includes('friends'),
        ).toBeTruthy();
      });
    });

    describe('edge cases', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.noRequests();
        underTest = new FriendService();
      });

      it('should handle command without username', async () => {
        const command = new Command('/friend add');
        await underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const lastCall = sendMessage.mock.calls[0][0];
        expect(
          lastCall.includes(
            encodeURIComponent('Please provide a username to add as friend'),
          ),
        ).toBeTruthy();
      });

      it('should prevent self-friending', async () => {
        const command = new Command(`/friend add ${MockUser.username}`);
        await underTest.processCommand(command, MockUser, MockUser.id);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const lastCall = sendMessage.mock.calls[0][0];
        expect(
          lastCall.includes(
            encodeURIComponent('You cannot add yourself as a friend'),
          ),
        ).toBeTruthy();
      });
    });
  });

  describe('FRIEND REMOVE command', () => {
    describe('when sender user not found in database', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.senderNotFound();
        underTest = new FriendService();
      });

      it('should handle gracefully when sender is not in database', async () => {
        const command = new Command(`/friend remove ${MockUser2.username}`);
        await underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const lastCall = sendMessage.mock.calls[0][0];
        expect(
          lastCall.includes(
            encodeURIComponent(
              'You are not registered in the system\\. Please talk to the bot first to create your account\\.',
            ),
          ),
        ).toBeTruthy();
      });
    });

    describe('when recipient user not found in database', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.recipientNotFound();
        underTest = new FriendService();
      });

      it('should return error message', async () => {
        const command = new Command('/friend remove nonexistent_user');
        await underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const lastCall = sendMessage.mock.calls[0][0];
        expect(
          lastCall.includes(
            encodeURIComponent("User \\'nonexistent\\_user\\' not found"),
          ),
        ).toBeTruthy();
      });
    });

    describe('when no requests exist between users', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.noRequests();
        underTest = new FriendService();
      });

      it('should return error message', async () => {
        const command = new Command(`/friend remove ${MockUser2.username}`);
        await underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const lastCall = sendMessage.mock.calls[0][0];
        expect(
          lastCall.includes(
            encodeURIComponent(
              'No friend relationship or pending request found with janesmith',
            ),
          ),
        ).toBeTruthy();
      });
    });

    describe('when sender has pending request to recipient', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.senderPendingRequest();
        underTest = new FriendService();
      });

      it('should cancel the friend request', async () => {
        const command = new Command(`/friend remove ${MockUser2.username}`);
        await underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const lastCall = sendMessage.mock.calls[0][0];
        expect(
          lastCall.includes(
            encodeURIComponent(
              'You have cancelled your friend request to janesmith',
            ),
          ),
        ).toBeTruthy();
      });
    });

    describe('when recipient has pending request to sender', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.recipientPendingRequest();
        underTest = new FriendService();
      });

      it('should reject the friend request', async () => {
        const command = new Command(`/friend remove ${MockUser2.username}`);
        await underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const lastCall = sendMessage.mock.calls[0][0];
        expect(
          lastCall.includes(
            encodeURIComponent(
              'You have rejected the friend request from janesmith',
            ),
          ),
        ).toBeTruthy();
      });
    });

    describe('when users are already friends', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.alreadyFriends();
        underTest = new FriendService();
      });

      it('should remove the friendship', async () => {
        const command = new Command(`/friend remove ${MockUser2.username}`);
        await underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const lastCall = sendMessage.mock.calls[0][0];
        expect(
          lastCall.includes(
            encodeURIComponent(
              'You have removed janesmith from your friends list',
            ),
          ),
        ).toBeTruthy();
      });
    });

    describe('edge cases', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.noRequests();
        underTest = new FriendService();
      });

      it('should handle command without username', async () => {
        const command = new Command('/friend remove');
        await underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const lastCall = sendMessage.mock.calls[0][0];
        expect(
          lastCall.includes(
            encodeURIComponent('Please provide a username to remove'),
          ),
        ).toBeTruthy();
      });
    });
  });

  describe('FRIEND LIST command', () => {
    describe('when sender user not found in database', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.senderNotFound();
        underTest = new FriendService();
      });

      it('should handle gracefully when sender is not in database', async () => {
        const command = new Command('/friend list');
        await underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const lastCall = sendMessage.mock.calls[0][0];
        expect(
          lastCall.includes(
            encodeURIComponent(
              'You are not registered in the system\\. Please talk to the bot first to create your account\\.',
            ),
          ),
        ).toBeTruthy();
      });
    });

    describe('when user has no friends', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.noRequests();
        underTest = new FriendService();
      });

      it('should return no friends message', async () => {
        const command = new Command('/friend list');
        await underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const lastCall = sendMessage.mock.calls[0][0];
        expect(
          lastCall.includes(encodeURIComponent('You have no friends yet')),
        ).toBeTruthy();
      });
    });

    describe('when user has friends', () => {
      beforeEach(() => {
        global.SpreadsheetApp = setupState.alreadyFriends();
        underTest = new FriendService();
      });

      it('should return friends list', async () => {
        const command = new Command('/friend list');
        await underTest.processCommand(command, MockUser, 123);

        expect(sendMessage.mock.calls).toHaveLength(1);
        const lastCall = sendMessage.mock.calls[0][0];
        expect(
          lastCall.includes(encodeURIComponent('Your Friends')),
        ).toBeTruthy();
        expect(
          lastCall.includes(encodeURIComponent(requestRecipient.username)),
        ).toBeTruthy();
      });
    });
  });

  describe('Unknown commands', () => {
    beforeEach(() => {
      global.SpreadsheetApp = setupState.noRequests();
      underTest = new FriendService();
    });

    it('should handle unknown command', async () => {
      const command = new Command('/friend unknown');
      await underTest.processCommand(command, MockUser, 123);

      expect(sendMessage.mock.calls).toHaveLength(1);
      const lastCall = sendMessage.mock.calls[0][0];
      expect(lastCall.includes(encodeURIComponent('UNKNOWN'))).toBeTruthy();
      expect(lastCall.includes(encodeURIComponent('FRIEND ADD'))).toBeTruthy();
      expect(
        lastCall.includes(encodeURIComponent('FRIEND REMOVE')),
      ).toBeTruthy();
      expect(lastCall.includes(encodeURIComponent('FRIEND LIST'))).toBeTruthy();
    });
  });

  describe('Complex workflow scenarios', () => {
    beforeEach(() => {
      global.SpreadsheetApp = setupState.multipleUsers();
      underTest = new FriendService();
    });

    it('should handle complete friend workflow: add, list, then remove', async () => {
      const addCommand = new Command(`/friend add ${MockUser2.username}`);
      const listCommand = new Command('/friend list');
      const removeCommand = new Command(`/friend remove ${MockUser2.username}`);

      await underTest.processCommand(addCommand, MockUser, 123);
      await underTest.processCommand(listCommand, MockUser, 123);
      await underTest.processCommand(removeCommand, MockUser, 123);
      await underTest.processCommand(listCommand, MockUser, 123);

      expect(sendMessage.mock.calls).toHaveLength(5);
      expect(
        sendMessage.mock.calls[0][0].includes(
          encodeURIComponent('Friend request sent'),
        ),
      ).toBeTruthy();
      expect(
        sendMessage.mock.calls[1][0].includes(
          encodeURIComponent('wants to be your friend'),
        ),
      ).toBeTruthy();
      expect(
        sendMessage.mock.calls[2][0].includes(
          encodeURIComponent('You have no friends yet'),
        ),
      ).toBeTruthy();
      expect(
        sendMessage.mock.calls[3][0].includes(
          encodeURIComponent('You have cancelled your friend request'),
        ),
      ).toBeTruthy();
      expect(
        sendMessage.mock.calls[4][0].includes(
          encodeURIComponent('You have no friends yet'),
        ),
      ).toBeTruthy();
    });

    it('should handle multiple friend operations in sequence with different users', async () => {
      const addCommand1 = new Command(`/friend add ${MockUser2.username}`);
      const addCommand2 = new Command(`/friend add ${MockUser.username}`);
      const listCommand1 = new Command('/friend list');
      const listCommand2 = new Command('/friend list');

      await underTest.processCommand(addCommand1, MockUser, 123);
      await underTest.processCommand(addCommand2, MockUser2, 123);
      await underTest.processCommand(listCommand1, MockUser, 123);
      await underTest.processCommand(listCommand2, MockUser2, 123);

      expect(sendMessage.mock.calls).toHaveLength(6);
      expect(
        sendMessage.mock.calls[0][0].includes(
          encodeURIComponent('Friend request sent'),
        ),
      ).toBeTruthy();
      expect(
        sendMessage.mock.calls[1][0].includes(
          encodeURIComponent('wants to be your friend'),
        ),
      ).toBeTruthy();
      expect(
        sendMessage.mock.calls[2][0].includes(
          encodeURIComponent('You are now friends with'),
        ),
      ).toBeTruthy();
      expect(
        sendMessage.mock.calls[3][0].includes(
          encodeURIComponent('accepted your friend request'),
        ),
      ).toBeTruthy();
      expect(
        sendMessage.mock.calls[4][0].includes(
          encodeURIComponent('Your Friends'),
        ),
      ).toBeTruthy();
      expect(
        sendMessage.mock.calls[4][0].includes(
          encodeURIComponent(requestRecipient.username),
        ),
      ).toBeTruthy();
      expect(
        sendMessage.mock.calls[5][0].includes(
          encodeURIComponent('Your Friends'),
        ),
      ).toBeTruthy();
      expect(
        sendMessage.mock.calls[5][0].includes(
          encodeURIComponent(requestSender.username),
        ),
      ).toBeTruthy();
    });

    it('should handle request cancellation and reactivation', async () => {
      const addCommand = new Command(`/friend add ${MockUser2.username}`);
      await underTest.processCommand(addCommand, MockUser, 123);

      const removeCommand = new Command(`/friend remove ${MockUser2.username}`);
      await underTest.processCommand(removeCommand, MockUser, 123);

      const addCommand2 = new Command(`/friend add ${MockUser2.username}`);
      await underTest.processCommand(addCommand2, MockUser, 123);

      expect(sendMessage.mock.calls).toHaveLength(4);
      expect(
        sendMessage.mock.calls[0][0].includes(
          encodeURIComponent('Friend request sent'),
        ),
      ).toBeTruthy();
      expect(
        sendMessage.mock.calls[1][0].includes(
          encodeURIComponent('wants to be your friend'),
        ),
      ).toBeTruthy();
      expect(
        sendMessage.mock.calls[2][0].includes(
          encodeURIComponent('You have cancelled your friend request'),
        ),
      ).toBeTruthy();
      expect(
        sendMessage.mock.calls[3][0].includes(
          encodeURIComponent('Friend request sent'),
        ),
      ).toBeTruthy();
    });

    it('should handle request rejection and new request creation', async () => {
      const addCommand = new Command(`/friend add ${MockUser2.username}`);
      await underTest.processCommand(addCommand, MockUser, MockUser.id);

      const removeCommand = new Command(`/friend remove ${MockUser.username}`);
      await underTest.processCommand(removeCommand, MockUser2, MockUser2.id);

      const addCommand2 = new Command(`/friend add ${MockUser.username}`);
      await underTest.processCommand(addCommand2, MockUser2, MockUser2.id);

      expect(sendMessage.mock.calls).toHaveLength(5);
      expect(
        sendMessage.mock.calls[0][0].includes(
          encodeURIComponent('Friend request sent'),
        ),
      ).toBeTruthy();
      expect(
        sendMessage.mock.calls[1][0].includes(
          encodeURIComponent('wants to be your friend'),
        ),
      ).toBeTruthy();
      expect(
        sendMessage.mock.calls[2][0].includes(
          encodeURIComponent('You have rejected the friend request from'),
        ),
      ).toBeTruthy();
      expect(
        sendMessage.mock.calls[3][0].includes(
          encodeURIComponent('Friend request sent'),
        ),
      ).toBeTruthy();
      expect(
        sendMessage.mock.calls[4][0].includes(
          encodeURIComponent('wants to be your friend'),
        ),
      ).toBeTruthy();
    });
  });

  describe('Error handling and resilience', () => {
    beforeEach(() => {
      global.SpreadsheetApp = setupState.noRequests();
      underTest = new FriendService();
    });

    it('should handle error scenarios and continue processing subsequent commands', async () => {
      const invalidCommand = new Command('/friend add');
      const validCommand = new Command('/friend list');
      const removeCommand = new Command('/friend remove nonexistent');

      await underTest.processCommand(invalidCommand, MockUser, 123);
      await underTest.processCommand(validCommand, MockUser, 123);
      await underTest.processCommand(removeCommand, MockUser, 123);

      expect(sendMessage.mock.calls.length).toBeGreaterThan(2);

      const invalidCall = sendMessage.mock.calls[0][0];
      const validCall = sendMessage.mock.calls[1][0];
      const removeCall = sendMessage.mock.calls[2][0];

      expect(
        invalidCall.includes(
          encodeURIComponent('Please provide a username to add as friend'),
        ),
      ).toBeTruthy();
      expect(
        validCall.includes(encodeURIComponent('You have no friends yet')),
      ).toBeTruthy();
      expect(
        removeCall.includes(
          encodeURIComponent("User \\'nonexistent\\' not found"),
        ),
      ).toBeTruthy();
    });
  });

  function checkFriendRequestSent(
    calls: [url: string][],
    includeRecipientNotification: boolean = true,
  ) {
    expect(calls).toHaveLength(includeRecipientNotification ? 2 : 1);
    const senderCall = calls.find((call) =>
      call[0].includes(`chat_id=${requestSender.userId}`),
    );
    expect(senderCall).toBeDefined();
    expect(
      senderCall?.[0].includes(encodeURIComponent('Friend request sent')),
    ).toBeTruthy();
    expect(
      senderCall?.[0].includes(encodeURIComponent(requestRecipient.username)),
    ).toBeTruthy();

    if (includeRecipientNotification) {
      const recipientCall = calls.find((call) =>
        call[0].includes(`chat_id=${requestRecipient.userId}`),
      );
      expect(recipientCall).toBeDefined();
      expect(
        recipientCall?.[0].includes(encodeURIComponent(requestSender.username)),
      ).toBeTruthy();
      expect(
        recipientCall?.[0].includes(
          encodeURIComponent('wants to be your friend'),
        ),
      ).toBeTruthy();
    }

    return true;
  }

  function checkFriendRequestNotSentDueToExistingRequest(
    calls: [url: string][],
  ) {
    expect(calls).toHaveLength(1);
    const firstCall = calls[0][0];
    expect(firstCall.includes(`chat_id=${requestSender.userId}`)).toBeTruthy();
    expect(
      firstCall.includes(
        encodeURIComponent('You already have a pending friend request to'),
      ),
    ).toBeTruthy();
    expect(
      firstCall.includes(encodeURIComponent(requestRecipient.username)),
    ).toBeTruthy();
    return true;
  }

  function checkFriendRequestAccepted(calls: [url: string][]) {
    expect(calls).toHaveLength(2);
    const senderCall = calls.find((call) =>
      call[0].includes(`chat_id=${requestSender.userId}`),
    );
    expect(senderCall).toBeDefined();
    expect(
      senderCall?.[0].includes(encodeURIComponent('You are now friends with')),
    ).toBeTruthy();
    expect(
      senderCall?.[0].includes(encodeURIComponent(requestRecipient.username)),
    ).toBeTruthy();

    const recipientCall = calls.find((call) =>
      call[0].includes(`chat_id=${requestRecipient.userId}`),
    );
    expect(recipientCall).toBeDefined();
    expect(
      recipientCall?.[0].includes(encodeURIComponent(requestSender.username)),
    ).toBeTruthy();
    expect(
      recipientCall?.[0].includes(
        encodeURIComponent('accepted your friend request'),
      ),
    ).toBeTruthy();
    return true;
  }
});
