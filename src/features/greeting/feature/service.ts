import { TelegramService, User } from '@core/telegram';
import { MarkdownBuilder } from '@core/util/markdownBuilder';
import { CommandV2 } from '@core/util/commandV2';
import { UserService } from '@features/user';
import { constants } from '../greeting.constants';

export function greetUser(
  _command: CommandV2,
  from: User,
  chatId: number,
): void {
  const responseText = `${constants.GREETING_MESSAGE_PREFIX} ${
    from.first_name ?? constants.DEFAULT_USER_NAME
  }${constants.GREETING_MESSAGE_SUFFIX}${constants.GREETING_MESSAGE_QUESTION}`;

  TelegramService.sendMessage({
    chatId,
    markdown: new MarkdownBuilder(responseText),
    replyMarkup: {
      inline_keyboard: [
        [
          {
            text: constants.MENU_BUS_BUTTON_TEXT,
            callback_data: constants.MENU_BUS_BUTTON_CALLBACK,
          },
          {
            text: constants.MENU_SCRABBLE_BUTTON_TEXT,
            callback_data: constants.MENU_SCRABBLE_BUTTON_CALLBACK,
          },
        ],
        [
          {
            text: constants.MENU_USER_BUTTON_TEXT,
            callback_data: constants.MENU_USER_BUTTON_CALLBACK,
          },
          {
            text: constants.MENU_HELP_BUTTON_TEXT,
            callback_data: constants.MENU_HELP_BUTTON_CALLBACK,
          },
        ],
        [
          {
            text: constants.MENU_VERSION_BUTTON_TEXT,
            callback_data: constants.MENU_VERSION_BUTTON_CALLBACK,
          },
        ],
      ],
    },
  });

  new UserService().updateProfile(from);
}
