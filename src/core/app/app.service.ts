import { LoggerService } from '@core/logger';
import { Message, TelegramService, Update } from '@core/telegram';
import { hasKey } from '@core/util/predicates';
import { BusService } from '@features/bus';
import { VersionService } from '@features/version';

export class App {
  busService: BusService;
  loggerService: LoggerService;
  telegramService: TelegramService;

  constructor() {
    this.busService = new BusService();
    this.loggerService = new LoggerService();
    this.telegramService = new TelegramService();
  }

  processUpdate(update: Update) {
    if (hasKey(update, 'message')) {
      this.handleMessageUpdate(update.message);
    } else {
      this.loggerService.info(
        `Update handler for this update not implemented: ${JSON.stringify(
          update,
        )}`,
      );
    }
  }

  private handleMessageUpdate(message: Message) {
    const chatId = message.chat.id;
    const text = message.text ?? '';

    if (text === '/start') {
      const responseText = `Hello ${
        message.chat.first_name ?? ''
      }! This is Yeng Jeng Bot!`;
      this.telegramService.sendMessage({ chatId, text: responseText });
    } else if (text === '/version') {
      const responseText = `Yeng Jeng Bot\n${VersionService.getVersion()}`;
      this.telegramService.sendMessage({ chatId, text: responseText });
    } else if (text.split(' ')[0].toUpperCase() === 'BUS') {
      this.busService.processMessage(message);
    } else if (text.split(' ')[0].toUpperCase() === 'HELP') {
      this.telegramService.sendMessage({
        chatId,
        text:
          '----- HELP -----\n' +
          'BUS [BUS NUMBER]: Gets the bus stop timings for the bus stop with bus stop number. For example, type BUS 12345\n' +
          'BUS : Type BUS without a bus stop number to get the timings for the previously requested bus stop.',
      });
    } else {
      this.telegramService.sendMessage({
        chatId,
        text: "Sorry... I don't understand what you just said :(\nPlease type HELP for more information",
      });
    }
  }
}
