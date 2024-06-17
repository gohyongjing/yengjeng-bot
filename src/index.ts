import { App } from '@core/app';
import { WebAppEvent } from '@core/googleAppsScript';
import { TelegramService, isUpdate } from '@core/telegram';

let app: App;

// @ts-ignore
function main(): void {
  app = new App();
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
  const update = JSON.parse(e.postData.contents);
  if (!isUpdate(update)) {
    Logger.log('Not a telegram update!');
    Logger.log(update);
  } else {
    app.receiveUpdate(update);
  }
}
