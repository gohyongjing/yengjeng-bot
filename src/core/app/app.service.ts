import { LoggerService } from '@core/logger';
import { TelegramService, Update, User } from '@core/telegram';
import { hasKey } from '@core/util/predicates';
import { FriendService } from '@features/friend';
import { HelpService } from '@features/help';
import { ScrabbleService } from '@features/scrabble';
import { UserService } from '@features/user';
import { AppService } from '../appService/appService.type';
import { MarkdownBuilder } from '@core/util/markdownBuilder';
import { ErrorService } from '@core/error/error.service';
import {
  handleCommand,
  parseCommandWithState,
} from '@features/command/command.service';
import { busFeature } from '@features/bus';
import { greetingFeature } from '@features/greeting';
import { versionFeature } from '@features/version';
import { Feature } from '@features/command/types/feature';
import { CommandV2 } from '@features/command/types/command';

export class App {
  loggerService: LoggerService = new LoggerService();
  telegramService: TelegramService = new TelegramService();
  errorService: ErrorService = new ErrorService();

  services: AppService[] = [
    new FriendService(),
    new ScrabbleService(),
    new UserService(),
  ];

  features: Feature[] = [greetingFeature, busFeature, versionFeature];

  helpService: HelpService = new HelpService(this.services);

  processUpdate(update: Update) {
    try {
      const user = this.getUser(update);
      const chatId = this.getChatId(update);
      if (!user || !chatId) {
        return;
      }
      const commandV2 = this.getCommand(update, user);
      if (!commandV2) {
        return;
      }

      const commandWord = commandV2.nextArg();
      const feature = this.getFeature(commandWord);
      if (feature) {
        return handleCommand(feature, commandV2, user, chatId);
      }

      const service = this.getService(commandWord);
      if (service) {
        service.processUpdate(update);
      } else {
        this.helpService.processUpdate(update);
      }
    } catch (error) {
      this.handleError(update, error);
    }
  }

  getCommand(update: Update, user: User): CommandV2 | null {
    if (hasKey(update, 'message')) {
      const text = update.message.text;
      if (!text) {
        this.loggerService.warn('Update message text not specified');
        return null;
      }
      return parseCommandWithState(new CommandV2(text), user.id);
    } else if (hasKey(update, 'callback_query')) {
      const data = update.callback_query.data;
      if (!data) {
        this.loggerService.warn('Update callback query data not specified');
        return null;
      }
      return parseCommandWithState(new CommandV2(data), user.id);
    }
    this.loggerService.warn('Unable to get command from unhandled update type');
    return null;
  }

  getService(commandWord: string | null): AppService | null {
    if (!commandWord) {
      return null;
    }
    return (
      this.services.find(
        (service) => service.APP_SERVICE_COMMAND_WORD === commandWord,
      ) ?? null
    );
  }

  getFeature(commandWord: string | null): Feature | null {
    if (!commandWord) {
      return null;
    }
    return (
      this.features.find((feature) => feature.commandWord === commandWord) ??
      null
    );
  }

  getUser(update: Update): User | null {
    if (hasKey(update, 'message')) {
      const user = update.message.from;
      if (user) {
        return user;
      }
      this.loggerService.warn('Update message user not specified');
      return null;
    } else if (hasKey(update, 'callback_query')) {
      return update.callback_query.from;
    }
    this.loggerService.warn('Unable to get user from unhandled update type');
    return null;
  }

  getChatId(update: Update): number | null {
    if (hasKey(update, 'message')) {
      return update.message.chat.id;
    } else if (hasKey(update, 'callback_query')) {
      const message = update.callback_query.message;
      if (!message) {
        this.loggerService.warn('Update callback query message not specified');
        return null;
      }
      return message.chat.id;
    }
    this.loggerService.warn('Unable to get chat ID from unhandled update type');
    return null;
  }

  private handleError(update: Update, error: unknown) {
    this.loggerService.error(
      `App failed to process update \n
      Error: ${error} \n
      Message: ${hasKey(error, 'message') ? error.message : ''} \n
      Stack: ${hasKey(error, 'stack') ? error.stack : ''} \n
      Update: ${JSON.stringify(update)}`,
    );
    if (hasKey(update, 'message') || hasKey(update, 'callback_query')) {
      const chatId = hasKey(update, 'message')
        ? update.message?.chat.id
        : update.callback_query.message?.chat.id;
      if (chatId) {
        TelegramService.sendMessage({
          chatId,
          markdown: new MarkdownBuilder(
            'An unexpected error has happened! Please try again later and contact Yong Jing if the problem persists!',
          ),
        });
      }
    }
  }
}
