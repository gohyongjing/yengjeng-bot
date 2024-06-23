import { App } from '@core/app';
import { WebAppEvent } from '@core/googleAppsScript';
import { LoggerService } from '@core/logger';
import { TelegramService, isUpdate } from '@core/telegram';

// @ts-ignore
function main(): void {
  new TelegramService().setWebhook();

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
  const loggerService = new LoggerService();
  try {
    const update = JSON.parse(e.postData.contents);
    if (!isUpdate(update)) {
      loggerService.warn(`Not a telegram update! ${e.postData.contents}`);
    } else {
      new App().processUpdate(update);
    }
  } catch (e) {
    loggerService.error(e);
  }
}
