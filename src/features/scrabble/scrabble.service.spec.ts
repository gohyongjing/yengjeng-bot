import {
  MockLogger,
  MockSpreadsheetApp,
  MockUrlFetchApp,
} from '@core/googleAppsScript';
import { ScrabbleService } from './scrabble.service';
import { Update } from '@core/telegram';
import { Builder } from '@core/util/builder';
import { MockTelegramUrlFetchApp } from '@core/telegram/telegram.mock';

describe('ScrabbleService', () => {
  let service: ScrabbleService;

  beforeAll(() => {
    global.Logger = MockLogger;
    global.SpreadsheetApp = MockSpreadsheetApp;
    global.UrlFetchApp = MockTelegramUrlFetchApp;
  });

  beforeEach(() => {
    service = new ScrabbleService();
  });

  describe('APP_SERVICE_COMMAND_WORD', () => {
    it('should be "scrabble"', () => {
      expect(service.APP_SERVICE_COMMAND_WORD).toBe('scrabble');
    });
  });

  describe('help', () => {
    it('should return help text', () => {
      const helpText = service.help();
      expect(helpText).toContain('SCRABBLE');
      expect(helpText).toContain('[NUMBER]');
    });
  });

  describe('processUpdate', () => {
    it('should process message updates', async () => {
      const mockUpdate: Update = {
        update_id: 1,
        message: {
          message_id: 1,
          date: 1234567890,
          chat: { id: 123, type: 'private' },
          text: '/scrabble 5',
        },
      };

      // TODO: Add more comprehensive tests for processUpdate
      // This would involve mocking the TelegramService and testing the response

      await expect(service.processUpdate(mockUpdate)).resolves.not.toThrow();
    });
  });
});
