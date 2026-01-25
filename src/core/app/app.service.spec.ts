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
          expect(sendMessage).toHaveBeenCalledTimes(1);
          const options = sendMessage.mock.calls[0][1];
          expect(options).toBeDefined();
          if (!options) throw new Error('Options should be defined');
          const payload = JSON.parse(options.payload?.toString() ?? '');
          const text = payload.text;

          expect(text.toLowerCase()).toContain('hello');
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
          expect(sendMessage).toHaveBeenCalledTimes(1);
          const options = sendMessage.mock.calls[0][1];
          expect(options).toBeDefined();
          if (!options) throw new Error('Options should be defined');
          const payload = JSON.parse(options.payload?.toString() ?? '');
          const text = payload.text;

          expect(text).toContain('HELP');
          //TODO: Add keywords from other features to help message
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
