import {
  Message,
  TelegramService,
  Update,
  CallbackQuery,
} from '@core/telegram';
import { hasKey } from '@core/util/predicates';
import { AppService } from '@core/appService';
import { Command } from '@core/util/command';
import { MarkdownBuilder } from '@core/util/markdownBuilder';
import { LoggerService } from '@core/logger';
import { ScrabbleData } from './scrabble.data';
import { constants } from './scrabble.constants';
import { GameState, ScrabbleCommand } from './scrabble.type';

export class ScrabbleService extends AppService {
  override APP_SERVICE_COMMAND_WORD = 'scrabble';

  scrabbleData: ScrabbleData;
  loggerService: LoggerService;

  constructor() {
    super();
    this.scrabbleData = new ScrabbleData();
    this.loggerService = new LoggerService();
  }

  async processUpdate(update: Update) {
    if (hasKey(update, 'message')) {
      this.processMessage(update.message);
    } else if (hasKey(update, 'callback_query')) {
      this.processCallbackQuery(update.callback_query);
    }
  }

  override help(): string {
    return (
      `🎲 *Scrabble Word Guessing Challenge*\n\n` +
      [constants.HELP_START, constants.HELP_GUESS, constants.HELP_STOP].join(
        '\n',
      )
    );
  }

  processMessage(message: Message) {
    const userId = message.chat.id;
    const text = message.text ?? '';
    const command = this.parseCommand(text);
    this.loggerService.info(`Received command: ${JSON.stringify(command)}`);

    if (!command.isValid) {
      TelegramService.sendMessage({
        chatId: userId,
        markdown: new MarkdownBuilder(command.message),
      });
      return;
    }

    const state = this.scrabbleData.readGameState(userId);
    if (command.subCommand === 'START') {
      const word = this.generateWord(command.length);
      this.scrabbleData.updateGameState(userId, {
        status: 'IN PROGRESS',
        guessingWord: word,
      });
      TelegramService.sendMessage({
        chatId: userId,
        markdown: new MarkdownBuilder(
          `Is the word "${word}" a valid Scrabble word?`,
        ),
        replyMarkup: {
          inline_keyboard: [
            [
              { text: 'Yes', callback_data: 'SCRABBLE GUESS YES' },
              { text: 'No', callback_data: 'SCRABBLE GUESS NO' },
            ],
          ],
        },
      });
    } else if (command.subCommand === 'STOP') {
      this.scrabbleData.updateGameState(userId, { status: 'STOPPED' });
      TelegramService.sendMessage({
        chatId: userId,
        markdown: new MarkdownBuilder(constants.MSG_GAME_STOPPED),
      });
    } else if (command.subCommand === 'GUESS') {
      this.handleGuess(userId, state, command.guess);
    }
  }

  processCallbackQuery(callbackQuery: CallbackQuery) {
    const userId = callbackQuery.from.id;
    const data = callbackQuery.data;

    if (!data || !data.startsWith('SCRABBLE GUESS ')) {
      this.loggerService.info(`Invalid callback query data: ${data}`);
      return;
    }

    const guess = data === 'SCRABBLE GUESS YES';
    const state = this.scrabbleData.readGameState(userId);

    this.handleGuess(userId, state, guess);
  }

  private handleGuess(userId: number, gameState: GameState, guess: boolean) {
    if (gameState.status === 'STOPPED') {
      TelegramService.sendMessage({
        chatId: userId,
        markdown: new MarkdownBuilder(
          `${constants.MSG_GAME_NOT_IN_PROGRESS}\n${constants.HELP_START}`,
        ),
      });
      return;
    }

    const word = gameState.guessingWord;
    const isValidWord = this.checkIsValidWord(word);
    const isCorrectGuess = isValidWord === guess;

    const responseMessage = `${isCorrectGuess ? '✅ ' : '❌'} That's ${
      isCorrectGuess ? 'correct' : 'incorrect'
    }! You guessed ${guess} but the word "${word}" is ${
      isValidWord ? 'a valid' : 'not a valid'
    } Scrabble word!`;

    TelegramService.sendMessage({
      chatId: userId,
      markdown: new MarkdownBuilder(responseMessage),
    });

    const newWord = this.generateWord(word.length);
    this.scrabbleData.updateGameState(userId, {
      status: 'IN PROGRESS',
      guessingWord: newWord,
    });

    TelegramService.sendMessage({
      chatId: userId,
      markdown: new MarkdownBuilder(
        `Is the word "${newWord}" a valid Scrabble word?`,
      ),
      replyMarkup: {
        inline_keyboard: [
          [
            { text: 'Yes', callback_data: 'SCRABBLE GUESS YES' },
            { text: 'No', callback_data: 'SCRABBLE GUESS NO' },
          ],
        ],
      },
    });
  }

