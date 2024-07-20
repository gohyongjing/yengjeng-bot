import { MockLogger, MockSpreadsheetApp } from '@core/googleAppsScript';
import { Builder } from '@core/util/builder';
import {
  canParseMarkdownV2,
  MockChat,
  MockMessage,
  MockTelegramUrlFetchApp,
  sendMessage,
} from '@core/telegram/telegram.mock';
import { GreetingService } from './greeting.service';

describe('GreetingService', () => {
  let underTest: GreetingService;

  beforeAll(() => {
    global.Logger = MockLogger;
    global.SpreadsheetApp = MockSpreadsheetApp;
    global.UrlFetchApp = MockTelegramUrlFetchApp;
  });

  beforeEach(() => {
    underTest = new GreetingService();
    jest.clearAllMocks();
  });

  describe('processUpdate', () => {
    describe('has first name', () => {
      it('should greet user with first name', () => {
        const first_name = 'John Doe';
        const input_update = {
          update_id: 1,
          message: new Builder(MockMessage)
            .with({
              chat: new Builder(MockChat).with({ first_name }).build(),
            })
            .build(),
        };
        underTest.processUpdate(input_update);

        const actualUrl = sendMessage.mock.calls[0][0];
        expect(actualUrl.includes(encodeURIComponent(first_name))).toBeTruthy();
        expect(
          canParseMarkdownV2.mock.results.every(
            (result) => result.value === true,
          ),
        ).toBeTruthy();
      });
    });
  });
});
