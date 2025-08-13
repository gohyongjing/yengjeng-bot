import { Update, Message, CallbackQuery, User } from '@core/telegram';
import { hasKey } from '@core/util/predicates';
import { Command } from '@core/util/command';
import { LoggerService } from '@core/logger';

export abstract class AppService {
  abstract APP_SERVICE_COMMAND_WORD: string;
  readonly loggerService: LoggerService;

  constructor() {
    this.loggerService = new LoggerService();
  }

  abstract help(): string;

  async processUpdate(update: Update): Promise<void> {
    if (hasKey(update, 'message')) {
      this.processMessage(update.message);
    } else if (hasKey(update, 'callback_query')) {
      this.processCallbackQuery(update.callback_query);
    }
  }

  processMessage(message: Message): void {
    const text = message.text ?? '';
    const command = new Command(text);

    if (!command.isCommand(this.APP_SERVICE_COMMAND_WORD)) {
      this.loggerService.warn(
        `Unknown command ${command} for ${this.APP_SERVICE_COMMAND_WORD} service`,
      );
      return;
    }
    const user = message.from;
    if (!user) {
      this.loggerService.warn(
        `Command's user not specified for ${this.APP_SERVICE_COMMAND_WORD} service`,
      );
      return;
    }
    this.processCommand(command, user, message.chat.id);
  }

  processCallbackQuery(callbackQuery: CallbackQuery): void {
    const data = callbackQuery.data;
    if (!data) {
      return;
    }

    const command = new Command(data);
    if (!command.isCommand(this.APP_SERVICE_COMMAND_WORD)) {
      this.loggerService.warn(
        `Unknown command ${command} for ${this.APP_SERVICE_COMMAND_WORD} service`,
      );
      return;
    }
    const user = callbackQuery.from;
    const chatId = callbackQuery.message?.chat.id;
    if (!chatId) {
      this.loggerService.warn(
        `Chat ID not available in callback query for ${this.APP_SERVICE_COMMAND_WORD} service`,
      );
      return;
    }
    this.processCommand(command, user, chatId);
  }

  abstract processCommand(command: Command, from: User, chatId: number): void;
}
