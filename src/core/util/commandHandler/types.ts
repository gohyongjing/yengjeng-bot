import { InlineKeyboardButton } from '@core/telegram/telegram.type';
import { CommandV2 } from '../commandV2';
import { User } from '@core/telegram';

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

export type CommandHandler = (
  command: CommandV2,
  from: User,
  chatId: number,
) => void;
export type Parameter<T> = {
  name: string;
  helpMessage: string;
  processor: (
    value: string,
  ) =>
    | { isSuccess: true; value: T }
    | { isSuccess: false; errorMessage: string };
};
