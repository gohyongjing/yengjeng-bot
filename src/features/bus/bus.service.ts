import { TelegramService } from '@core/telegram';
import { MarkdownBuilder } from '@core/util/markdownBuilder';
import { constants } from './bus.constants';
import {
  BusArrivalResponse,
  BusServiceDetails,
  ResponseBody,
} from './bus.type';
import { LoggerService } from '@core/logger';
import { Options, UrlFetchService } from '@core/urlFetch';
import { ConfigService } from '@core/config';
import { BusConfig } from './bus.config';
import { hasKey } from '@core/util/predicates';

const TABLE_HEADERS = [
  ['Bus No', 'Next Bus', '2nd Bus', '3rd Bus'],
  ['', '(mins)', '(mins)', '(mins)'],
];
const TABLE_COLUMN_WIDTH = 8;

export function getBusArrivals(
  busStopNo: string,
): ResponseBody<BusArrivalResponse> {
  const loggerService = new LoggerService();
  const configService = new ConfigService<BusConfig>();
  loggerService.info(`Fetching bus arrivals for bus stop ${busStopNo}`);
  const options: Options = {
    headers: {
      AccountKey: configService.get('LTA_ACCOUNT_KEY'),
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

export function sendBusArrivalTimings(
  chatId: number,
  busArrivals: ResponseBody<BusArrivalResponse>,
) {
  const response = new MarkdownBuilder().code(
    `${formatBusArrivalHeader(
      busArrivals,
    )}\n${formatBusArrivalTimings(busArrivals.Services ?? [])}`,
  );

  TelegramService.sendMessage({
    chatId,
    markdown: response,
    replyMarkup: {
      inline_keyboard: [[{ text: '🔄 Refresh', callback_data: '/bus prev' }]],
    },
  });
}

function formatBusArrivalHeader(
  busArrivalResponse: ResponseBody<BusArrivalResponse>,
) {
  const results: string[] = [];

  if (busArrivalResponse.Services === undefined) {
    results.push(`${constants.MSG_INVALID_BUS_CODE}!`);
    return results.join('\n');
  }

  results.push(`🚍 BUS STOP ${busArrivalResponse.BusStopCode}`);

  if (busArrivalResponse.Services.length === 0) {
    results.push(
      `${constants.MSG_NO_BUSES} ${busArrivalResponse.BusStopCode}! :(`,
    );
  } else {
    for (const row of TABLE_HEADERS) {
      results.push(
        '|' + row.map((cell) => cell.padStart(TABLE_COLUMN_WIDTH)).join('|'),
      );
    }
  }
  return results.join('\n');
}

function formatBusArrivalTimings(
  busServiceDetails: BusServiceDetails[],
): string {
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
    const serviceNo = service.ServiceNo.padStart(TABLE_COLUMN_WIDTH);
    const nextBusDuration = getWaitingTime(
      service.NextBus.EstimatedArrival,
    ).padStart(TABLE_COLUMN_WIDTH);
    const nextBusDuration2 = getWaitingTime(
      service.NextBus2.EstimatedArrival,
    ).padStart(TABLE_COLUMN_WIDTH);
    const nextBusDuration3 = getWaitingTime(
      service.NextBus3.EstimatedArrival,
    ).padStart(TABLE_COLUMN_WIDTH);
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
function getWaitingTime(estimatedArrival: string): string {
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
