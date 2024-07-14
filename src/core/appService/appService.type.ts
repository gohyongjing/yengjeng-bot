import { Update } from '@core/telegram';

export abstract class AppService {
  abstract APP_SERVICE_COMMAND_WORD: string;
  abstract processUpdate(update: Update): Promise<void>;
  abstract help(): string;
}
