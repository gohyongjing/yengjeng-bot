import { Feature } from '@features/command/types';
import { getVersion } from './service';
import { constants } from '../version.constants';

export const versionFeature: Feature = {
  commandWord: constants.FEATURE_COMMAND_WORD,
  description: constants.FEATURE_DESCRIPTION,
  button: {
    text: constants.FEATURE_BUTTON_TEXT,
    callback_data: constants.FEATURE_BUTTON_CALLBACK,
  },
  help: constants.FEATURE_HELP,
  handler: getVersion,
};
