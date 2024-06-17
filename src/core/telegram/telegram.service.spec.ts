import { MockLogger } from '@core/googleAppsScript';
import { TelegramService } from './telegram.service';
import { MockTelegramUrlFetchApp } from './telegram.mock';

describe('TelegramService', () => {
  let underTest: TelegramService;

  beforeAll(() => {
    global.Logger = MockLogger;
    global.UrlFetchApp = MockTelegramUrlFetchApp;
  });

  beforeEach(() => {
    underTest = new TelegramService();
  });

  describe('getMe', () => {
    it('should return the user object', () => {
      const actual = underTest.getMe();
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
      const actual = underTest.setWebhook();
      if (!actual.ok) {
        throw "Response body contains '{ok: false}'";
      }
      expect(actual.result).toBeTruthy();
    });
  });

  describe('sendMessage', () => {
    it('should return sent message', () => {
      const expectedMessage = 'Hello';
      const actual = underTest.sendMessage({
        chat_id: '123',
        text: expectedMessage,
      });
      if (!actual.ok) {
        throw "Response body contains '{ok: false}'";
      }
      expect(actual.result.text).toEqual(expectedMessage);
    });
  });
});
