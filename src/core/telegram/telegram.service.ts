import { ConfigService } from '@core/config';
import { Message, ResponseBody, User } from './telegram.type';
import { TelegramConfig } from './telegram.config';
import { UrlFetchService } from '@core/urlFetch';
import { hasKey } from '@core/util/predicates';
import { LoggerService } from '@core/logger';
import { MarkdownBuilder } from '@core/util/markdownBuilder';

export class TelegramService {
  configService = new ConfigService<TelegramConfig>();
  loggerService = new LoggerService();
  token = this.configService.get('TELEGRAM_TOKEN');
  webAppURL = this.configService.get('WEB_APP_URL');
  telegramURL = `https://api.telegram.org/bot${this.token}`;

  private fetchAndLog<T>(url: string): ResponseBody<T> {
    this.loggerService.info(`Fetching telegram response: ${url}`);
    const result = UrlFetchService.fetch(url);
    const contentText = hasKey(result, 'Ok')
      ? result.Ok.getContentText()
      : result.Err.getContentText();

    this.loggerService.info(`Fetched telegram response: ${contentText}`);
    return JSON.parse(contentText);
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
    markdown,
  }: {
    chatId: number;
    markdown: MarkdownBuilder;
  }): ResponseBody<Message> {
    const encodedText = encodeURIComponent(markdown.build());
    const url = `${this.telegramURL}/sendMessage?chat_id=${chatId}&text=${encodedText}&parse_mode=MarkdownV2`;
    return this.fetchAndLog(url);
  }
}
