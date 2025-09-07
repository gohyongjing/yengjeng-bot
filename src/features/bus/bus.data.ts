import { SpreadsheetService } from '@core/spreadsheet/spreadsheet.service';
import { constants } from './bus.constants';

export class BusData {
  private static SHEET_NAME = constants.SHEET_NAME;
  private spreadsheetService;

  constructor() {
    this.spreadsheetService = new SpreadsheetService(BusData.SHEET_NAME, [
      constants.SHEET_COLUMN_USER_ID,
      constants.SHEET_COLUMN_USER_FIRST_NAME,
      constants.SHEET_COLUMN_LAST_QUERIED_BUS_STOP,
      constants.SHEET_COLUMN_UPDATED_AT,
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
