import {
  canParseMarkdownV2,
  MockMessage,
  MockTelegramUrlFetchApp,
  sendMessage,
} from '@core/telegram/telegram.mock';
import { HelpService } from './help.service';
import { Builder } from '@core/util/builder';
import { MockLogger, MockSpreadsheetApp } from '@core/googleAppsScript';

describe('HelpService', () => {
  describe('processUpdate', () => {
    let underTest: HelpService;

    beforeAll(() => {
      global.Logger = MockLogger;
      global.SpreadsheetApp = MockSpreadsheetApp;
      global.UrlFetchApp = MockTelegramUrlFetchApp;
    });

    beforeEach(() => {
      underTest = new HelpService([
        {
          APP_SERVICE_COMMAND_WORD: 'app1',
          processUpdate: async (_update) => {},
          help: () => 'help message 1',
        },
        {
          APP_SERVICE_COMMAND_WORD: 'app2',
          processUpdate: async (_update) => {},
          help: () => 'second help message',
        },
      ]);
      jest.clearAllMocks();
    });

    describe('Help command entered', () => {
      it('should send help message', () => {
        underTest.processUpdate({
          update_id: 1,
          message: new Builder(MockMessage).with({ text: '/help' }).build(),
        });
        const actualUrl = sendMessage.mock.calls[0][0];
        expect(
          actualUrl.includes(encodeURIComponent('help message 1')),
        ).toBeTruthy();
        expect(
          actualUrl.includes(encodeURIComponent('second help message')),
        ).toBeTruthy();
        expect(
          canParseMarkdownV2.mock.results.every(
            (result) => result.value === true,
          ),
        ).toBeTruthy();
      });
    });

    describe('Help command not entered', () => {
      it('should send unknown request message', () => {
        underTest.processUpdate({
          update_id: 1,
          message: new Builder(MockMessage)
            .with({ text: 'I do not know how to use this' })
            .build(),
        });
        const actualUrl = sendMessage.mock.calls[0][0];
        expect(
          actualUrl.includes(
            encodeURIComponent('type HELP for more information'),
          ),
        ).toBeTruthy();
        expect(
          canParseMarkdownV2.mock.results.every(
            (result) => result.value === true,
          ),
        ).toBeTruthy();
      });
    });
  });
});
