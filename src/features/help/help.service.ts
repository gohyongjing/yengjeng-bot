import { AppService } from '@core/appService';
import { TelegramService, User, Message } from '@core/telegram';
import { Command } from '@core/util/command';
import { MarkdownBuilder } from '@core/util/markdownBuilder';

export class HelpService extends AppService {
  override APP_SERVICE_COMMAND_WORD = 'help';

  services: AppService[];

  constructor(services: AppService[]) {
    super();
    this.services = services;
  }

  override help(): string {
    return '*HELP*\nHELP: Provides instructions to use features provided';
  }

  override processMessage(message: Message): void {
    const text = message.text ?? '';
    const command = new Command(text);

    if (command.isCommand(this.APP_SERVICE_COMMAND_WORD)) {
      const user = message.from;
      if (!user) {
        this.loggerService.warn(
          `Command's user not specified for ${this.APP_SERVICE_COMMAND_WORD} service`,
        );
        return;
      }
      this.processCommand(command, user, message.chat.id);
    } else {
      TelegramService.sendMessage({
        chatId: message.chat.id,
        markdown: new MarkdownBuilder(
          "Sorry... I don't understand what you just said :(\nPlease type HELP for more information",
        ),
      });
    }
  }

  override processCommand(
    _command: Command,
    _from: User,
    chatId: number,
  ): void {
    const helpMessages = [this.help()].concat(
      this.services.map((service) => service.help()),
    );
    TelegramService.sendMessage({
      chatId,
      markdown: new MarkdownBuilder(helpMessages.join('\n')),
    });
  }
}
