import { AppService } from './appService.type';
import { Command } from '@core/util/command';
import { User } from '@core/telegram';

export class MockAppService extends AppService {
  override APP_SERVICE_COMMAND_WORD: string;
  private helpText: string;
  public processCommandCalls: Array<{
    command: Command;
    from: User;
    chatId: number;
  }> = [];

  constructor(commandWord: string, helpText: string) {
    super();
    this.APP_SERVICE_COMMAND_WORD = commandWord;
    this.helpText = helpText;
  }

  override help(): string {
    return this.helpText;
  }

  override processCommand(command: Command, from: User, chatId: number) {
    this.processCommandCalls.push({ command, from, chatId });
  }

  clearProcessCommandCalls(): void {
    this.processCommandCalls = [];
  }
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
