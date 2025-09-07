import { Feature } from '@features/command/types';
import { greetUser } from './service';
import { constants } from '../greeting.constants';

export const greetingFeature: Feature = {
  commandWord: constants.FEATURE_COMMAND_WORD,
  description: constants.FEATURE_DESCRIPTION,
  button: null,
  help: constants.FEATURE_HELP,
  handler: greetUser,
};
