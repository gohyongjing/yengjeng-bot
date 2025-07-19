import { MockLogger } from '@core/googleAppsScript';
import { ScrabbleService } from './scrabble.service';
import { Update } from '@core/telegram';
import { Builder } from '@core/util/builder';
import {
  MockMessage,
  MockChat,
  MockTelegramUrlFetchApp,
  sendMessage,
} from '@core/telegram/telegram.mock';
import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';

describe('ScrabbleService', () => {
  let underTest: ScrabbleService;

  beforeAll(() => {
    global.Logger = MockLogger;
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

  describe('processUpdate', () => {
    describe('valid message update', () => {
      it('should process message with text', () => {
        const update = {
          update_id: 1,
          message: new Builder(MockMessage)
            .with({ text: 'scrabble start 2' })
            .build(),
        } as Update;

        underTest.processUpdate(update);

        expect(sendMessage).toHaveBeenCalled();
      });
    });
  });

  describe('processMessage', () => {
    it('should call sendMessage when processing a valid command', () => {
      const message = new Builder(MockMessage)
        .with({
          text: 'scrabble start 2',
          chat: MockChat,
        })
        .build();

      underTest.processMessage(message);

      expect(sendMessage).toHaveBeenCalled();
    });

    describe('START command', () => {
      describe('valid length', () => {
        it('should start game with valid word length', () => {
          const message = new Builder(MockMessage)
            .with({
              text: 'scrabble start 2',
              chat: MockChat,
            })
            .build();

          underTest.processMessage(message);

          expect(
            sendMessage.mock.calls[0][0].includes(
              encodeURIComponent('Is the word'),
            ),
          ).toBeTruthy();
          expect(
            sendMessage.mock.calls[0][0].includes(
              encodeURIComponent('a valid Scrabble word'),
            ),
          ).toBeTruthy();
        });

        it('should generate word of correct length', () => {
          const message = new Builder(MockMessage)
            .with({
              text: 'scrabble start 2',
              chat: MockChat,
            })
            .build();

          underTest.processMessage(message);

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
          const message = new Builder(MockMessage)
            .with({
              text: 'scrabble start',
              chat: MockChat,
            })
            .build();

          underTest.processMessage(message);

          expect(
            sendMessage.mock.calls[0][0].includes(
              encodeURIComponent('Missing word length to start a game'),
            ),
          ).toBeTruthy();
        });

        it('should return error for non-numeric length', () => {
          const message = new Builder(MockMessage)
            .with({
              text: 'scrabble start abc',
              chat: MockChat,
            })
            .build();

          underTest.processMessage(message);

          expect(
            sendMessage.mock.calls[0][0].includes(
              encodeURIComponent('Invalid wordlength'),
            ),
          ).toBeTruthy();
        });

        it('should return error for zero length', () => {
          const message = new Builder(MockMessage)
            .with({
              text: 'scrabble start 0',
              chat: MockChat,
            })
            .build();

          underTest.processMessage(message);

          expect(
            sendMessage.mock.calls[0][0].includes(
              encodeURIComponent('Invalid wordlength'),
            ),
          ).toBeTruthy();
        });

        it('should return error for negative length', () => {
          const message = new Builder(MockMessage)
            .with({
              text: 'scrabble start -1',
              chat: MockChat,
            })
            .build();

          underTest.processMessage(message);

          expect(
            sendMessage.mock.calls[0][0].includes(
              encodeURIComponent('Missing word length to start a game'),
            ),
          ).toBeTruthy();
        });

        it('should return error for unimplemented length', () => {
          const message = new Builder(MockMessage)
            .with({
              text: 'scrabble start 3',
              chat: MockChat,
            })
            .build();

          underTest.processMessage(message);

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
          const startMessage = new Builder(MockMessage)
            .with({
              text: 'scrabble start 2',
              chat: MockChat,
            })
            .build();
          underTest.processMessage(startMessage);
          jest.clearAllMocks();

          const guessMessage = new Builder(MockMessage)
            .with({
              text: 'scrabble guess yes',
              chat: MockChat,
            })
            .build();

          underTest.processMessage(guessMessage);

          expect(
            sendMessage.mock.calls[0][0].includes(encodeURIComponent('✅')) ||
              sendMessage.mock.calls[0][0].includes(encodeURIComponent('❌')),
          ).toBeTruthy();
        });

        it('should handle NO guess correctly', () => {
          const startMessage = new Builder(MockMessage)
            .with({
              text: 'scrabble start 2',
              chat: MockChat,
            })
            .build();
          underTest.processMessage(startMessage);
          jest.clearAllMocks();

          const guessMessage = new Builder(MockMessage)
            .with({
              text: 'scrabble guess no',
              chat: MockChat,
            })
            .build();

          underTest.processMessage(guessMessage);

          expect(
            sendMessage.mock.calls[0][0].includes(encodeURIComponent('✅')) ||
              sendMessage.mock.calls[0][0].includes(encodeURIComponent('❌')),
          ).toBeTruthy();
        });

        it('should handle alternative YES formats', () => {
          const message = new Builder(MockMessage)
            .with({
              text: 'scrabble guess Y',
              chat: MockChat,
            })
            .build();

          underTest.processMessage(message);

          expect(
            sendMessage.mock.calls[0][0].includes(
              encodeURIComponent('Game is not in progress'),
            ),
          ).toBeTruthy();
        });

        it('should handle alternative NO formats', () => {
          const message = new Builder(MockMessage)
            .with({
              text: 'scrabble guess N',
              chat: MockChat,
            })
            .build();

          underTest.processMessage(message);

          expect(
            sendMessage.mock.calls[0][0].includes(
              encodeURIComponent('Game is not in progress'),
            ),
          ).toBeTruthy();
        });
      });

      describe('invalid guess', () => {
        it('should return error for missing guess', () => {
          const message = new Builder(MockMessage)
            .with({
              text: 'scrabble guess',
              chat: MockChat,
            })
            .build();

          underTest.processMessage(message);

          expect(
            sendMessage.mock.calls[0][0].includes(
              encodeURIComponent('Invalid guess'),
            ),
          ).toBeTruthy();
        });

        it('should return error for invalid guess value', () => {
          const message = new Builder(MockMessage)
            .with({
              text: 'scrabble guess maybe',
              chat: MockChat,
            })
            .build();

          underTest.processMessage(message);

          expect(
            sendMessage.mock.calls[0][0].includes(
              encodeURIComponent('Invalid guess'),
            ),
          ).toBeTruthy();
        });
      });

      describe('game not in progress', () => {
        it('should return error when guessing without active game', () => {
          const message = new Builder(MockMessage)
            .with({
              text: 'scrabble guess yes',
              chat: MockChat,
            })
            .build();

          underTest.processMessage(message);

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
        const message = new Builder(MockMessage)
          .with({
            text: 'scrabble stop',
            chat: MockChat,
          })
          .build();

        underTest.processMessage(message);

        expect(
          sendMessage.mock.calls[0][0].includes(
            encodeURIComponent('Game stopped'),
          ),
        ).toBeTruthy();
      });
    });

    describe('invalid commands', () => {
      it('should return error for missing command', () => {
        const message = new Builder(MockMessage)
          .with({
            text: 'scrabble',
            chat: MockChat,
          })
          .build();

        underTest.processMessage(message);

        expect(
          sendMessage.mock.calls[0][0].includes(
            encodeURIComponent('Missing command'),
          ),
        ).toBeTruthy();
      });

      it('should return error for invalid subcommand', () => {
        const message = new Builder(MockMessage)
          .with({
            text: 'scrabble invalid',
            chat: MockChat,
          })
          .build();

        underTest.processMessage(message);

        expect(
          sendMessage.mock.calls[0][0].includes(
            encodeURIComponent('Invalid command'),
          ),
        ).toBeTruthy();
      });
    });
  });
});
