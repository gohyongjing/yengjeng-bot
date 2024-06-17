import { SpreadsheetService } from '@core/spreadsheet';
import { LOG_LEVEL } from './logger.type';

export class LoggerService {
  private spreadsheetService: SpreadsheetService;
  SHEET_INDEX = 0;

  constructor() {
    this.spreadsheetService = new SpreadsheetService();
  }

  private log(details: unknown, logLevel: LOG_LEVEL = 'INFO') {
    this.spreadsheetService
      .open()
      .getSheets()
      [this.SHEET_INDEX].appendRow([new Date(), logLevel, details]);
  }

  debug(details: unknown) {
    this.log(details, 'DEBUG');
  }

  info(details: unknown) {
    this.log(details, 'INFO');
  }

  warn(details: unknown) {
    this.log(details, 'WARN');
  }

  error(details: unknown) {
    this.log(details, 'ERROR');
  }

  fatal(details: unknown) {
    this.log(details, 'FATAL');
  }
}
