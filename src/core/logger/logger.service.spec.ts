import {
  appendRow,
  log,
  MockLogger,
  MockSpreadsheetApp,
} from '@core/googleAppsScript';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let underTest: LoggerService;

  beforeAll(() => {
    global.Logger = MockLogger;
    global.SpreadsheetApp = MockSpreadsheetApp;

    underTest = new LoggerService();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('debug', () => {
    it('should use the logger and spreadsheet', () => {
      const input = `test log information debug`;
      underTest.debug(input);

      const actualLoggedMessage = log.mock.calls[0][0];
      expect(actualLoggedMessage.includes(input)).toBeTruthy();
      const actualRowAppended = appendRow.mock.calls[0][0];
      expect(actualRowAppended.includes(input)).toBeTruthy();
    });
  });

  describe('info', () => {
    it('should use the logger and spreadsheet', () => {
      const input = `test log information info`;
      underTest.info(input);

      const actualLoggedMessage = log.mock.calls[0][0];
      expect(actualLoggedMessage.includes(input)).toBeTruthy();
      const actualRowAppended = appendRow.mock.calls[0][0];
      expect(actualRowAppended.includes(input)).toBeTruthy();
    });
  });

  describe('warn', () => {
    it('should use the logger and spreadsheet', () => {
      const input = `test log information warn`;
      underTest.warn(input);

      const actualLoggedMessage = log.mock.calls[0][0];
      expect(actualLoggedMessage.includes(input)).toBeTruthy();
      const actualRowAppended = appendRow.mock.calls[0][0];
      expect(actualRowAppended.includes(input)).toBeTruthy();
    });
  });

  describe('error', () => {
    it('should use the logger and spreadsheet', () => {
      const input = `test log information error`;
      underTest.error(input);

      const actualLoggedMessage = log.mock.calls[0][0];
      expect(actualLoggedMessage.includes(input)).toBeTruthy();
      const actualRowAppended = appendRow.mock.calls[0][0];
      expect(actualRowAppended.includes(input)).toBeTruthy();
    });
  });

  describe('fatal', () => {
    it('should use the logger and spreadsheet', () => {
      const input = `test log information fatal`;
      underTest.fatal(input);

      const actualLoggedMessage = log.mock.calls[0][0];
      expect(actualLoggedMessage.includes(input)).toBeTruthy();
      const actualRowAppended = appendRow.mock.calls[0][0];
      expect(actualRowAppended.includes(input)).toBeTruthy();
    });
  });
});
