import { Feature } from '@features/command/types';
import { getPreviousBusStopArrivalTimingsFeature } from './subFeatures/getPreviousBusStopArrivalTimings';
import { getBusStopArrivalTimingsFeature } from './subFeatures/getBusStopArrivalTimings';
import { constants } from '../bus.constants';

export const busFeature: Feature = {
  commandWord: constants.FEATURE_COMMAND_WORD,
  description: constants.FEATURE_DESCRIPTION,
  button: {
    text: constants.FEATURE_BUTTON_TEXT,
    callback_data: constants.FEATURE_BUTTON_CALLBACK,
  },
  subFeatures: [
    getBusStopArrivalTimingsFeature,
    getPreviousBusStopArrivalTimingsFeature,
  ],
};
