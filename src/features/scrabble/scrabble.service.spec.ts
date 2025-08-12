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

          const actualUrl = sendMessage.mock.calls[0][0];

          expect(
            actualUrl.includes(encodeURIComponent('Is the word')),
          ).toBeTruthy();
          expect(
            actualUrl.includes(encodeURIComponent('a valid Scrabble word')),
          ).toBeTruthy();
          expect(actualUrl.includes(encodeURIComponent('?'))).toBeTruthy();

          expect(actualUrl.includes('Yes')).toBeTruthy();
          expect(actualUrl.includes('No')).toBeTruthy();
          expect(actualUrl.includes('inline_keyboard')).toBeTruthy();
        });

        it('should generate word of correct length', () => {
          const command = new Command('scrabble start 2');
          underTest.processCommand(command, MockUser, MockChat.id);

          const callArgs = sendMessage.mock.calls[0][0];
          const encodedText = callArgs.split('text=')[1].split('&')[0];
          const decodedText = decodeURIComponent(encodedText);
          const wordMatch = decodedText.match(
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

          expect(
            sendMessage.mock.calls[0][0].includes(
              encodeURIComponent('Missing word length to start a game'),
            ),
          ).toBeTruthy();
        });

        it('should return error for non-numeric length', () => {
          const command = new Command('scrabble start abc');
          underTest.processCommand(command, MockUser, MockChat.id);

          expect(
            sendMessage.mock.calls[0][0].includes(
              encodeURIComponent('Invalid wordlength'),
            ),
          ).toBeTruthy();
        });

        it('should return error for zero length', () => {
          const command = new Command('scrabble start 0');
          underTest.processCommand(command, MockUser, MockChat.id);

          expect(
            sendMessage.mock.calls[0][0].includes(
              encodeURIComponent('Invalid wordlength'),
            ),
          ).toBeTruthy();
        });

        it('should return error for negative length intepreted as keyword argument', () => {
          const command = new Command('scrabble start -1'); //TODO: Perhaps make the error message more user friendly
          underTest.processCommand(command, MockUser, MockChat.id);

          expect(
            sendMessage.mock.calls[0][0].includes(
              encodeURIComponent('Missing word length to start a game'),
            ),
          ).toBeTruthy();
        });

        it('should return error for negative length as string', () => {
          const command = new Command('scrabble start "-1"');
          underTest.processCommand(command, MockUser, MockChat.id);

          expect(
            sendMessage.mock.calls[0][0].includes(
              encodeURIComponent('Invalid wordlength'),
            ),
          ).toBeTruthy();
        });

        it('should return error for unimplemented length', () => {
          const command = new Command('scrabble start 3');
          underTest.processCommand(command, MockUser, MockChat.id);

          expect(
            sendMessage.mock.calls[0][0].includes(
              encodeURIComponent('Words of that length is not implemented'),
            ),
          ).toBeTruthy();
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

          const actualUrl = sendMessage.mock.calls[1][0];

          expect(
            actualUrl.includes(encodeURIComponent('correct')) ||
              actualUrl.includes(encodeURIComponent('incorrect')),
          ).toBeTruthy();
          expect(
            actualUrl.includes(encodeURIComponent('You guessed true')),
          ).toBeTruthy();
          expect(
            actualUrl.includes(encodeURIComponent('is a valid')) ||
              actualUrl.includes(encodeURIComponent('not a valid')),
          ).toBeTruthy();
        });

        it('should handle NO guess correctly', () => {
          const startCommand = new Command('scrabble start 2');
          underTest.processCommand(startCommand, MockUser, MockChat.id);
          jest.clearAllMocks();

          const guessCommand = new Command('scrabble guess no');
          underTest.processCommand(guessCommand, MockUser, MockChat.id);

          const actualUrl = sendMessage.mock.calls[0][0];

          expect(
            actualUrl.includes(encodeURIComponent('correct')) ||
              actualUrl.includes(encodeURIComponent('incorrect')),
          ).toBeTruthy();
          expect(
            actualUrl.includes(encodeURIComponent('You guessed false')),
          ).toBeTruthy();
          expect(
            actualUrl.includes(encodeURIComponent('is a valid')) ||
              actualUrl.includes(encodeURIComponent('not a valid')),
          ).toBeTruthy();
        });

        it('should handle alternative YES formats', () => {
          const startCommand = new Command('scrabble start 2');
          underTest.processCommand(startCommand, MockUser, MockChat.id);

          const guessCommand = new Command('scrabble guess Y');
          underTest.processCommand(guessCommand, MockUser, MockChat.id);

          const actualUrl = sendMessage.mock.calls[1][0];

          expect(
            actualUrl.includes(encodeURIComponent('You guessed true')),
          ).toBeTruthy();
        });

        it('should handle alternative NO formats', () => {
          const startCommand = new Command('scrabble start 2');
          underTest.processCommand(startCommand, MockUser, MockChat.id);

          const guessCommand = new Command('scrabble guess N');
          underTest.processCommand(guessCommand, MockUser, MockChat.id);

          const actualUrl = sendMessage.mock.calls[1][0];

          expect(
            actualUrl.includes(encodeURIComponent('You guessed false')),
          ).toBeTruthy();
        });
      });

      describe('invalid guess', () => {
        it('should return error for missing guess', () => {
          const command = new Command('scrabble guess');
          underTest.processCommand(command, MockUser, MockChat.id);

          expect(
            sendMessage.mock.calls[0][0].includes(
              encodeURIComponent('Invalid guess'),
            ),
          ).toBeTruthy();
        });

        it('should return error for invalid guess value', () => {
          const command = new Command('scrabble guess maybe');
          underTest.processCommand(command, MockUser, MockChat.id);

          expect(
            sendMessage.mock.calls[0][0].includes(
              encodeURIComponent('Invalid guess'),
            ),
          ).toBeTruthy();
        });
      });

      describe('game not in progress', () => {
        it('should return error when guessing without active game', () => {
          const command = new Command('scrabble guess yes');
          underTest.processCommand(command, MockUser, MockChat.id);

          expect(
            sendMessage.mock.calls[0][0].includes(
              encodeURIComponent('Game is not in progress'),
            ),
          ).toBeTruthy();
        });
      });
    });

    describe('STOP command', () => {
      it('should stop the game', () => {
        const startCommand = new Command('scrabble start 2');
        underTest.processCommand(startCommand, MockUser, MockChat.id);

        const stopCommand = new Command('scrabble stop');
        underTest.processCommand(stopCommand, MockUser, MockChat.id);

        expect(
          sendMessage.mock.calls[1][0].includes(
            encodeURIComponent('Game stopped'),
          ),
        ).toBeTruthy();

        const guessCommand = new Command('scrabble guess yes');
        underTest.processCommand(guessCommand, MockUser, MockChat.id);

        expect(
          sendMessage.mock.calls[2][0].includes(
            encodeURIComponent('Game is not in progress'),
          ),
        ).toBeTruthy();
      });
    });

    describe('invalid commands', () => {
      it('should return error for missing command', () => {
        const command = new Command('scrabble');
        underTest.processCommand(command, MockUser, MockChat.id);

        expect(
          sendMessage.mock.calls[0][0].includes(
            encodeURIComponent('Missing command'),
          ),
        ).toBeTruthy();
      });

      it('should return error for invalid subcommand', () => {
        const command = new Command('scrabble invalid');
        underTest.processCommand(command, MockUser, MockChat.id);

        expect(
          sendMessage.mock.calls[0][0].includes(
            encodeURIComponent('Invalid command'),
          ),
        ).toBeTruthy();
      });
    });
  });
});
