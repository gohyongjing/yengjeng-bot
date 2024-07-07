import { ConfigService } from '@core/config';
import { SpreadsheetService } from '@core/spreadsheet';
import { Message, TelegramService } from '@core/telegram';
import { BusConfig } from './bus.config';
import { BusArrivalResponse, ResponseBody } from './bus.type';
import { constants } from './bus.constants';
import { LoggerService } from '@core/logger';
import { Options, UrlFetchService } from '@core/urlFetch';
import { hasKey } from '@core/util/predicates';

export class BusService {
  TABLE_HEADERS = [
    'Service No',
    'Next Bus \\(mins\\)',
    '2nd Bus \\(mins\\)',
    '3rd Bus \\(mins\\)',
  ];

  configService: ConfigService<BusConfig>;
  loggerService: LoggerService;
  spreadsheetService: SpreadsheetService;
  telegramService: TelegramService;
  SHEET_INDEX = 1;

  constructor() {
    this.configService = new ConfigService();
    this.loggerService = new LoggerService();
    this.spreadsheetService = new SpreadsheetService();
    this.telegramService = new TelegramService();
  }

  processMessage(message: Message) {
    const chatId = message.chat.id;
    this.telegramService.sendMessage({
      chatId,
      text: 'Gimme a sec, getting the bus timings',
    });

    const text = message.text ?? '';
    const tokens = text
      .split(' ')
      .filter((s) => s.length > 0)
      .map((s) => s.trim());

    const userSpreadsheet = this.spreadsheetService.open();
    const userSheet = userSpreadsheet.getSheets()[this.SHEET_INDEX];
    const userCell = userSheet
      .getRange('A:A')
      .createTextFinder(chatId.toString())
      .findNext();
    const userRow = userCell
      ? userSheet.getRange(`A${userCell.getRow()}:D${userCell.getRow()}`)
      : null;

    const busStopId = this.getBusStopId(tokens, userRow);
    const isValidBusStopId = /^\d+$/.test(busStopId);
    const response = isValidBusStopId
      ? this.formatBusArrivals(this.getBusArrivals(busStopId))
      : 'Invalid bus stop number\\!';

    this.telegramService.sendMessage({ chatId, text: response });

    if (tokens.length === 2 && isValidBusStopId) {
      if (userRow === null) {
        userSheet.appendRow([
          chatId,
          message.from?.first_name ?? '',
          tokens[1],
          new Date(),
        ]);
      } else {
        userRow.setValues([
          [chatId, message.from?.first_name ?? '', tokens[1], new Date()],
        ]);
      }
    }
  }

  getBusStopId(
    tokens: string[],
    userRow: GoogleAppsScript.Spreadsheet.Range | null,
  ): string {
    this.loggerService.info(
      `Retrieving requested bus stop id ${JSON.stringify(
        tokens,
      )} ${JSON.stringify(userRow?.getValues() ?? {})}`,
    );
    if (tokens.length === 1) {
      if (userRow !== null) {
        return userRow.getCell(1, 3).getValue().toString().split(' ');
      }
    } else if (tokens.length === 2) {
      return tokens[1];
    }
    return '04167';
  }

  getBusArrivals(busStopNo: string): ResponseBody<BusArrivalResponse> {
    this.loggerService.info(`Fetching bus arrivals for bus stop ${busStopNo}`);
    const options: Options = {
      headers: {
        AccountKey: this.configService.get('LTA_ACCOUNT_KEY'),
      },
    };
    const result = UrlFetchService.fetch(
      `http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=${busStopNo}`,
      options,
    );
    if (hasKey(result, 'Ok')) {
      const response = result.Ok;
      return JSON.parse(response.getContentText());
    }
    return { 'odata.metadata': '', BusStopCode: busStopNo };
  }

  formatBusArrivals(
    busArrivalResponse: ResponseBody<BusArrivalResponse>,
  ): string {
    const results: string[] = [];

    if (busArrivalResponse.Services === undefined) {
      results.push(`${constants.MSG_INVALID_BUS_CODE}\\!`);
      return results.join('\n');
    }

    results.push(`*🚍 BUS STOP ${busArrivalResponse.BusStopCode}*`);

    this.loggerService.debug(`services: ${busArrivalResponse.Services}`);
    if (busArrivalResponse.Services.length === 0) {
      results.push(
        `${constants.MSG_NO_BUSES} ${busArrivalResponse.BusStopCode}\\! :\\(`,
      );
    } else {
      results.push(`*${this.TABLE_HEADERS.join(' \\| ')}*`);
      for (const service of busArrivalResponse.Services) {
        const serviceNo = service.ServiceNo;
        const nextBusDuration = this.getWaitingTime(
          service.NextBus.EstimatedArrival,
        );
        const nextBusDuration2 = this.getWaitingTime(
          service.NextBus2.EstimatedArrival,
        );
        const nextBusDuration3 = this.getWaitingTime(
          service.NextBus3.EstimatedArrival,
        );
        results.push(
          `*${serviceNo}*   \\|   ${nextBusDuration}   \\|   ${nextBusDuration2}   \\|   ${nextBusDuration3}`,
        );
      }
    }
    return results.join('\n');
  }

  /**
   * Returns estimated waiting time from now in minutes if available, and '-' if estimatedArrival is empty string
   * Waiting time is a non-negative integer.
   */
  getWaitingTime(estimatedArrival: string): string {
    if (estimatedArrival === '') {
      return '\\-';
    }
    return Math.max(
      Math.floor(
        (new Date(estimatedArrival).getTime() - new Date().getTime()) /
          (1000 * 60),
      ),
      0,
    ).toString();
  }
}
