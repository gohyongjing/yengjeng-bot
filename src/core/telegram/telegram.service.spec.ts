import { MockLogger, MockSpreadsheetApp } from '@core/googleAppsScript';
import { TelegramService } from './telegram.service';
import { MockTelegramUrlFetchApp } from './telegram.mock';
import { MarkdownBuilder } from '@core/util/markdownBuilder';

describe('TelegramService', () => {
  beforeAll(() => {
    global.Logger = MockLogger;
    global.SpreadsheetApp = MockSpreadsheetApp;
    global.UrlFetchApp = MockTelegramUrlFetchApp;
  });

  describe('getMe', () => {
    it('should return the user object', () => {
      const actual = TelegramService.getMe();
      if (!actual.ok) {
        throw "Response body contains '{ok: false}'";
      }
      const resultKeys = Object.keys(actual.result);
      expect(resultKeys.includes('id')).toBeTruthy();
      expect(resultKeys.includes('is_bot')).toBeTruthy();
      expect(resultKeys.includes('first_name')).toBeTruthy();
    });
  });

  describe('setWebhook', () => {
    it('should return true', () => {
      const actual = TelegramService.setWebhook();
      if (!actual.ok) {
        throw "Response body contains '{ok: false}'";
      }
      expect(actual.result).toBeTruthy();
    });
  });

  describe('sendMessage', () => {
    it('should return sent message', () => {
      const expectedMessage = 'Hello';
      const actual = TelegramService.sendMessage({
        chatId: 123,
        markdown: new MarkdownBuilder(expectedMessage),
      });
      if (!actual.ok) {
        throw "Response body contains '{ok: false}'";
      }
      expect(actual.result.text).toEqual(expectedMessage);
    });
  });
});
