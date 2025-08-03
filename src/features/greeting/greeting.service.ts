import { AppService } from '@core/appService';
import { Message, TelegramService, Update } from '@core/telegram';
import { MarkdownBuilder } from '@core/util/markdownBuilder';
import { hasKey } from '@core/util/predicates';

export class GreetingService extends AppService {
  override APP_SERVICE_COMMAND_WORD = 'start';

  constructor() {
    super();
  }

  override async processUpdate(update: Update) {
    if (hasKey(update, 'message')) {
      this.handleMessageUpdate(update.message);
    }
  }

  override help(): string {
    return '*GREETING*\nSTART: Start using Yeng Jeng bot :)';
  }

  private handleMessageUpdate(message: Message) {
    const chat = message.chat;

    const responseText = `Hello ${
      chat.first_name ?? ''
    }! This is Yeng Jeng Bot!\n\nWhat would you like to do?`;

    TelegramService.sendMessage({
      chatId: chat.id,
      markdown: new MarkdownBuilder(responseText),
      replyMarkup: {
        inline_keyboard: [
          [
            { text: '🚌 Bus Timings', callback_data: '/bus' },
            { text: '🎲 Scrabble Game', callback_data: '/scrabble' },
          ],
          [{ text: '❓ Help', callback_data: '/help' }],
        ],
      },
    });
  }
}
