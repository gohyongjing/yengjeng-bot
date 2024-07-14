import { AppService } from '@core/appService';
import { LoggerService } from '@core/logger';
import { Message, TelegramService, Update } from '@core/telegram';
import { hasKey } from '@core/util/predicates';

export class VersionService extends AppService {
  override APP_SERVICE_COMMAND_WORD = 'version';

  major: number = 0;
  minor: number = 1;
  patch: number = 2;

  changeLog = {
    '0.1.2': [
      'Fix bug causing help, version command to be ignored',
      'Fix alignment of bus arrival timings table',
    ],
    '0.1.1': ['Fix bug causing failed fetching of last retrieved bus stop'],
    '0.1.0': ['Use cristobalgvera/ez-clasp template to manage yengjeng bot'],
  };

  loggerService: LoggerService;
  telegramService: TelegramService;

  constructor() {
    super();
    this.loggerService = new LoggerService();
    this.telegramService = new TelegramService();
  }

  override async processUpdate(update: Update): Promise<void> {
    if (hasKey(update, 'message')) {
      this.processMessage(update.message);
    }
  }
  override help(): string {
    return (
      '*VERSION*\n' + 'VERSION: Retrieves the version number of Yeng Jeng bot'
    );
  }

  processMessage(message: Message) {
    const chatId = message.chat.id;
    const responseText = `Yeng Jeng Bot\n${this.getVersion()}`;
    this.telegramService.sendMessage({ chatId, text: responseText });
  }

  getVersion(): string {
    return `v${this.major}\\.${this.minor}\\.${this.patch}`;
  }

  getChangeLog(): string[] {
    return Object.entries(this.changeLog).map(
      (entry) => `${entry[0]}: ${JSON.stringify(entry[1])}`,
    );
  }
}
