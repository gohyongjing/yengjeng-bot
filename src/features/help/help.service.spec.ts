import {
  canParseMarkdownV2,
  MockMessage,
  MockTelegramUrlFetchApp,
  MockUser,
  MockChat,
  sendMessage,
} from '@core/telegram/telegram.mock';
import { HelpService } from './help.service';
import { createMockAppServices } from '@core/appService/appService.mock';
import { Command } from '@core/util/command';
import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';

describe('HelpService', () => {
  let underTest: HelpService;

  beforeAll(() => {
    global.UrlFetchApp = MockTelegramUrlFetchApp;
  });

  beforeEach(() => {
    global.SpreadsheetApp = createMockSpreadsheetApp();
    const mockServices = createMockAppServices([
      { commandWord: 'app1', helpText: 'help message 1' },
      { commandWord: 'app2', helpText: 'second help message' },
    ]);

    underTest = new HelpService(mockServices);
    jest.clearAllMocks();
  });

  describe('help', () => {
    it('should return help text containing HELP', () => {
      const actual = underTest.help();
      expect(actual).toContain('HELP');
      expect(actual).toContain('Provides instructions');
    });
  });

  describe('processMessage', () => {
    describe('help command entered', () => {
      it('should send help message when help command is used', () => {
        const message = {
          ...MockMessage,
          text: '/help',
          from: MockUser,
          chat: MockChat,
        };

        underTest.processMessage(message);

        expect(sendMessage).toHaveBeenCalledTimes(1);
        const options = sendMessage.mock.calls[0][1];
        expect(options).toBeDefined();
        if (!options) throw new Error('Options should be defined');
        const payload = JSON.parse(options.payload?.toString() ?? '');
        const text = payload.text;

        expect(text).toContain('HELP');
        expect(text).toContain('Provides instructions');
        expect(text).toContain('help message 1');
        expect(text).toContain('second help message');
        expect(
          canParseMarkdownV2.mock.results.every(
            (result) => result.value === true,
          ),
        ).toBeTruthy();
      });

      it('should send help message when help command without slash is used', () => {
        const message = {
          ...MockMessage,
          text: 'help',
          from: MockUser,
          chat: MockChat,
        };

        underTest.processMessage(message);

        expect(sendMessage).toHaveBeenCalledTimes(1);
        const options = sendMessage.mock.calls[0][1];
        expect(options).toBeDefined();
        if (!options) throw new Error('Options should be defined');
        const payload = JSON.parse(options.payload?.toString() ?? '');
        const text = payload.text;

        expect(text).toContain('HELP');
        expect(text).toContain('Provides instructions');
        expect(text).toContain('help message 1');
        expect(text).toContain('second help message');
        expect(
          canParseMarkdownV2.mock.results.every(
            (result) => result.value === true,
          ),
        ).toBeTruthy();
      });
    });

    describe('unknown command entered', () => {
      it('should send unknown request message for non-help text', () => {
        const message = {
          ...MockMessage,
          text: 'I do not know how to use this',
          from: MockUser,
          chat: MockChat,
        };

        underTest.processMessage(message);

        expect(sendMessage).toHaveBeenCalledTimes(1);
        const options = sendMessage.mock.calls[0][1];
        expect(options).toBeDefined();
        if (!options) throw new Error('Options should be defined');
        const payload = JSON.parse(options.payload?.toString() ?? '');
        const text = payload.text;

        expect(text).toMatch(/.*don.*t understand.*what you just said.*/);
        expect(text).toMatch(/.*Please type HELP for more information.*/);
        expect(
          canParseMarkdownV2.mock.results.every(
            (result) => result.value === true,
          ),
        ).toBeTruthy();
      });

      it('should send unknown request message for empty text', () => {
        const message = {
          ...MockMessage,
          text: '',
          from: MockUser,
          chat: MockChat,
        };

        underTest.processMessage(message);

        expect(sendMessage).toHaveBeenCalledTimes(1);
        const options = sendMessage.mock.calls[0][1];
        expect(options).toBeDefined();
        if (!options) throw new Error('Options should be defined');
        const payload = JSON.parse(options.payload?.toString() ?? '');
        const text = payload.text;

        expect(text).toMatch(/.*don.*t understand.*what you just said.*/);
        expect(text).toMatch(/.*Please type HELP for more information.*/);
        expect(
          canParseMarkdownV2.mock.results.every(
            (result) => result.value === true,
          ),
        ).toBeTruthy();
      });
    });

    describe('message without user', () => {
      it('should not send message when from field is missing', () => {
        const message = {
          message_id: 1,
          date: 1717334400,
          text: '/help',
          chat: MockChat,
        };

        underTest.processMessage(message);

        expect(sendMessage).not.toHaveBeenCalled();
      });
    });
  });

  describe('processCommand', () => {
    it('should send comprehensive help message with all services', () => {
      const command = new Command('/help');
      underTest.processCommand(command, MockUser, MockChat.id);

      expect(sendMessage).toHaveBeenCalledTimes(1);
      const options = sendMessage.mock.calls[0][1];
      expect(options).toBeDefined();
      if (!options) throw new Error('Options should be defined');
      const payload = JSON.parse(options.payload?.toString() ?? '');
      const text = payload.text;

      expect(text).toContain('HELP');
      expect(text).toContain('Provides instructions');
      expect(text).toContain('help message 1');
      expect(text).toContain('second help message');
      expect(
        canParseMarkdownV2.mock.results.every(
          (result) => result.value === true,
        ),
      ).toBeTruthy();
    });
  });
});
