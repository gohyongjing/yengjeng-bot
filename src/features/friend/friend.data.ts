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
      'User1 Id',
      'User2 Id',
      'Created At',
    ]);
  }

  addFriend(userId: number, friendId: number): Friendship {
    const now = new Date();
    const friendData: Friendship = {
      id: `${Math.min(userId, friendId)}-${Math.max(userId, friendId)}`,
      userId: Math.min(userId, friendId),
      friendId: Math.max(userId, friendId),
      createdAt: now,
    };

    this.spreadsheetService.updateRow(1, friendData.id, [
      friendData.id,
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
    this.spreadsheetService.readRows(2, userId.toString()).forEach((friend) => {
      friendIds.push(Number(friend[2]));
    });
    this.spreadsheetService.readRows(3, userId.toString()).forEach((friend) => {
      friendIds.push(Number(friend[1]));
    });

    console.dir([`getFriends allFriends user id: ${userId}`, friendIds]);
    return friendIds;
  }

  areFriends(userId1: number, userId2: number): boolean {
    console.dir(['areFriends', userId1, userId2]);
    const friendIds = this.getFriends(userId1);
    console.dir(['areFriends user1 friends', friendIds]);
    return friendIds.includes(userId2);
  }
}
