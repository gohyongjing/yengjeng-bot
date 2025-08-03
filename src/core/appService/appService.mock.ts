import { AppService } from './appService.type';
import { Command } from '@core/util/command';
import { User } from '@core/telegram';

export class MockAppService extends AppService {
  override APP_SERVICE_COMMAND_WORD: string;
  private helpText: string;

  constructor(commandWord: string, helpText: string) {
    super();
    this.APP_SERVICE_COMMAND_WORD = commandWord;
    this.helpText = helpText;
  }

  override help(): string {
    return this.helpText;
  }

  override processCommand(
    _command: Command,
    _from: User,
    _chatId: number,
  ): void {}
}

export const createMockAppService = (
  commandWord: string,
  helpText: string,
): AppService => {
  return new MockAppService(commandWord, helpText);
};

export const createMockAppServices = (
  services: Array<{ commandWord: string; helpText: string }>,
): AppService[] => {
  return services.map((service) =>
    createMockAppService(service.commandWord, service.helpText),
  );
};
