import { SpreadsheetService } from '@core/spreadsheet/spreadsheet.service';
import { UserData, UserUpdate } from './user.type';
import { isUserData } from './user.predicates';
import { LoggerService } from '@core/logger';

export class UserDataService {
  private static SHEET_NAME = 'user_service';
  private static DELETE_MARKER = '[DELETED]';
  private loggerService: LoggerService;
  private spreadsheetService;

  constructor() {
    this.loggerService = new LoggerService();
    this.spreadsheetService = new SpreadsheetService(
      UserDataService.SHEET_NAME,
      [
        'User Id',
        'First Name',
        'Last Name',
        'Username',
        'Created At',
        'Updated At',
      ],
    );
  }

  getUser(userId: number): UserData | null {
    const data = this.spreadsheetService.readRow(1, userId.toString());
    if (!data) {
      this.loggerService.error(`User not found: ${userId}`);
      return null;
    }

    if (data[1] === UserDataService.DELETE_MARKER) {
      this.loggerService.info(`User has been deleted: ${userId}`);
      return null;
    }

    return this.parseUserData(data);
  }

  updateUser(updates: UserUpdate): UserData | null {
    const existingUser = this.getUser(updates.userId);
    const now = new Date();

    const userData: UserData = {
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
      UserDataService.DELETE_MARKER,
      '',
      '',
      data[4],
      new Date(),
    ]);

    return true;
  }

  private parseUserData(data: unknown[]): UserData | null {
    const userData = {
      userId: data[0],
      firstName: data[1],
      lastName: data[2],
      username: data[3],
      createdAt: data[4],
      updatedAt: data[5],
    };

    if (isUserData(userData)) {
      return userData;
    }
    this.loggerService.error(`Failed to parse user data: ${data}`);
    return null;
  }
}
