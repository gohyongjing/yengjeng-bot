import { Message, TelegramService, Update } from '@core/telegram';
import { hasKey } from '@core/util/predicates';
import { AppService } from '@core/appService';
import { Command } from '@core/util/command';
import { MarkdownBuilder } from '@core/util/markdownBuilder';
import { LoggerService } from '@core/logger';

export class ScrabbleService extends AppService {
  override APP_SERVICE_COMMAND_WORD = 'scrabble';

  loggerService: LoggerService;

  constructor() {
    super();
    this.loggerService = new LoggerService();
  }

  async processUpdate(update: Update) {
    if (hasKey(update, 'message')) {
      this.processMessage(update.message);
    }
  }

  override help(): string {
    return (
      '*SCRABBLE*\n' +
      "SCRABBLE [NUMBER]: Returns a potential word of length N for you to guess if it's a valid Scrabble word. For example, type SCRABBLE 5"
    );
  }

  processMessage(message: Message) {
    const chatId = message.chat.id;
    const text = message.text ?? '';
    const command = new Command(text);

    // Get the length parameter from the command
    const lengthArg = command.positionalArgs[0];

    if (!lengthArg) {
      TelegramService.sendMessage({
        chatId,
        markdown: new MarkdownBuilder(
          'Please provide a word length. Usage: SCRABBLE [NUMBER]',
        ),
      });
      return;
    }

    const length = parseInt(lengthArg);

    if (isNaN(length) || length <= 0) {
      TelegramService.sendMessage({
        chatId,
        markdown: new MarkdownBuilder(
          'Please provide a valid positive number for word length.',
        ),
      });
      return;
    }

    // TODO: Implement word generation logic
    // - Generate a random word of the specified length
    // - This could involve fetching from a dictionary API or using a word list

    // TODO: Implement word validation logic
    // - Check if the generated word is a valid Scrabble word
    // - This could involve checking against official Scrabble word lists

    // TODO: Implement response formatting
    // - Format the response to show the word and ask user to guess if it's valid

    // Placeholder response for now
    const response = new MarkdownBuilder(
      `🎲 *Scrabble Word Challenge*\n\n` +
        `*Word Length:* ${length}\n\n` +
        `TODO: Generate a ${length}-letter word and ask user to guess if it's a valid Scrabble word.`,
    );

    TelegramService.sendMessage({ chatId, markdown: response });
  }
}
