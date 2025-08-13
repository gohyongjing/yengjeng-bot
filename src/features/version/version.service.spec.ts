import { VersionService } from './version.service';
import {
  MockTelegramUrlFetchApp,
  MockUser,
  sendMessage,
} from '@core/telegram/telegram.mock';
import { Command } from '@core/util/command';

describe('VersionService', () => {
  let underTest: VersionService;

  beforeAll(() => {
    global.UrlFetchApp = MockTelegramUrlFetchApp;
  });

  beforeEach(() => {
    underTest = new VersionService();
  });

  describe('processCommand', () => {
    it('should return version number', () => {
      const command = new Command('/version');
      underTest.processCommand(command, MockUser, 123456);

      const actualUrl = sendMessage.mock.calls[0][0];

      expect(
        actualUrl.includes(encodeURIComponent('Yeng Jeng Bot')),
      ).toBeTruthy();
      expect(actualUrl.includes(`v${underTest.major.toString()}`)).toBeTruthy();
      expect(actualUrl.includes(`.${underTest.minor.toString()}`)).toBeTruthy();
      expect(actualUrl.includes(`.${underTest.patch.toString()}`)).toBeTruthy();
    });
  });

  describe('getVersion', () => {
    it('should return version number starting with v', () => {
      const actual = underTest.getVersion();
      expect(actual.length).toBeGreaterThan(0);
      expect(actual.charAt(0)).toBe('v');
    });

    it('should return version number with 3 dot separated integers', () => {
      const actual = underTest.getVersion();
      const numbers = actual.slice(1).split('.');
      expect(numbers).toHaveLength(3);
      expect(Number.isInteger(Number(numbers[0]))).toBeTruthy();
      expect(Number.isInteger(Number(numbers[1]))).toBeTruthy();
      expect(Number.isInteger(Number(numbers[2]))).toBeTruthy();
    });
  });

  describe('getChangeLog', () => {
    it('should return a list with at least one string', () => {
      const actual = underTest.getChangeLog();
      expect(actual.length).toBeGreaterThan(0);
    });
  });
});
