import { ConfigService } from '@core/config';
import { SpreadsheetService } from '@core/spreadsheet';
import { Message, TelegramService, Update } from '@core/telegram';
import { BusConfig } from './bus.config';
import {
  BusArrivalResponse,
  BusServiceDetails,
  ResponseBody,
} from './bus.type';
import { constants } from './bus.constants';
import { LoggerService } from '@core/logger';
import { Options, UrlFetchService } from '@core/urlFetch';
import { hasKey } from '@core/util/predicates';
import { AppService } from '@core/appService';
import { Command } from '@core/util/command';
import { MarkdownBuilder } from '@core/util/markdownBuilder';

export class BusService extends AppService {
  override APP_SERVICE_COMMAND_WORD = 'bus';

  TABLE_HEADERS = [
    ['Bus No', 'Next Bus', '2nd Bus', '3rd Bus'],
    ['', '(mins)', '(mins)', '(mins)'],
  ];
  TABLE_COLUMN_WIDTH = 8;

  configService: ConfigService<BusConfig>;
  loggerService: LoggerService;
  spreadsheetService: SpreadsheetService;
  telegramService: TelegramService;
  SHEET_INDEX = 1;

  constructor() {
    super();
    this.configService = new ConfigService();
    this.loggerService = new LoggerService();
    this.spreadsheetService = new SpreadsheetService();
    this.telegramService = new TelegramService();
  }

  async processUpdate(update: Update) {
    if (hasKey(update, 'message')) {
      this.processMessage(update.message);
    }
  }

  override help(): string {
    return (
      '*BUS*\n' +
      'BUS [BUS NUMBER]: Gets the bus stop timings for the bus stop with bus stop number. For example, type BUS 12345\n' +
      'BUS : Type BUS without a bus stop number to get the timings for the previously requested bus stop.'
    );
  }

  processMessage(message: Message) {
    const chatId = message.chat.id;
    this.telegramService.sendMessage({
      chatId,
      markdown: new MarkdownBuilder('Gimme a sec, getting the bus timings'),
    });

    const text = message.text ?? '';
    const command = new Command(text);

    const userSpreadsheet = this.spreadsheetService.open();
    const userSheet = userSpreadsheet.getSheets()[this.SHEET_INDEX];
    const userCell = userSheet
      .getRange('A:A')
      .createTextFinder(chatId.toString())
      .findNext();
    const userRow = userCell
      ? userSheet.getRange(`A${userCell.getRow()}:D${userCell.getRow()}`)
      : null;

    const busStopId =
      command.positionalArgs[0] ?? this.getSavedBusStopId(userRow) ?? '04167';
    let response = new MarkdownBuilder(constants.MSG_INVALID_BUS_CODE);

    const isValidBusStopId = /^\d+$/.test(busStopId);
    if (isValidBusStopId) {
      const busArrivals = this.getBusArrivals(busStopId);
      response = new MarkdownBuilder().code(
        `${this.formatBusArrivalHeader(
          busArrivals,
        )}\n${this.formatBusArrivalTimings(busArrivals.Services ?? [])}`,
      );
    }

    this.telegramService.sendMessage({ chatId, markdown: response });

    if (command.positionalArgs[0] !== undefined && isValidBusStopId) {
      if (userRow === null) {
        userSheet.appendRow([
          chatId,
          message.from?.first_name ?? '',
          busStopId,
          new Date(),
        ]);
      } else {
        userRow.setValues([
          [chatId, message.from?.first_name ?? '', busStopId, new Date()],
        ]);
      }
    }
  }

  getSavedBusStopId(
    userRow: GoogleAppsScript.Spreadsheet.Range | null,
  ): string | null {
    if (userRow !== null) {
      return userRow.getCell(1, 3).getValue().toString().split(' ');
    }
    return null;
  }

  getBusArrivals(busStopNo: string): ResponseBody<BusArrivalResponse> {
    this.loggerService.info(`Fetching bus arrivals for bus stop ${busStopNo}`);
    const options: Options = {
      headers: {
        AccountKey: this.configService.get('LTA_ACCOUNT_KEY'),
      },
    };
    const result = UrlFetchService.fetch(
      `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${busStopNo}`,
      options,
    );
    if (hasKey(result, 'Ok')) {
      const response = result.Ok;
      return JSON.parse(response.getContentText());
    }
    return { 'odata.metadata': '', BusStopCode: busStopNo };
  }

  formatBusArrivalHeader(busArrivalResponse: ResponseBody<BusArrivalResponse>) {
    const results: string[] = [];

    if (busArrivalResponse.Services === undefined) {
      results.push(`${constants.MSG_INVALID_BUS_CODE}!`);
      return results.join('\n');
    }

    results.push(`🚍 BUS STOP ${busArrivalResponse.BusStopCode}`);

    this.loggerService.debug(`services: ${busArrivalResponse.Services}`);
    if (busArrivalResponse.Services.length === 0) {
      results.push(
        `${constants.MSG_NO_BUSES} ${busArrivalResponse.BusStopCode}! :(`,
      );
    } else {
      for (const row of this.TABLE_HEADERS) {
        results.push(
          '|' +
            row.map((cell) => cell.padStart(this.TABLE_COLUMN_WIDTH)).join('|'),
        );
      }
    }
    return results.join('\n');
  }

  formatBusArrivalTimings(busServiceDetails: BusServiceDetails[]): string {
    busServiceDetails.sort((serviceA, serviceB) => {
      const serviceADigits = serviceA.ServiceNo.replace(/\D/g, '');
      const serviceBDigits = serviceB.ServiceNo.replace(/\D/g, '');
      const result = parseInt(serviceADigits) - parseInt(serviceBDigits);
      return result !== 0
        ? result
        : serviceA.ServiceNo.localeCompare(serviceB.ServiceNo);
    });
    const results: string[] = [];
    for (const service of busServiceDetails) {
      const serviceNo = service.ServiceNo.padStart(this.TABLE_COLUMN_WIDTH);
      const nextBusDuration = this.getWaitingTime(
        service.NextBus.EstimatedArrival,
      ).padStart(this.TABLE_COLUMN_WIDTH);
      const nextBusDuration2 = this.getWaitingTime(
        service.NextBus2.EstimatedArrival,
      ).padStart(this.TABLE_COLUMN_WIDTH);
      const nextBusDuration3 = this.getWaitingTime(
        service.NextBus3.EstimatedArrival,
      ).padStart(this.TABLE_COLUMN_WIDTH);
      results.push(
        `|${serviceNo}|${nextBusDuration}|${nextBusDuration2}|${nextBusDuration3}`,
      );
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
