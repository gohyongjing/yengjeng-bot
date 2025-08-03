import { AppService } from '@core/appService';
import { TelegramService, User } from '@core/telegram';
import { MarkdownBuilder } from '@core/util/markdownBuilder';
import { Command } from '@core/util/command';

export class GreetingService extends AppService {
  override APP_SERVICE_COMMAND_WORD = 'start';

  override help(): string {
    return '*GREETING*\nSTART: Start using Yeng Jeng bot :)';
  }

  override processCommand(_command: Command, from: User, chatId: number): void {
    const responseText = `Hello ${
      from.first_name ?? ''
    }! This is Yeng Jeng Bot!\n\nWhat would you like to do?`;

    TelegramService.sendMessage({
      chatId,
      markdown: new MarkdownBuilder(responseText),
      replyMarkup: {
        inline_keyboard: [
          [
            { text: '🚌 Bus Timings', callback_data: '/bus' },
            { text: '🎲 Scrabble Game', callback_data: '/scrabble' },
          ],
          [
            { text: '❓ Help', callback_data: '/help' },
            { text: '🆕 Version', callback_data: '/version' },
          ],
        ],
      },
    });
  }
}
