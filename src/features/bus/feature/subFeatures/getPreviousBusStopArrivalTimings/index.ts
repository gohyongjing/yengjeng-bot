import { Feature } from '@core/util/commandHandler/types';
import { getPreviousBusStopArrivalTimings } from './service';

export const getPreviousBusStopArrivalTimingsFeature: Feature = {
  commandWord: 'prev',
  description: 'Get bus arrival timings of the previously requested bus stop',
  button: { text: '🔄 Refresh Previous Bus Stop', callback_data: '/bus prev' },
  help: 'Get bus arrival timings of the previously requested bus stop',
  handler: getPreviousBusStopArrivalTimings,
};
