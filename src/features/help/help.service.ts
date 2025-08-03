import { AppService } from '@core/appService';
import { LoggerService } from '@core/logger';
import {
  Message,
  TelegramService,
  Update,
  CallbackQuery,
} from '@core/telegram';
import { Command } from '@core/util/command';
import { MarkdownBuilder } from '@core/util/markdownBuilder';
import { hasKey } from '@core/util/predicates';

export class HelpService extends AppService {
  override APP_SERVICE_COMMAND_WORD = 'help';

  loggerService: LoggerService;
  services: AppService[];

  constructor(services: AppService[]) {
    super();
    this.loggerService = new LoggerService();
    this.services = services;
  }

  override async processUpdate(update: Update): Promise<void> {
    if (hasKey(update, 'message')) {
      const command = new Command(update.message.text ?? '');

      if (command.isCommand(this.APP_SERVICE_COMMAND_WORD)) {
        this.processMessage(update.message);
        return;
      }

      TelegramService.sendMessage({
        chatId: update.message.chat.id,
        markdown: new MarkdownBuilder(
          "Sorry... I don't understand what you just said :(\nPlease type HELP for more information",
        ),
      });
    } else if (hasKey(update, 'callback_query')) {
      this.processCallbackQuery(update.callback_query);
    }
  }

  override help(): string {
    return '*HELP*\nHELP: Provides instructions to use features provided';
  }

  processMessage(message: Message) {
    const command = new Command(message.text ?? '');
    this.processCommand(command, message.chat.id);
  }

  processCallbackQuery(callbackQuery: CallbackQuery) {
    const data = callbackQuery.data;
    if (!data) {
      this.loggerService.info(`Invalid callback query data: ${data}`);
      return;
    }

    const command = new Command(data);
    this.processCommand(command, callbackQuery.from.id);
  }

  private processCommand(command: Command, chatId: number) {
    if (command.isCommand(this.APP_SERVICE_COMMAND_WORD)) {
      const helpMessages = [this.help()].concat(
        this.services.map((service) => service.help()),
      );
      TelegramService.sendMessage({
        chatId,
        markdown: new MarkdownBuilder(helpMessages.join('\n')),
      });
    }
  }
}
