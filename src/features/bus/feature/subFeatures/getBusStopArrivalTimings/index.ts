import { Feature } from '@core/util/commandHandler/types';
import { getBusStopArrivalTimings } from './service';
import { constants } from '../../../bus.constants';

export const getBusStopArrivalTimingsFeature: Feature = {
  commandWord: constants.BUS_STOP_COMMAND_WORD,
  description: constants.BUS_STOP_DESCRIPTION,
  button: {
    text: constants.BUS_STOP_BUTTON_TEXT,
    callback_data: constants.BUS_STOP_BUTTON_CALLBACK,
  },
  help: constants.BUS_STOP_HELP,
  handler: getBusStopArrivalTimings,
};
