import { VersionService } from './version.service';

describe('VersionService', () => {
  let underTest: VersionService;

  beforeEach(() => {
    underTest = new VersionService();
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
