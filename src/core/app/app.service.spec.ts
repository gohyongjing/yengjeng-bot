import {
  canParseMarkdownV2,
  MockMessage,
  MockTelegramUrlFetchApp,
  sendMessage,
} from '@core/telegram/telegram.mock';
import { Builder } from '@core/util/builder';
import { App } from './app.service';

describe('App', () => {
  describe('processUpdate', () => {
    let underTest: App;

    beforeAll(() => {
      global.UrlFetchApp = MockTelegramUrlFetchApp;
    });

    beforeEach(() => {
      underTest = new App();
      jest.clearAllMocks();
    });

    describe('Message update', () => {
      describe('Start command', () => {
        it('should send hello message', () => {
          underTest.processUpdate({
            update_id: 1,
            message: new Builder(MockMessage).with({ text: '/start' }).build(),
          });
          const actualUrl = sendMessage.mock.calls[0][0];
          expect(
            actualUrl.toLocaleLowerCase().includes(encodeURIComponent('hello')),
          ).toBeTruthy();
          expect(
            canParseMarkdownV2.mock.results.every(
              (result) => result.value === true,
            ),
          ).toBeTruthy();
        });
      });

      describe('Help command', () => {
        it('should send help message', () => {
          underTest.processUpdate({
            update_id: 1,
            message: new Builder(MockMessage).with({ text: '/help' }).build(),
          });
          const actualUrl = sendMessage.mock.calls[0][0];
          expect(actualUrl.includes(encodeURIComponent('HELP'))).toBeTruthy();
          expect(actualUrl.includes(encodeURIComponent('BUS'))).toBeTruthy();
          expect(
            actualUrl.includes(encodeURIComponent('VERSION')),
          ).toBeTruthy();
          expect(
            canParseMarkdownV2.mock.results.every(
              (result) => result.value === true,
            ),
          ).toBeTruthy();
        });
      });

      describe('Missing text', () => {
        it('should not crash the app', () => {
          expect(() => {
            underTest.processUpdate({
              update_id: 1,
              message: new Builder(MockMessage).without(['text']).build(),
            });
          }).not.toThrow();
        });
      });
    });

    describe('Unhandled updates', () => {
      it('should not crash the app', () => {
        expect(() => {
          underTest.processUpdate({
            update_id: 1,
            edited_message: MockMessage,
          });
        }).not.toThrow();
      });
    });
  });
});
