import { Feature } from '@core/util/commandHandler/types';
import { getPreviousBusStopArrivalTimingsFeature } from './subFeatures/getPreviousBusStopArrivalTimings';
import { getBusStopArrivalTimingsFeature } from './subFeatures/getBusStopArrivalTimings';

export const busFeature: Feature = {
  commandWord: 'bus',
  description: 'Get bus arrival timings',
  button: { text: '🚌 Bus Timings', callback_data: '/bus' },
  help: 'Get bus arrival timings of any Singapore bus stop',
  subFeatures: [
    getBusStopArrivalTimingsFeature,
    getPreviousBusStopArrivalTimingsFeature,
  ],
};
