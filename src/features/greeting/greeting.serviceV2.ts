import { TelegramService, User } from '@core/telegram';
import { MarkdownBuilder } from '@core/util/markdownBuilder';
import { CommandV2 } from '@core/util/commandV2';
import { UserService } from '@features/user';
import { Feature } from '@core/util/commandHandlerBuilder/types';

export const greetingFeature: Feature = {
  commandWord: 'start',
  description: "Hello! I'm Yeng Jeng Bot!",
  button: null,
  help: 'Start using Yeng Jeng bot :)',
  handler: greetUser,
};

function greetUser(_command: CommandV2, from: User, chatId: number): void {
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
          { text: '👤 My Profile', callback_data: '/user' },
          { text: '❓ Help', callback_data: '/help' },
        ],
        [{ text: '🆕 Version', callback_data: '/version' }],
      ],
    },
  });

  new UserService().updateProfile(from);
}
