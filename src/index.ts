import { WebAppEvent } from '@core/googleAppsScript';
import { TelegramService } from '@core/telegram';
import { isUpdate } from '@core/telegram/telegram.predicates';

// @ts-ignore
function main(): void {
  const responseBody = new TelegramService().getMe();
  console.log({ responseBody, doPost });
}

function doPost(e: WebAppEvent) {
  Logger.log({ e });
  const json = JSON.parse(e.postData.contents);
  Logger.log(json);
  Logger.log('is update:', isUpdate(json));
}
