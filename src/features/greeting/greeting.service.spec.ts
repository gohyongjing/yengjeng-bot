import { MockLogger } from '@core/googleAppsScript';
import { Builder } from '@core/util/builder';
import {
  canParseMarkdownV2,
  MockMessage,
  MockTelegramUrlFetchApp,
  MockUser,
  sendMessage,
} from '@core/telegram/telegram.mock';
import { GreetingService } from './greeting.service';
import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';

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

  describe('processUpdate', () => {
    describe('has first name', () => {
      it('should greet user with first name', () => {
        const input_update = {
          update_id: 1,
          message: new Builder(MockMessage)
            .with({
              text: '/start',
              from: MockUser,
            })
            .build(),
        };
        underTest.processUpdate(input_update);

        const actualUrl = sendMessage.mock.calls[0][0];
        expect(
          actualUrl.includes(encodeURIComponent(MockUser.first_name)),
        ).toBeTruthy();
        expect(actualUrl.includes('inline_keyboard')).toBeTruthy();
        expect(
          canParseMarkdownV2.mock.results.every(
            (result) => result.value === true,
          ),
        ).toBeTruthy();
      });
    });
  });
});
