import { ConfigService } from '@core/config';
import { SpreadsheetConfig } from './spreadsheet.config';

export class SpreadsheetService {
  private spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;

  constructor() {
    const configService = new ConfigService<SpreadsheetConfig>();
    const spreadsheetId = configService.get('SPREADSHEET_ID');
    this.spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  }

  open(): GoogleAppsScript.Spreadsheet.Spreadsheet {
    return this.spreadsheet;
  }
}
