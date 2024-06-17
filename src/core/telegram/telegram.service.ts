import { ConfigService } from '@core/config';
import { ResponseBody, User } from './telegram.type';
import { TelegramConfig } from './telegram.config';

export class TelegramService {
  configService = new ConfigService<TelegramConfig>();
  token = this.configService.get('TELEGRAM_TOKEN');
  webAppURL = this.configService.get('WEB_APP_URL');
  telegramURL = 'https://api.telegram.org/bot' + this.token;

  getMe(): ResponseBody<User> {
    const url = `${this.telegramURL}/getMe`;
    const response = UrlFetchApp.fetch(url);
    Logger.log(response.getContentText());
    return JSON.parse(response.getContentText());
  }

  setWebhook(): ResponseBody<boolean> {
    const url = `${this.telegramURL}/setWebhook?url=${this.webAppURL}`;
    const response = UrlFetchApp.fetch(url);
    Logger.log(response.getContentText());
    return JSON.parse(response.getContentText());
  }

  // sendMessage(chat_id: string, text: string): ResponseBody<Message> {
  //   var encodedText = encodeURIComponent(text) //encodes the text so that escape characters send properly as a message (e.g. allows the use of \n)
  //   var url = this.telegramURL + "/sendMessage?chat_id=" + chat_id + "&text=" + encodedText + "&parsemode=" + "Markdown";
  //   var response = UrlFetchApp.fetch(url);
  //   Logger.log(response.getContentText());
  //   return JSON.parse(response.getContentText());
  // }
}
