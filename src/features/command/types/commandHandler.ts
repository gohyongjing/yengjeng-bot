import { User } from '@core/telegram';
import { CommandV2 } from './command';

export type CommandHandler = (
  command: CommandV2,
  from: User,
  chatId: number,
) => void;
