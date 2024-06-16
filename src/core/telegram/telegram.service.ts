import { ConfigService } from '@core/config';
import { User } from './telegram.type';

export class TelegramService {
  token = new ConfigService<{ TELEGRAM_TOKEN: string }>().get('TELEGRAM_TOKEN');
  telegramURL = 'https://api.telegram.org/bot' + this.token;

  getMe(): User {
    const URL = this.telegramURL + '/getMe';
    const response = UrlFetchApp.fetch(URL);
    Logger.log(response.getContentText());
    return JSON.parse(response.getContentText());
  }

  // function setWebhook(){
  //   var URL = telegramURL + "/setWebhook?url=" + webAppURL;
  //   var response = UrlFetchApp.fetch(URL);
  //   Logger.log(response.getContentText());
  // }

  // function sendText(id, text){
  //   var encodedText = encodeURIComponent(text) //encodes the text so that escape characters send properly as a message (e.g. allows the use of \n)
  //   var URL = telegramURL + "/sendMessage?chat_id=" + id + "&text=" + encodedText + "&parsemode=" + "Markdown";
  //   var response = UrlFetchApp.fetch(URL);
  //   Logger.log(response.getContentText());
  // }
}
