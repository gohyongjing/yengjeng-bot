import { InlineKeyboardButton } from '@core/telegram/telegram.type';
import { CommandHandler } from './commandHandler';

export type Feature = {
  commandWord: string;
  description: string;
  button: InlineKeyboardButton | null;
} & (
  | {
      help: string;
      handler: CommandHandler;
    }
  | {
      subFeatures: Feature[];
    }
);
