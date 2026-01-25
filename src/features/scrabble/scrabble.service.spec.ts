import {
  MockChat,
  MockTelegramUrlFetchApp,
  MockUser,
  sendMessage,
} from '@core/telegram/telegram.mock';
import { ScrabbleService } from './scrabble.service';
import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';
import { Command } from '@core/util/command';

describe('ScrabbleService', () => {
  let underTest: ScrabbleService;

  beforeAll(() => {
    global.UrlFetchApp = MockTelegramUrlFetchApp;
  });

  beforeEach(() => {
    global.SpreadsheetApp = createMockSpreadsheetApp();
    underTest = new ScrabbleService();
    jest.clearAllMocks();
  });

  describe('help', () => {
    it('should return help text containing SCRABBLE', () => {
      const actual = underTest.help();
      expect(actual).toContain('SCRABBLE');
      expect(actual).toContain('START');
      expect(actual).toContain('GUESS');
      expect(actual).toContain('STOP');
    });
  });

  describe('processCommand', () => {
    describe('START command', () => {
      describe('valid length', () => {
        it('should start game with valid word length', () => {
          const command = new Command('scrabble start 2');
          underTest.processCommand(command, MockUser, MockChat.id);

          expect(sendMessage).toHaveBeenCalledTimes(1);
          const options = sendMessage.mock.calls[0][1];
          expect(options).toBeDefined();
          if (!options) throw new Error('Options should be defined');
          const payload = JSON.parse(options.payload?.toString() ?? '');
          const text = payload.text;

          expect(text).toContain('Is the word');
          expect(text).toContain('a valid Scrabble word');
          expect(text).toContain('?');
          expect(JSON.stringify(payload.reply_markup)).toContain('Yes');
          expect(JSON.stringify(payload.reply_markup)).toContain('No');
          expect(payload.reply_markup).toHaveProperty('inline_keyboard');
        });

        it('should generate word of correct length', () => {
          const command = new Command('scrabble start 2');
          underTest.processCommand(command, MockUser, MockChat.id);

          expect(sendMessage).toHaveBeenCalledTimes(1);
          const options = sendMessage.mock.calls[0][1];
          expect(options).toBeDefined();
          if (!options) throw new Error('Options should be defined');
          const payload = JSON.parse(options.payload?.toString() ?? '');
          const text = payload.text;
          const wordMatch = text.match(
            /Is the word \\"([A-Z]+)\\" a valid Scrabble word\\?/,
          );
          expect(wordMatch).toBeTruthy();
          expect(wordMatch![1]).toHaveLength(2);
        });
      });

      describe('invalid length', () => {
        it('should return error for missing length', () => {
          const command = new Command('scrabble start');
          underTest.processCommand(command, MockUser, MockChat.id);

          expect(sendMessage).toHaveBeenCalledTimes(1);
          const options = sendMessage.mock.calls[0][1];
          expect(options).toBeDefined();
          if (!options) throw new Error('Options should be defined');
          const payload = JSON.parse(options.payload?.toString() ?? '');
          expect(payload.text).toContain('Missing word length to start a game');
        });

        it('should return error for non-numeric length', () => {
          const command = new Command('scrabble start abc');
          underTest.processCommand(command, MockUser, MockChat.id);

          expect(sendMessage).toHaveBeenCalledTimes(1);
          const options = sendMessage.mock.calls[0][1];
          expect(options).toBeDefined();
          if (!options) throw new Error('Options should be defined');
          const payload = JSON.parse(options.payload?.toString() ?? '');
          expect(payload.text).toContain('Invalid wordlength');
        });

        it('should return error for zero length', () => {
          const command = new Command('scrabble start 0');
          underTest.processCommand(command, MockUser, MockChat.id);

          expect(sendMessage).toHaveBeenCalledTimes(1);
          const options = sendMessage.mock.calls[0][1];
          expect(options).toBeDefined();
          if (!options) throw new Error('Options should be defined');
          const payload = JSON.parse(options.payload?.toString() ?? '');
          expect(payload.text).toContain('Invalid wordlength');
        });

        it('should return error for negative length intepreted as keyword argument', () => {
          const command = new Command('scrabble start -1'); //TODO: Perhaps make the error message more user friendly
          underTest.processCommand(command, MockUser, MockChat.id);

          expect(sendMessage).toHaveBeenCalledTimes(1);
          const options = sendMessage.mock.calls[0][1];
          expect(options).toBeDefined();
          if (!options) throw new Error('Options should be defined');
          const payload = JSON.parse(options.payload?.toString() ?? '');
          expect(payload.text).toContain('Missing word length to start a game');
        });

        it('should return error for negative length as string', () => {
          const command = new Command('scrabble start "-1"');
          underTest.processCommand(command, MockUser, MockChat.id);

          expect(sendMessage).toHaveBeenCalledTimes(1);
          const options = sendMessage.mock.calls[0][1];
          expect(options).toBeDefined();
          if (!options) throw new Error('Options should be defined');
          const payload = JSON.parse(options.payload?.toString() ?? '');
          expect(payload.text).toContain('Invalid wordlength');
        });

        it('should return error for unimplemented length', () => {
          const command = new Command('scrabble start 3');
          underTest.processCommand(command, MockUser, MockChat.id);

          expect(sendMessage).toHaveBeenCalledTimes(1);
          const options = sendMessage.mock.calls[0][1];
          expect(options).toBeDefined();
          if (!options) throw new Error('Options should be defined');
          const payload = JSON.parse(options.payload?.toString() ?? '');
          expect(payload.text).toContain(
            'Words of that length is not implemented',
          );
        });
      });
    });

    describe('GUESS command', () => {
      describe('valid guess', () => {
        it('should handle YES guess correctly', () => {
          const startCommand = new Command('scrabble start 2');
          underTest.processCommand(startCommand, MockUser, MockChat.id);

          const guessCommand = new Command('scrabble guess yes');
          underTest.processCommand(guessCommand, MockUser, MockChat.id);

          expect(sendMessage).toHaveBeenCalledTimes(3);
          const resultCallIndex = sendMessage.mock.calls.length - 2;
          const options = sendMessage.mock.calls[resultCallIndex][1];
          expect(options).toBeDefined();
          if (!options) throw new Error('Options should be defined');
          const payload = JSON.parse(options.payload?.toString() ?? '');
          const text = payload.text;

          expect(
            text.includes('correct') || text.includes('incorrect'),
          ).toBeTruthy();
          expect(text).toContain('You guessed true');
          expect(
            text.includes('is a valid') || text.includes('not a valid'),
          ).toBeTruthy();
        });

        it('should handle NO guess correctly', () => {
          const startCommand = new Command('scrabble start 2');
          underTest.processCommand(startCommand, MockUser, MockChat.id);
          jest.clearAllMocks();

          const guessCommand = new Command('scrabble guess no');
          underTest.processCommand(guessCommand, MockUser, MockChat.id);

          expect(sendMessage).toHaveBeenCalledTimes(2);
          const options = sendMessage.mock.calls[0][1];
          expect(options).toBeDefined();
          if (!options) throw new Error('Options should be defined');
          const payload = JSON.parse(options.payload?.toString() ?? '');
          const text = payload.text;

          expect(
            text.includes('correct') || text.includes('incorrect'),
          ).toBeTruthy();
          expect(text).toContain('You guessed false');
          expect(
            text.includes('is a valid') || text.includes('not a valid'),
          ).toBeTruthy();
        });

        it('should handle alternative YES formats', () => {
          const startCommand = new Command('scrabble start 2');
          underTest.processCommand(startCommand, MockUser, MockChat.id);

          const guessCommand = new Command('scrabble guess Y');
          underTest.processCommand(guessCommand, MockUser, MockChat.id);

          expect(sendMessage).toHaveBeenCalledTimes(3);
          const resultCallIndex = sendMessage.mock.calls.length - 2;
          const options = sendMessage.mock.calls[resultCallIndex][1];
          expect(options).toBeDefined();
          if (!options) throw new Error('Options should be defined');
          const payload = JSON.parse(options.payload?.toString() ?? '');
          expect(payload.text).toContain('You guessed true');
        });

        it('should handle alternative NO formats', () => {
          const startCommand = new Command('scrabble start 2');
          underTest.processCommand(startCommand, MockUser, MockChat.id);

          const guessCommand = new Command('scrabble guess N');
          underTest.processCommand(guessCommand, MockUser, MockChat.id);

          expect(sendMessage).toHaveBeenCalledTimes(3);

          const resultCallIndex = sendMessage.mock.calls.length - 2;
          const options = sendMessage.mock.calls[resultCallIndex][1];
          expect(options).toBeDefined();
          if (!options) throw new Error('Options should be defined');
          const payload = JSON.parse(options.payload?.toString() ?? '');
          expect(payload.text).toContain('You guessed false');
        });
      });

      describe('invalid guess', () => {
        it('should return error for missing guess', () => {
          const command = new Command('scrabble guess');
          underTest.processCommand(command, MockUser, MockChat.id);

          expect(sendMessage).toHaveBeenCalledTimes(1);
          const options = sendMessage.mock.calls[0][1];
          expect(options).toBeDefined();
          if (!options) throw new Error('Options should be defined');
          const payload = JSON.parse(options.payload?.toString() ?? '');
          expect(payload.text).toContain('Invalid guess');
        });

        it('should return error for invalid guess value', () => {
          const command = new Command('scrabble guess maybe');
          underTest.processCommand(command, MockUser, MockChat.id);

          expect(sendMessage).toHaveBeenCalledTimes(1);
          const options = sendMessage.mock.calls[0][1];
          expect(options).toBeDefined();
          if (!options) throw new Error('Options should be defined');
          const payload = JSON.parse(options.payload?.toString() ?? '');
          expect(payload.text).toContain('Invalid guess');
        });
      });

      describe('game not in progress', () => {
        it('should return error when guessing without active game', () => {
          const command = new Command('scrabble guess yes');
          underTest.processCommand(command, MockUser, MockChat.id);

          expect(sendMessage).toHaveBeenCalledTimes(1);
          const options = sendMessage.mock.calls[0][1];
          expect(options).toBeDefined();
          if (!options) throw new Error('Options should be defined');
          const payload = JSON.parse(options.payload?.toString() ?? '');
          expect(payload.text).toContain('Game is not in progress');
        });
      });
    });

    describe('STOP command', () => {
      it('should stop the game', () => {
        const startCommand = new Command('scrabble start 2');
        underTest.processCommand(startCommand, MockUser, MockChat.id);

        const stopCommand = new Command('scrabble stop');
        underTest.processCommand(stopCommand, MockUser, MockChat.id);

        const lastCallIndex = sendMessage.mock.calls.length - 1;
        const options = sendMessage.mock.calls[lastCallIndex][1];
        expect(options).toBeDefined();
        if (!options) throw new Error('Options should be defined');
        const payload = JSON.parse(options.payload?.toString() ?? '');
        expect(payload.text).toContain('Game stopped');

        const guessCommand = new Command('scrabble guess yes');
        underTest.processCommand(guessCommand, MockUser, MockChat.id);

        const finalCallIndex = sendMessage.mock.calls.length - 1;
        const finalOptions = sendMessage.mock.calls[finalCallIndex][1];
        expect(finalOptions).toBeDefined();
        if (!finalOptions) throw new Error('Options should be defined');
        const finalPayload = JSON.parse(finalOptions.payload?.toString() ?? '');
        expect(finalPayload.text).toContain('Game is not in progress');
      });
    });

    describe('invalid commands', () => {
      it('should return error for missing command', () => {
        const command = new Command('scrabble');
        underTest.processCommand(command, MockUser, MockChat.id);

        expect(sendMessage).toHaveBeenCalledTimes(1);
        const options = sendMessage.mock.calls[0][1];
        expect(options).toBeDefined();
        if (!options) throw new Error('Options should be defined');
        const payload = JSON.parse(options.payload?.toString() ?? '');
        expect(payload.text).toContain('Missing command');
      });

      it('should return error for invalid subcommand', () => {
        const command = new Command('scrabble invalid');
        underTest.processCommand(command, MockUser, MockChat.id);

        expect(sendMessage).toHaveBeenCalledTimes(1);
        const options = sendMessage.mock.calls[0][1];
        expect(options).toBeDefined();
        if (!options) throw new Error('Options should be defined');
        const payload = JSON.parse(options.payload?.toString() ?? '');
        expect(payload.text).toContain('Invalid command');
      });
    });
  });
});
