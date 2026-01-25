import { User, TelegramService } from '@core/telegram';
import { InlineKeyboardButton } from '@core/telegram/telegram.type';
import { Parameter } from '@features/command/types';
import { Feature } from './types/feature';
import { MarkdownBuilder } from '@core/util/markdownBuilder';
import { CommandData } from './command.data';
import { CommandV2 } from './types/command';
import { LoggerService } from '@core/logger';

export function parseCommandWithState(
  command: CommandV2,
  userId: number,
): CommandV2 {
  let newCommand = command;
  if (!newCommand.hasSlash) {
    const previousCommand = getCommand(userId);
    if (previousCommand) {
      const nextArg = command.nextArg();
      if (nextArg !== null) {
        newCommand = new CommandV2(`/${previousCommand} ${nextArg}`);
      } else {
        newCommand = new CommandV2(`/${previousCommand}`);
      }
    }
  }
  setCommand(userId, newCommand.toString());
  return newCommand;
}

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

    TelegramService.sendMessage({
      chatId: chatId,
      markdown: new MarkdownBuilder(
        `Unknown command: ${nextArg}\n\n${descriptions}`,
      ),
      replyMarkup: {
        inline_keyboard: buttons,
      },
    });
    popArg(from.id);
    return;
  }

  TelegramService.sendMessage({
    chatId: chatId,
    markdown: new MarkdownBuilder(`${descriptions}`),
    replyMarkup: {
      inline_keyboard: buttons,
    },
  });
}

export function getArg<T>(
  command: CommandV2,
  from: User,
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
      popArg(from.id);
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

function getCommand(userId: number): string | null {
  const commandData = new CommandData();
  return commandData.readCommand(userId);
}

function setCommand(userId: number, command: string): void {
  const commandData = new CommandData();
  commandData.updateCommand(userId, command);
}

function popArg(userId: number): string | null {
  const commandData = new CommandData();
  const loggerService = new LoggerService();
  const previousCommand = commandData.readCommand(userId);
  if (previousCommand) {
    const command = new CommandV2(previousCommand);
    const arg = command.popArg();
    commandData.updateCommand(userId, command.toString());
    return arg;
  }
  loggerService.error('popArg: No previous command found');
  return null;
}
