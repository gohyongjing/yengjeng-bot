import { LogLevel } from './logger.type';
import { LoggerData } from './logger.data';

export class LoggerService {
  private loggerData: LoggerData;

  constructor() {
    this.loggerData = new LoggerData();
  }

  private log(details: unknown, logLevel: LogLevel) {
    const entry = [new Date(), logLevel, details];
    Logger.log(entry);
    this.loggerData.createLogEntry(logLevel, details);
    console.log(entry); //TODO: Check if this crashes google apps script
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
