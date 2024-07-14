import { AppService } from '@core/appService';
import { LoggerService } from '@core/logger';
import { Message, TelegramService, Update } from '@core/telegram';
import { Command } from '@core/util/command';
import { hasKey } from '@core/util/predicates';

export class HelpService extends AppService {
  override APP_SERVICE_COMMAND_WORD = 'help';

  loggerService: LoggerService;
  telegramService: TelegramService;
  services: AppService[];

  constructor(services: AppService[]) {
    super();
    this.loggerService = new LoggerService();
    this.telegramService = new TelegramService();
    this.services = services;
  }

  override async processUpdate(update: Update): Promise<void> {
    if (hasKey(update, 'message')) {
      const command = new Command(update.message.text ?? '');

      if (command.isCommand(this.APP_SERVICE_COMMAND_WORD)) {
        this.processMessage(update.message);
        return;
      }

      this.telegramService.sendMessage({
        chatId: update.message.chat.id,
        text: "Sorry\\.\\.\\. I don\\'t understand what you just said \\:\\(\nPlease type HELP for more information",
      });
    }
  }

  override help(): string {
    return '*HELP*\n' + 'HELP: Provides instructions to use features provided';
  }

  processMessage(message: Message) {
    const helpMessages = [this.help()].concat(
      this.services.map((service) => service.help()),
    );
    const chatId = message.chat.id;
    this.telegramService.sendMessage({
      chatId,
      text: helpMessages.join('\n'),
    });
  }
}