  private parseCommand(rawCommand: string): ScrabbleCommand {
    const command = new Command(rawCommand);

    const subCommand = command.positionalArgs[0]?.toUpperCase();
    if (!subCommand) {
      return {
        isValid: false,
        message: `${constants.MSG_MISSING_COMMAND}\n\n${this.help()}`,
      };
    }

    const arg = command.positionalArgs[1]?.toUpperCase();
    if (subCommand === 'START') {
      if (!arg) {
        return {
          isValid: false,
          message: `${constants.MSG_MISSING_LENGTH}\n${constants.HELP_START}`,
        };
      }
      const length = parseInt(arg);
      if (isNaN(length) || !isFinite(length) || length <= 0) {
        return { isValid: false, message: constants.MSG_INVALID_LENGTH };
      }
      if (!constants.SCRABBLE_WORDS[length]) {
        return { isValid: false, message: constants.MSG_NOT_IMPLEMENTED };
      }
      return { isValid: true, subCommand: 'START', length: length };
    } else if (subCommand === 'GUESS') {
      const guess = this.parseBoolean(arg);
      if (guess === null) {
        return { isValid: false, message: constants.MSG_INVALID_GUESS };
      }
      return { isValid: true, subCommand: 'GUESS', guess: guess };
    } else if (subCommand === 'STOP') {
      return { isValid: true, subCommand: 'STOP' };
    }
    return {
      isValid: false,
      message: `${constants.MSG_INVALID_COMMAND}\n${constants.HELP_START}`,
    };
  }

  private parseBoolean(arg: string): boolean | null {
    if (
      arg === 'YES' ||
      arg === 'Y' ||
      arg === 'TRUE' ||
      arg === 'T' ||
      arg === '1'
    ) {
      return true;
    }
    if (
      arg === 'NO' ||
      arg === 'N' ||
      arg === 'FALSE' ||
      arg === 'F' ||
      arg === '0'
    ) {
      return false;
    }
    return null;
  }

  private generateWord(length: number) {
    if (Math.random() < 0.25) {
      return this.generateRandomWord(length);
    }
    return this.generateRandomWordWithVowels(length);
  }

  private generateRandomWord(length: number) {
    const chars = [];
    for (let i = 0; i < length; i++) {
      const randomChar = this.generateRandomChar();
      chars.push(randomChar);
    }
    return chars.join('');
  }

  private generateRandomWordWithVowels(length: number) {
    const chars = [];
    for (let i = 0; i < length; i++) {
      if (Math.random() < 0.5) {
        chars.push(this.generateRandomVowel());
      } else {
        chars.push(this.generateRandomChar());
      }
    }
    return chars.join('');
  }

  private generateRandomChar() {
    const minAscii = 'A'.charCodeAt(0);
    const maxAscii = 'Z'.charCodeAt(0);
    const randomAscii =
      Math.floor(Math.random() * (maxAscii - minAscii + 1)) + minAscii;
    return String.fromCharCode(randomAscii);
  }

  private generateRandomVowel() {
    const vowels = ['A', 'E', 'I', 'O', 'U', 'Y'];
    return vowels[Math.floor(Math.random() * vowels.length)];
  }

  private checkIsValidWord(word: string) {
    return constants.SCRABBLE_WORDS[word.length].includes(word);
  }
}
