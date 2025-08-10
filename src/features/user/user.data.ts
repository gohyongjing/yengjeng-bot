import { SpreadsheetService } from '@core/spreadsheet/spreadsheet.service';
import { User, UserUpdate } from './user.type';
import { isUser } from './user.predicates';
import { LoggerService } from '@core/logger';

export class UserData {
  private static SHEET_NAME = 'user_service';
  private static DELETE_MARKER = '[DELETED]';
  private loggerService: LoggerService;
  private spreadsheetService;

  constructor() {
    this.loggerService = new LoggerService();
    this.spreadsheetService = new SpreadsheetService(UserData.SHEET_NAME, [
      'User Id',
      'First Name',
      'Last Name',
      'Username',
      'Created At',
      'Updated At',
    ]);
  }

  getUser(userId: number): User | null {
    const data = this.spreadsheetService.readRow(1, userId.toString());
    if (!data) {
      this.loggerService.error(`User not found: ${userId}`);
      return null;
    }

    if (data[1] === UserData.DELETE_MARKER) {
      this.loggerService.info(`User has been deleted: ${userId}`);
      return null;
    }

    return this.parseUserData(data);
  }

  updateUser(updates: UserUpdate): User | null {
    const existingUser = this.getUser(updates.userId);
    const now = new Date();

    const userData: User = {
      ...(existingUser
        ? existingUser
        : {
            createdAt: now,
          }),
      ...updates,
      updatedAt: now,
    };

    this.spreadsheetService.updateRow(1, updates.userId.toString(), [
      userData.userId,
      userData.firstName,
      userData.lastName,
      userData.username,
      userData.createdAt,
      userData.updatedAt,
    ]);

    return userData;
  }

  deleteUser(userId: number): boolean {
    const data = this.spreadsheetService.readRow(1, userId.toString());
    if (!data) {
      return false;
    }

    this.spreadsheetService.updateRow(1, userId.toString(), [
      userId,
      UserData.DELETE_MARKER,
      '',
      '',
      data[4],
      new Date(),
    ]);

    return true;
  }

  private parseUserData(data: unknown[]): User | null {
    const user = {
      userId: data[0],
      firstName: data[1],
      lastName: data[2],
      username: data[3],
      createdAt: data[4],
      updatedAt: data[5],
    };

    if (isUser(user)) {
      return user;
    }
    this.loggerService.error(`Failed to parse user data: ${data}`);
    return null;
  }
}
