import { ConfigService } from '@core/config';
import { Message, ResponseBody, User } from './telegram.type';
import { TelegramConfig } from './telegram.config';

export class TelegramService {
  configService = new ConfigService<TelegramConfig>();
  token = this.configService.get('TELEGRAM_TOKEN');
  webAppURL = this.configService.get('WEB_APP_URL');
  telegramURL = 'https://api.telegram.org/bot' + this.token;

  private fetchAndLog<T>(url: string): ResponseBody<T> {
    const response = UrlFetchApp.fetch(url);
    Logger.log(response.getContentText());
    return JSON.parse(response.getContentText());
  }

  getMe(): ResponseBody<User> {
    const url = `${this.telegramURL}/getMe`;
    return this.fetchAndLog(url);
  }

  setWebhook(): ResponseBody<boolean> {
    const url = `${this.telegramURL}/setWebhook?url=${this.webAppURL}`;
    return this.fetchAndLog(url);
  }

  sendMessage({
    chatId,
    text,
    parseMode = 'Markdown',
  }: {
    chatId: number;
    text: string;
    parseMode?: 'Markdown';
  }): ResponseBody<Message> {
    const encodedText = encodeURIComponent(text);
    const url = `${this.telegramURL}/sendMessage?chat_id=${chatId}&text=${encodedText}&parsemode=${parseMode}`;
    return this.fetchAndLog(url);
  }
}
