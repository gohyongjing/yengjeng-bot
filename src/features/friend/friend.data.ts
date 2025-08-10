import { SpreadsheetService } from '@core/spreadsheet/spreadsheet.service';
import { Friendship } from './friend.type';
import { LoggerService } from '@core/logger';

export class FriendData {
  private static SHEET_NAME = 'friends';
  private loggerService: LoggerService;
  private spreadsheetService: SpreadsheetService;

  constructor() {
    this.loggerService = new LoggerService();
    this.spreadsheetService = new SpreadsheetService(FriendData.SHEET_NAME, [
      'Id',
      'User1 Id',
      'User2 Id',
      'Created At',
    ]);
  }

  addFriend(userId: number, friendId: number): Friendship {
    const now = new Date();
    const friendData: Friendship = {
      userId: Math.min(userId, friendId),
      friendId: Math.max(userId, friendId),
      createdAt: now,
    };

    const friendIdString = `${friendData.userId}-${friendData.friendId}`;
    this.spreadsheetService.updateRow(1, friendIdString, [
      friendIdString,
      friendData.userId,
      friendData.friendId,
      friendData.createdAt,
    ]);

    return friendData;
  }

  removeFriend(userId: number, friendId: number): boolean {
    const friendIdString = `${Math.min(userId, friendId)}-${Math.max(
      userId,
      friendId,
    )}`;
    return this.spreadsheetService.deleteRow(1, friendIdString);
  }

  getFriends(userId: number): number[] {
    const friendIds: number[] = [];
    const allFriends = this.getAllFriends();

    for (const friend of allFriends) {
      if (friend.userId === userId) {
        friendIds.push(friend.friendId);
      } else if (friend.friendId === userId) {
        friendIds.push(friend.userId);
      }
    }

    return friendIds;
  }

  areFriends(userId1: number, userId2: number): boolean {
    const friendIds = this.getFriends(userId1);
    return friendIds.includes(userId2);
  }

  private getAllFriends(): Friendship[] {
    // TODO: Move to spreadsheet service
    const friends: Friendship[] = [];
    const sheet = this.spreadsheetService['getSheet']();
    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) return friends;

    for (let row = 2; row <= lastRow; row++) {
      const data = sheet.getRange(row, 1, 1, 4).getValues()[0];
      const friend = this.parseFriendData(data);
      if (friend) {
        friends.push(friend);
      }
    }

    return friends;
  }

  private parseFriendData(data: unknown[]): Friendship | null {
    if (data.length < 4) {
      this.loggerService.error(`Failed to parse friend data: ${data}`);
      return null;
    }

    const friendData = {
      friendIdString: data[0],
      userId: data[1],
      friendId: data[2],
      createdAt: data[3],
    };

    if (
      typeof friendData.friendIdString === 'string' &&
      typeof friendData.userId === 'number' &&
      typeof friendData.friendId === 'number' &&
      friendData.createdAt instanceof Date
    ) {
      return {
        userId: friendData.userId,
        friendId: friendData.friendId,
        createdAt: friendData.createdAt,
      } as Friendship;
    }

    this.loggerService.error(`Failed to parse friend data: ${data}`);
    return null;
  }
}
