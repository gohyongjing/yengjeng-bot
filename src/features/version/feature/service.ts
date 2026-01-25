import { TelegramService, User } from '@core/telegram';
import { MarkdownBuilder } from '@core/util/markdownBuilder';
import { CommandV2 } from '@features/command/types/command';
import { VersionService } from '../version.service';

export function getVersion(
  _command: CommandV2,
  _from: User,
  chatId: number,
): void {
  const versionService = new VersionService();
  const responseText = `Yeng Jeng Bot\n${versionService.getVersion()}`;
  TelegramService.sendMessage({
    chatId,
    markdown: new MarkdownBuilder(responseText),
  });
}
