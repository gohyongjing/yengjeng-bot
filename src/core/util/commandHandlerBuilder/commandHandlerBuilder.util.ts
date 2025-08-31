import { TelegramService, User } from '@core/telegram';
import { MarkdownBuilder } from '../markdownBuilder';
import { Feature } from './types';
import { CommandV2 } from '../commandV2';
import { InlineKeyboardButton } from '@core/telegram/telegram.type';

export function handleCommand(
  feature: Feature,
  command: CommandV2,
  from: User,
  chatId: number,
) {
  if ('handler' in feature) {
    return feature.handler(command, from, chatId);
  }

  const nextArg = command.nextArg();

  const descriptions = `${feature.description}\n\n${feature.subFeatures.map((feature) => `${feature.commandWord}: ${feature.description}`).join('\n')}`;

  if (nextArg) {
    const subFeature = feature.subFeatures.find(
      (feature) => feature.commandWord === nextArg,
    );
    if (subFeature) {
      return handleCommand(subFeature, command, from, chatId);
    }
    return TelegramService.sendMessage({
      chatId: chatId,
      markdown: new MarkdownBuilder(
        `Unknown command: ${nextArg}\n\n${descriptions}`,
      ),
    });
  }

  const buttons: InlineKeyboardButton[][] = [];
  feature.subFeatures.forEach((feature) => {
    if (feature.button) {
      buttons.push([feature.button]);
    }
  });

  return TelegramService.sendMessage({
    chatId: chatId,
    markdown: new MarkdownBuilder(`${descriptions}`),
    replyMarkup: {
      inline_keyboard: buttons,
    },
  });
}
