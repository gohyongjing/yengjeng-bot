import { User, TelegramService } from '@core/telegram';
import { getArg } from '@features/command/command.service';
import { CommandV2 } from '@features/command/types';
import { MarkdownBuilder } from '@core/util/markdownBuilder';
import { busStopIdParameter } from './parameters';
import { BusData } from '@features/bus/bus.data';
import { constants } from '@features/bus/bus.constants';
import {
  getBusArrivals,
  sendBusArrivalTimings,
} from '@features/bus/bus.service';

export function getBusStopArrivalTimings(
  command: CommandV2,
  from: User,
  chatId: number,
): void {
  const busStopId = getArg(command, from, chatId, busStopIdParameter);
  if (!busStopId) {
    return;
  }

  TelegramService.sendMessage({
    chatId,
    markdown: new MarkdownBuilder(constants.LOADING_MESSAGE),
  });

  const busArrivals = getBusArrivals(busStopId);
  sendBusArrivalTimings(chatId, busArrivals);

  new BusData().updateLastBusStopQuery(
    chatId,
    from.first_name ?? constants.DEFAULT_USER_NAME,
    busStopId,
  );
}
