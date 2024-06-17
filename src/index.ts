import { App } from '@core/app';
import { WebAppEvent } from '@core/googleAppsScript';
import { LoggerService } from '@core/logger';
import { TelegramService, isUpdate } from '@core/telegram';

let app: App;
let loggerService: LoggerService;
let telegramService: TelegramService;

// @ts-ignore
function main(): void {
  app = new App();
  loggerService = new LoggerService();
  telegramService = new TelegramService();
  telegramService.setWebhook();

  Logger.log({ doPost });
  Logger.log('Yeng Jeng Bot ready!');
}

/**
 * Google Apps Script runs the doPost method when receiveing a post request for the web app.
 * https://developers.google.com/apps-script/guides/web
 *
 * @param e Web App event
 */
function doPost(e: WebAppEvent) {
  try {
    const update = JSON.parse(e.postData.contents);
    if (!isUpdate(update)) {
      loggerService.warn(`Not a telegram update! ${e.postData.contents}`);
    } else {
      app.processUpdate(update);
    }
  } catch (e) {
    loggerService.error(e);
  }
}
