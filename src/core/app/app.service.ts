import { LoggerService } from '@core/logger';
import { TelegramService, Update, User } from '@core/telegram';
import { hasKey } from '@core/util/predicates';
import { BusService } from '@features/bus';
import { FriendService } from '@features/friend';
import { GreetingService } from '@features/greeting';
import { HelpService } from '@features/help';
import { ScrabbleService } from '@features/scrabble';
import { UserService } from '@features/user';
import { VersionService } from '@features/version';
import { AppService } from '../appService/appService.type';
import { MarkdownBuilder } from '@core/util/markdownBuilder';
import { ErrorService } from '@core/error/error.service';
import { handleCommand } from '@core/util/commandHandlerBuilder/commandHandlerBuilder.util';
import { CommandV2 } from '@core/util/commandV2';
import { greetingFeature } from '@features/greeting/greeting.serviceV2';
import { Feature } from '@core/util/commandHandlerBuilder/types';

export class App {
  loggerService: LoggerService = new LoggerService();
  telegramService: TelegramService = new TelegramService();
  errorService: ErrorService = new ErrorService();

  services: AppService[] = [
    new BusService(),
    new FriendService(),
    new GreetingService(),
    new ScrabbleService(),
    new UserService(),
    new VersionService(),
  ];

  features: Feature[] = [greetingFeature];

  helpService: HelpService = new HelpService(this.services);

  processUpdate(update: Update) {
    try {
      const commandV2 = this.getCommand(update);
      if (!commandV2) {
        return;
      }
      const service = this.getService(commandV2);
      const user = this.getUser(update);
      const chatId = this.getChatId(update);
      if (!user || !chatId) {
        return;
      }

      const feature = this.getFeature(commandV2);
      if (feature) {
        handleCommand(feature, commandV2, user, chatId);
      } else if (service) {
        service.processUpdate(update);
      } else {
        this.helpService.processUpdate(update);
      }
    } catch (error) {
      this.handleError(update, error);
    }
  }

  //TODO: Move to utils so that feature can simply take in update
  getCommand(update: Update): CommandV2 | null {
    if (hasKey(update, 'message')) {
      const text = update.message.text;
      if (!text) {
        this.loggerService.warn('Update message text not specified');
        return null;
      }
      return new CommandV2(text);
    } else if (hasKey(update, 'callback_query')) {
      const data = update.callback_query.data;
      if (!data) {
        this.loggerService.warn('Update callback query data not specified');
        return null;
      }
      return new CommandV2(data);
    }
    this.loggerService.warn('Unable to get command from unhandled update type');
    return null;
  }

  getService(command: CommandV2): AppService | null {
    const commandWord = command.nextArg();
    if (!commandWord) {
      return null;
    }
    return (
      this.services.find(
        (service) => service.APP_SERVICE_COMMAND_WORD === commandWord,
      ) ?? null
    );
  }

  getFeature(command: CommandV2): Feature | null {
    const commandWord = command.nextArg();
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
