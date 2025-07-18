import { ConfigService } from '@core/config';
import { Message, ResponseBody, User } from './telegram.type';
import { TelegramConfig } from './telegram.config';
import { UrlFetchService } from '@core/urlFetch';
import { hasKey } from '@core/util/predicates';
import { LoggerService } from '@core/logger';
import { MarkdownBuilder } from '@core/util/markdownBuilder';

export class TelegramService {
  private static configService = new ConfigService<TelegramConfig>();
  private static loggerService = new LoggerService();
  private static token = TelegramService.configService.get('TELEGRAM_TOKEN');
  private static webAppURL = TelegramService.configService.get('WEB_APP_URL');
  private static telegramURL = `https://api.telegram.org/bot${TelegramService.token}`;

  private static fetchAndLog<T>(url: string): ResponseBody<T> {
    TelegramService.loggerService.info('Fetching telegram response...');
    const result = UrlFetchService.fetch(url);
    const contentText = hasKey(result, 'Ok')
      ? result.Ok.getContentText()
      : result.Err.getContentText();

    TelegramService.loggerService.info(
      `Fetched telegram response: ${contentText}`,
    );
    return JSON.parse(contentText);
  }

  /**
   * Static method to send a message
   * @param chatId - The chat ID to send the message to
   * @param markdown - The markdown builder containing the message
   * @returns The response from Telegram API
   */
  static sendMessage({
    chatId,
    markdown,
  }: {
    chatId: number;
    markdown: MarkdownBuilder;
  }): ResponseBody<Message> {
    const encodedText = encodeURIComponent(markdown.build());
    const url = `${TelegramService.telegramURL}/sendMessage?chat_id=${chatId}&text=${encodedText}&parse_mode=MarkdownV2`;
    return TelegramService.fetchAndLog(url);
  }

  /**
   * Static method to get bot information
   * @returns The bot information from Telegram API
   */
  static getMe(): ResponseBody<User> {
    const url = `${TelegramService.telegramURL}/getMe`;
    return TelegramService.fetchAndLog(url);
  }

  /**
   * Static method to set webhook
   * @returns The response from Telegram API
   */
  static setWebhook(): ResponseBody<boolean> {
    const url = `${TelegramService.telegramURL}/setWebhook?url=${TelegramService.webAppURL}`;
    return TelegramService.fetchAndLog(url);
  }
}
