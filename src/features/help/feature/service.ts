import { TelegramService, User } from '@core/telegram';
import { MarkdownBuilder } from '@core/util/markdownBuilder';
import { CommandV2 } from '@features/command/types/command';
import { Feature } from '@features/command/types/feature';
import { constants } from '../help.constants';
import { features } from '@core/features';
import { FriendService } from '@features/friend';
import { ScrabbleService } from '@features/scrabble';
import { UserService } from '@features/user';

function buildHelpMarkdown(
  feature: Feature,
  prefix: string = '',
  markdownBuilder: MarkdownBuilder | null = null,
): MarkdownBuilder {
  if (markdownBuilder === null) {
    markdownBuilder = new MarkdownBuilder();
  }
  markdownBuilder.bold(feature.commandWord);
  markdownBuilder.raw('\n');
  if ('help' in feature && 'handler' in feature) {
    markdownBuilder.raw(
      `/${prefix}${feature.commandWord}: ${feature.description}`,
    );
    markdownBuilder.raw('\n');
  } else {
    markdownBuilder.raw(feature.description);
    markdownBuilder.raw('\n\n');
    feature.subFeatures.forEach((subFeature) =>
      buildHelpMarkdown(
        subFeature,
        `${prefix}${feature.commandWord} `,
        markdownBuilder,
      ),
    );
  }

  markdownBuilder.raw('\n');
  return markdownBuilder;
}

export function getHelp(
  _command: CommandV2,
  _from: User,
  chatId: number,
): void {
  const services = [
    new FriendService(),
    new ScrabbleService(),
    new UserService(),
  ];

  const helpMarkdown = new MarkdownBuilder();
  services.forEach((service) => {
    helpMarkdown.raw(service.help());
  });
  helpMarkdown.raw('\n');

  [
    {
      commandWord: constants.FEATURE_COMMAND_WORD,
      description: constants.FEATURE_DESCRIPTION,
      button: null,
      help: constants.FEATURE_HELP,
      handler: getHelp,
    },
    ...features,
  ].forEach((feature) => {
    buildHelpMarkdown(feature, '', helpMarkdown);
  });

  TelegramService.sendMessage({
    chatId,
    markdown: helpMarkdown,
  });
}
