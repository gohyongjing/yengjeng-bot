import { User } from '@core/telegram';
import { CommandV2 } from '@core/util/commandV2';
import { constants } from '@features/bus/bus.constants';
import { BusData } from '@features/bus/bus.data';
import {
  getBusArrivals,
  sendBusArrivalTimings,
} from '@features/bus/bus.service';

export function getPreviousBusStopArrivalTimings(
  _command: CommandV2,
  _from: User,
  chatId: number,
): void {
  const busStopId =
    new BusData().readLastBusStopQuery(chatId) ?? constants.DEFAULT_BUS_STOP_ID;
  const busArrivals = getBusArrivals(busStopId);
  sendBusArrivalTimings(chatId, busArrivals);
}
