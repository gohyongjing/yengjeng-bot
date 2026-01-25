import { Feature } from '@features/command/types';
import { getPreviousBusStopArrivalTimings } from './service';
import { constants } from '@features/bus/bus.constants';

export const getPreviousBusStopArrivalTimingsFeature: Feature = {
  commandWord: constants.PREV_COMMAND_WORD,
  description: constants.PREV_DESCRIPTION,
  button: {
    text: constants.PREV_BUTTON_TEXT,
    callback_data: constants.PREV_BUTTON_CALLBACK,
  },
  help: constants.PREV_HELP,
  handler: getPreviousBusStopArrivalTimings,
};
