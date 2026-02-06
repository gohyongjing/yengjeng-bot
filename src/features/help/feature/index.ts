import { Feature } from '@features/command/types';
import { getHelp } from './service';
import { constants } from '../help.constants';

export const helpFeature: Feature = {
  commandWord: constants.FEATURE_COMMAND_WORD,
  description: constants.FEATURE_DESCRIPTION,
  button: {
    text: constants.FEATURE_BUTTON_TEXT,
    callback_data: constants.FEATURE_BUTTON_CALLBACK,
  },
  help: constants.FEATURE_HELP,
  handler: getHelp,
};
