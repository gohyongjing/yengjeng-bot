import { SpreadsheetService } from '@core/spreadsheet/spreadsheet.service';
import { LogLevel } from './logger.type';

export class LoggerData {
  private static SHEET_NAME = 'log_service';
  private spreadsheetService;

  constructor() {
    this.spreadsheetService = new SpreadsheetService(LoggerData.SHEET_NAME, [
      'Timestamp',
      'Log Level',
      'Message',
    ]);
  }

  createLogEntry(logLevel: LogLevel, message: unknown) {
    return this.spreadsheetService.createRow([new Date(), logLevel, message]);
  }
}
