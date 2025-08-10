import { FriendService } from './friend.service';
import { Command } from '@core/util/command';
import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';
import { MockLogger } from '@core/googleAppsScript';
import {
  MockTelegramUrlFetchApp,
  MockUser,
} from '@core/telegram/telegram.mock';

describe('FriendService', () => {
  let underTest: FriendService;

  beforeAll(() => {
    global.Logger = MockLogger;
    global.UrlFetchApp = MockTelegramUrlFetchApp;
  });

  beforeEach(() => {
    global.SpreadsheetApp = createMockSpreadsheetApp();
    underTest = new FriendService();
    jest.clearAllMocks();
  });

  describe('help', () => {
    it('should return help text', () => {
      const help = underTest.help();
      expect(help).toContain('FRIEND ADD'); //TODO: Extract list of commands into a separate feature of the parent class AppService so that this only needs to be tested once
      expect(help).toContain('FRIEND REMOVE');
      expect(help).toContain('FRIEND LIST');
    });
  });

  describe('processCommand', () => {
    it('should handle LIST command', () => {
      const command = new Command('/friend list');

      expect(() => {
        underTest.processCommand(command, MockUser, 123);
      }).not.toThrow();
    });

    it('should handle ADD command with username', () => {
      const command = new Command('/friend add jane_smith');

      expect(() => {
        underTest.processCommand(command, MockUser, 123);
      }).not.toThrow();
    });

    it('should handle ADD command without username', () => {
      const command = new Command('/friend add');

      expect(() => {
        underTest.processCommand(command, MockUser, 123);
      }).not.toThrow();
    });

    it('should handle REMOVE command with username', () => {
      const command = new Command('/friend remove jane_smith');

      expect(() => {
        underTest.processCommand(command, MockUser, 123);
      }).not.toThrow();
    });

    it('should handle REMOVE command without username', () => {
      const command = new Command('/friend remove');

      expect(() => {
        underTest.processCommand(command, MockUser, 123);
      }).not.toThrow();
    });

    it('should handle unknown command', () => {
      const command = new Command('/friend unknown');

      expect(() => {
        underTest.processCommand(command, MockUser, 123);
      }).not.toThrow();
    });
  });
});

//TODO: Add integration tests
