import { AppService } from '@core/appService';
import { Message, TelegramService, Update } from '@core/telegram';
import { hasKey } from '@core/util/predicates';

export class GreetingService extends AppService {
  override APP_SERVICE_COMMAND_WORD = 'start';
  private readonly telegramService: TelegramService;

  constructor() {
    super();
    this.telegramService = new TelegramService();
  }

  override async processUpdate(update: Update) {
    if (hasKey(update, 'message')) {
      this.handleMessageUpdate(update.message);
    }
  }

  override help(): string {
    return '*GREETING*\n' + 'START: Start using Yeng Jeng bot :\\)';
  }

  private handleMessageUpdate(message: Message) {
    const chat = message.chat;

    const responseText = `Hello ${
      chat.first_name ?? ''
    }\\! This is Yeng Jeng Bot\\!`;
    this.telegramService.sendMessage({ chatId: chat.id, text: responseText });
  }
}
