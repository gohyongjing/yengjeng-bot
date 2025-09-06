import { Feature } from '@core/util/commandHandler/types';
import { greetUser } from './service';

export const greetingFeature: Feature = {
  commandWord: 'start',
  description: "Hello! I'm Yeng Jeng Bot!",
  button: null,
  help: 'Start using Yeng Jeng bot :)',
  handler: greetUser,
};
