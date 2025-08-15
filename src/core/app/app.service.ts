import { LoggerService } from '@core/logger';
import { TelegramService, Update } from '@core/telegram';
import { hasKey } from '@core/util/predicates';
import { BusService } from '@features/bus';
import { FriendService } from '@features/friend';
import { GreetingService } from '@features/greeting';
import { HelpService } from '@features/help';
import { ScrabbleService } from '@features/scrabble';
import { UserService } from '@features/user';
import { VersionService } from '@features/version';
import { AppService } from '../appService/appService.type';
import { Command } from '@core/util/command';
import { MarkdownBuilder } from '@core/util/markdownBuilder';
import { ErrorService } from '@core/error/error.service';

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
  helpService: HelpService = new HelpService(this.services);

  processUpdate(update: Update) {
    try {
      if (hasKey(update, 'message') || hasKey(update, 'callback_query')) {
        const rawCommand = hasKey(update, 'message')
          ? update.message.text
          : update.callback_query.data;
        const command = new Command(rawCommand ?? '');
        for (const service of this.services) {
          if (command.isCommand(service.APP_SERVICE_COMMAND_WORD)) {
            this.errorService.withErrorHandling(() => {
              this.loggerService.info('Processing update...');
              service.processUpdate(update);
            });
            return;
          }
        }
        this.helpService.processUpdate(update);
      } else {
        this.loggerService.info(
          `Update handler for this update not implemented: ${JSON.stringify(
            update,
          )}`,
        );
      }
    } catch (e) {
      this.handleError(update, e);
    }
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
