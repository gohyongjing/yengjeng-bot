import { TelegramService, User } from '@core/telegram';
import { MarkdownBuilder } from '../markdownBuilder';
import { Feature, Parameter } from './types';
import { CommandV2 } from '../commandV2';
import { InlineKeyboardButton } from '@core/telegram/telegram.type';

export function handleCommand(
  feature: Feature,
  command: CommandV2,
  from: User,
  chatId: number,
  commandPrefix: string = '',
) {
  if ('handler' in feature) {
    return feature.handler(command, from, chatId);
  }

  const descriptions = `${feature.description}\n\n${feature.subFeatures.map((feature) => `/${commandPrefix} ${feature.commandWord}: ${feature.description}`).join('\n')}`;
  const buttons: InlineKeyboardButton[][] = [];
  feature.subFeatures.forEach((feature) => {
    if (feature.button) {
      buttons.push([feature.button]);
    }
  });

  const nextArg = command.nextArg();
  if (nextArg) {
    const subFeature = feature.subFeatures.find(
      (feature) => feature.commandWord === nextArg,
    );
    if (subFeature) {
      return handleCommand(
        subFeature,
        command,
        from,
        chatId,
        `${commandPrefix} ${feature.commandWord}`,
      );
    }

    return TelegramService.sendMessage({
      chatId: chatId,
      markdown: new MarkdownBuilder(
        `Unknown command: ${nextArg}\n\n${descriptions}`,
      ),
      replyMarkup: {
        inline_keyboard: buttons,
      },
    });
  }

  return TelegramService.sendMessage({
    chatId: chatId,
    markdown: new MarkdownBuilder(`${descriptions}`),
    replyMarkup: {
      inline_keyboard: buttons,
    },
  });
}
export function getArg<T>(
  command: CommandV2,
  _from: User,
  chatId: number,
  param: Parameter<T>,
): T | null {
  const value = command.nextArg();
  if (value) {
    const result = param.processor(value);
    if (!result.isSuccess) {
      TelegramService.sendMessage({
        chatId,
        markdown: new MarkdownBuilder(result.errorMessage),
      });
      return null;
    }
    return result.value;
  }
  TelegramService.sendMessage({
    chatId,
    markdown: new MarkdownBuilder(param.helpMessage),
  });
  return null;
}
