import { SpreadsheetService } from '@core/spreadsheet/spreadsheet.service';

export class BusData {
  private static SHEET_NAME = 'bus_service';
  private spreadsheetService;

  constructor() {
    this.spreadsheetService = new SpreadsheetService(BusData.SHEET_NAME, [
      'User Id',
      'User First Name',
      'Last Queried Bus Stop',
      'Updated At',
    ]);
  }

  updateLastBusStopQuery(
    userId: number,
    userFirstName: string,
    busStopQueried: string,
  ) {
    return this.spreadsheetService.updateRow(1, userId.toString(), [
      userId,
      userFirstName,
      busStopQueried,
      new Date(),
    ]);
  }

  readLastBusStopQuery(userId: number): string | null {
    const data = this.spreadsheetService.readRow(1, userId.toString());
    return data && (typeof data[2] === 'string' || typeof data[2] === 'number')
      ? data[2].toString()
      : null;
  }
}
