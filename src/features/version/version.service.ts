import { AppService } from '@core/appService';
import { TelegramService, User } from '@core/telegram';
import { MarkdownBuilder } from '@core/util/markdownBuilder';
import { Command } from '@core/util/command';

export class VersionService extends AppService {
  override APP_SERVICE_COMMAND_WORD = 'version';

  major: number = 0;
  minor: number = 5;
  patch: number = 0;

  changeLog = {
    '0.5.0': ['Add buttons for bus features'],
    '0.4.0': ['Add friend feature'],
    '0.3.0': ['Add inline keyboard responses'],
    '0.2.0': ['Add Scrabble word guessing game'],
    '0.1.3': ['Migrate bus arrival API to v3'],
    '0.1.2': [
      'Fix bug causing help, version command to be ignored',
      'Fix alignment of bus arrival timings table',
    ],
    '0.1.1': ['Fix bug causing failed fetching of last retrieved bus stop'],
    '0.1.0': ['Use cristobalgvera/ez-clasp template to manage yengjeng bot'],
  };

  override help(): string {
    return '*VERSION*\nVERSION: Retrieves the version number of Yeng Jeng bot';
  }

  override processCommand(
    _command: Command,
    _from: User,
    chatId: number,
  ): void {
    const responseText = `Yeng Jeng Bot\n${this.getVersion()}`;
    TelegramService.sendMessage({
      chatId,
      markdown: new MarkdownBuilder(responseText),
    });
  }

  getVersion(): string {
    return `v${this.major}.${this.minor}.${this.patch}`;
  }

  getChangeLog(): string[] {
    return Object.entries(this.changeLog).map(
      (entry) => `${entry[0]}: ${JSON.stringify(entry[1])}`,
    );
  }
}
