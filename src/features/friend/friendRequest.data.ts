import { SpreadsheetService } from '@core/spreadsheet/spreadsheet.service';
import { FriendRequest, FriendRequestUpdate } from './friend.type';
import { LoggerService } from '@core/logger';

export class FriendRequestData {
  private static SHEET_NAME = 'friend_requests';
  private loggerService: LoggerService;
  private spreadsheetService: SpreadsheetService;

  constructor() {
    this.loggerService = new LoggerService();
    this.spreadsheetService = new SpreadsheetService(
      FriendRequestData.SHEET_NAME,
      ['Request Id', 'Sender Id', 'Recipient Id', 'Status'],
    );
  }

  getFriendRequest(
    senderId: number,
    recipientId: number,
  ): FriendRequest | null {
    const requestId = `${senderId}-${recipientId}`;
    const data = this.spreadsheetService.readRow(1, requestId);
    if (!data) {
      return null;
    }

    return this.parseFriendRequest(data);
  }

  setFriendRequest(update: FriendRequestUpdate): FriendRequest {
    const requestId = `${update.senderId}-${update.recipientId}`;

    const friendRequest: FriendRequest = {
      id: requestId,
      senderId: update.senderId,
      recipientId: update.recipientId,
      status: update.status,
    };

    this.spreadsheetService.updateRow(1, requestId, [
      friendRequest.id,
      friendRequest.senderId,
      friendRequest.recipientId,
      friendRequest.status,
    ]);

    return friendRequest;
  }

  deleteFriendRequest(senderId: number, recipientId: number): boolean {
    const requestId = `${senderId}-${recipientId}`;
    return this.spreadsheetService.deleteRow(1, requestId);
  }

  // private getAllFriendRequests(): FriendRequest[] {
  //   const requests: FriendRequest[] = [];
  //   const sheet = this.spreadsheetService['getSheet']();
  //   const lastRow = sheet.getLastRow();

  //   if (lastRow <= 1) return requests;

  //   for (let row = 2; row <= lastRow; row++) {
  //     const data = sheet.getRange(row, 1, 1, 4).getValues()[0];
  //     const request = this.parseFriendRequest(data);
  //     if (request) {
  //       requests.push(request);
  //     }
  //   }

  //   return requests;
  // }

  private parseFriendRequest(data: unknown[]): FriendRequest | null {
    if (data.length < 4) {
      this.loggerService.error(`Failed to parse friend request data: ${data}`);
      return null;
    }

    const friendRequest = {
      id: data[0],
      senderId: data[1],
      recipientId: data[2],
      status: data[3],
    };

    if (
      typeof friendRequest.id === 'string' &&
      typeof friendRequest.senderId === 'number' &&
      typeof friendRequest.recipientId === 'number' &&
      typeof friendRequest.status === 'string'
    ) {
      return friendRequest as FriendRequest;
    }

    this.loggerService.error(`Failed to parse friend request data: ${data}`);
    return null;
  }
}
