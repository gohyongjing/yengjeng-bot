import { AppService } from '@core/appService';
import { TelegramService, User } from '@core/telegram';
import { MarkdownBuilder } from '@core/util/markdownBuilder';
import { Command } from '@core/util/command';
import { UserDataService } from './user.data';
import { UserData } from './user.type';

export class UserService extends AppService {
  override APP_SERVICE_COMMAND_WORD = 'user';
  private userDataService: UserDataService;

  constructor() {
    super();
    this.userDataService = new UserDataService();
  }

  override help(): string {
    return '*USER PROFILE*\nUSER PROFILE: View your user profile\nUSER DELETE: Delete your user data';
  }

  override processCommand(command: Command, from: User, chatId: number): void {
    const subCommand = command.positionalArgs[0]?.toUpperCase();

    if (!subCommand || subCommand === 'PROFILE') {
      this.readProfile(from, chatId);
    } else if (subCommand === 'DELETE') {
      this.deleteProfile(from, chatId);
    } else {
      TelegramService.sendMessage({
        chatId,
        markdown: new MarkdownBuilder(
          `Sorry, I don't know how to handle this command: '${subCommand}'\n\n${this.help()}`,
        ),
      });
    }
  }

  updateProfile(user: User): UserData | null {
    const userData = {
      userId: user.id,
      firstName: user.first_name,
      lastName: user.last_name ?? '',
      username: user.username ?? '',
    };

    return this.userDataService.updateUser(userData);
  }

  private readProfile(from: User, chatId: number): void {
    const userData = this.userDataService.getUser(from.id);

    if (!userData) {
      TelegramService.sendMessage({
        chatId,
        markdown: new MarkdownBuilder(
          '❌ Your details are not found. Please use /start to register first!',
        ),
      });
      return;
    }

    const userInfo = [
      `*User Profile*`,
      `ID: \`${userData.userId}\``,
      `First Name: ${userData.firstName}`,
      userData.lastName ? `Last Name: ${userData.lastName}` : null,
      userData.username ? `Username: @${userData.username}` : null,
      `Profile Created: ${userData.createdAt.toLocaleDateString()}`,
      `Profile Last Updated: ${userData.updatedAt.toLocaleDateString()}`,
    ]
      .filter(Boolean)
      .join('\n');

    TelegramService.sendMessage({
      chatId,
      markdown: new MarkdownBuilder(userInfo),
    });
  }

  private deleteProfile(from: User, chatId: number): void {
    const success = this.userDataService.deleteUser(from.id);

    if (success) {
      TelegramService.sendMessage({
        chatId,
        markdown: new MarkdownBuilder(
          '✅ Your user data has been deleted successfully.',
        ),
      });
    } else {
      this.loggerService.error(
        `Failed to delete user data: ${from.id} ${from.username}`,
      );
      TelegramService.sendMessage({
        chatId,
        markdown: new MarkdownBuilder(
          '❌ Failed to delete your user data. Please try again later and contact support if the problem persists.',
        ),
      });
    }
  }
}
