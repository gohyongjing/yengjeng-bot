import { Feature } from '@core/util/commandHandler/types';
import { getBusStopArrivalTimings } from './service';

export const getBusStopArrivalTimingsFeature: Feature = {
  commandWord: 'bus_stop',
  description: 'Get bus arrival timings of a specific bus stop',
  button: { text: '🚏 Bus Stop', callback_data: '/bus bus_stop' },
  help: 'Get bus arrival timings of a specific bus stop',
  handler: getBusStopArrivalTimings,
};
