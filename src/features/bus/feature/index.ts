import { Feature } from '@core/util/commandHandler/types';
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
  help: constants.FEATURE_HELP,
  subFeatures: [
    getBusStopArrivalTimingsFeature,
    getPreviousBusStopArrivalTimingsFeature,
  ],
};
