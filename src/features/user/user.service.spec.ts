import {
  canParseMarkdownV2,
  MockTelegramUrlFetchApp,
  MockUser,
  sendMessage,
} from '@core/telegram/telegram.mock';
import { UserService } from './user.service';
import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';
import { Command } from '@core/util/command';

describe('UserService', () => {
  let underTest: UserService;

  beforeAll(() => {
    global.UrlFetchApp = MockTelegramUrlFetchApp;
  });

  beforeEach(() => {
    global.SpreadsheetApp = createMockSpreadsheetApp();
    underTest = new UserService();
    jest.clearAllMocks();
  });

  describe('processCommand', () => {
    describe('view user profile', () => {
      it('should show user profile when user exists', () => {
        underTest.updateProfile(MockUser);

        const command = new Command('/user profile');
        underTest.processCommand(command, MockUser, 123456);

        const actualUrl = sendMessage.mock.calls[0][0];
        expect(
          actualUrl.includes(encodeURIComponent('User Profile')),
        ).toBeTruthy();
        expect(
          actualUrl.includes(encodeURIComponent(MockUser.first_name)),
        ).toBeTruthy();
        expect(
          canParseMarkdownV2.mock.results.every(
            (result) => result.value === true,
          ),
        ).toBeTruthy();
      });

      it('should show error when user does not exist', () => {
        expect(hasNoUserProfile(underTest)).toBeTruthy();
      });
    });

    describe('delete user data', () => {
      it('should delete user data successfully', () => {
        underTest.updateProfile(MockUser);

        const command = new Command('/user delete');
        underTest.processCommand(command, MockUser, 123456);

        const actualUrl = sendMessage.mock.calls[0][0];
        expect(
          actualUrl.includes(
            encodeURIComponent('Your user data has been deleted successfully'),
          ),
        ).toBeTruthy();
        expect(hasNoUserProfile(underTest)).toBeTruthy();
      });

      it('should show error when user does not exist for deletion', () => {
        const command = new Command('/user delete');
        underTest.processCommand(command, MockUser, 123456);

        const actualUrl = sendMessage.mock.calls[0][0];
        expect(
          actualUrl.includes(
            encodeURIComponent('Failed to delete your user data'),
          ),
        ).toBeTruthy();
      });
    });

    describe('unknown command', () => {
      it('should show help for unknown command', () => {
        const command = new Command('/user unknown');
        underTest.processCommand(command, MockUser, 123456);

        const actualUrl = sendMessage.mock.calls[0][0];
        expect(
          actualUrl.includes(
            encodeURIComponent(
              "Sorry\\, I don\\'t know how to handle this command",
            ),
          ),
        ).toBeTruthy();
        expect(
          actualUrl.includes(encodeURIComponent('USER PROFILE')),
        ).toBeTruthy();
      });
    });
  });

  describe('updateProfile', () => {
    it('should register new user successfully', () => {
      const userData = underTest.updateProfile(MockUser);

      expect(userData).toBeDefined();
      expect(userData?.userId).toBe(MockUser.id);
      expect(userData?.firstName).toBe(MockUser.first_name);
    });

    it('should handle multiple users without creating duplicates', () => {
      const user1 = { ...MockUser, id: 123, first_name: 'John' };
      const firstUserRegistration = underTest.updateProfile(user1);
      expect(firstUserRegistration).toBeDefined();
      expect(firstUserRegistration?.userId).toBe(123);

      const user2 = { ...MockUser, id: 456, first_name: 'Jane' };
      const secondUserRegistration = underTest.updateProfile(user2);
      expect(secondUserRegistration).toBeDefined();
      expect(secondUserRegistration?.userId).toBe(456);

      const firstUserUpdate = underTest.updateProfile(user1);
      expect(firstUserUpdate).toBeDefined();
      expect(firstUserUpdate?.userId).toBe(123);
      expect(firstUserUpdate?.createdAt).toEqual(
        firstUserRegistration?.createdAt,
      );

      const secondUserUpdate = underTest.updateProfile(user2);
      expect(secondUserUpdate).toBeDefined();
      expect(secondUserUpdate?.userId).toBe(456);
      expect(secondUserUpdate?.createdAt).toEqual(
        secondUserRegistration?.createdAt,
      );
    });

    it('should return correct profile data after updating user', () => {
      const user = {
        ...MockUser,
        id: 789,
        first_name: 'Bob',
        last_name: 'Smith',
        username: 'bob_smith',
      };
      underTest.updateProfile(user);
      const updatedUser = {
        ...user,
        first_name: 'Alice',
        last_name: 'Johnson',
        username: 'alice_johnson',
      };
      underTest.updateProfile(updatedUser);
      underTest.processCommand(new Command('/user'), updatedUser, 789);
      const actualUrl =
        sendMessage.mock.calls[sendMessage.mock.calls.length - 1][0];
      expect(actualUrl.includes(encodeURIComponent('Alice'))).toBeTruthy();
      expect(actualUrl.includes(encodeURIComponent('Johnson'))).toBeTruthy();
      expect(
        actualUrl.includes(encodeURIComponent('alice\\_johnson')),
      ).toBeTruthy();
      expect(actualUrl.includes(encodeURIComponent('Bob'))).toBeFalsy();
      expect(actualUrl.includes(encodeURIComponent('Smith'))).toBeFalsy();
      expect(actualUrl.includes(encodeURIComponent('bob_smith'))).toBeFalsy();
    });
  });

  describe('getUser', () => {
    it('should return user data for existing user', () => {
      underTest.updateProfile(MockUser);

      const userData = underTest.getUser({ userId: MockUser.id });
      expect(userData).toBeDefined();
      expect(userData?.userId).toBe(MockUser.id);
    });
  });

  function hasNoUserProfile(underTest: UserService) {
    const command = new Command('/user profile');
    underTest.processCommand(command, MockUser, 123456);

    const actualUrl =
      sendMessage.mock.calls[sendMessage.mock.calls.length - 1][0];
    expect(
      actualUrl.includes(encodeURIComponent('Your details are not found')),
    ).toBeTruthy();
    expect(
      actualUrl.includes(
        encodeURIComponent('Please use \\/start to register first'),
      ),
    ).toBeTruthy();
    return true;
  }
});
