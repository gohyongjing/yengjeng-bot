import { MockLogger } from '@core/googleAppsScript';
import {
  canParseMarkdownV2,
  MockTelegramUrlFetchApp,
  MockUser,
  sendMessage,
} from '@core/telegram/telegram.mock';
import { GreetingService } from './greeting.service';
import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';
import { Command } from '@core/util/command';

describe('GreetingService', () => {
  let underTest: GreetingService;

  beforeAll(() => {
    global.Logger = MockLogger;
    global.UrlFetchApp = MockTelegramUrlFetchApp;
  });

  beforeEach(() => {
    global.SpreadsheetApp = createMockSpreadsheetApp();
    underTest = new GreetingService();
    jest.clearAllMocks();
  });

  describe('processCommand', () => {
    it('should greet user with first name and show inline keyboard', () => {
      const command = new Command('/start');
      underTest.processCommand(command, MockUser, 123456);

      const actualUrl = sendMessage.mock.calls[0][0];

      expect(actualUrl.includes(encodeURIComponent('Hello'))).toBeTruthy();
      expect(
        actualUrl.includes(encodeURIComponent(MockUser.first_name)),
      ).toBeTruthy();
      expect(
        actualUrl.includes(encodeURIComponent('This is Yeng Jeng Bot')),
      ).toBeTruthy();

      expect(actualUrl.includes('Bus')).toBeTruthy();
      expect(actualUrl.includes('Scrabble')).toBeTruthy();
      expect(actualUrl.includes('Help')).toBeTruthy();
      expect(actualUrl.includes('Version')).toBeTruthy();
      expect(actualUrl.includes('inline_keyboard')).toBeTruthy();

      expect(
        canParseMarkdownV2.mock.results.every(
          (result) => result.value === true,
        ),
      ).toBeTruthy();
    });
  });
});
