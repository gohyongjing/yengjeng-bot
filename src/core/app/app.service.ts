import { LoggerService } from '@core/logger';
import { TelegramService, Update } from '@core/telegram';
import { hasKey } from '@core/util/predicates';
import { BusService } from '@features/bus';
import { GreetingService } from '@features/greeting';
import { HelpService } from '@features/help';
import { ScrabbleService } from '@features/scrabble';
import { VersionService } from '@features/version';
import { AppService } from '../appService/appService.type';
import { Command } from '@core/util/command';

export class App {
  loggerService: LoggerService = new LoggerService();
  telegramService: TelegramService = new TelegramService();
  services: AppService[] = [
    new BusService(),
    new GreetingService(),
    new ScrabbleService(),
    new VersionService(),
  ];
  helpService: HelpService = new HelpService(this.services);

  processUpdate(update: Update) {
    if (hasKey(update, 'message')) {
      const command = new Command(update.message.text ?? '');
      for (const service of this.services) {
        if (command.isCommand(service.APP_SERVICE_COMMAND_WORD)) {
          service.processUpdate(update);
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
  }
}
