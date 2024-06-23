import { MockSpreadsheet, MockSpreadsheetApp } from '@core/googleAppsScript';
import { SpreadsheetService } from './spreadsheet.service';
import { Builder } from '@core/util/builder';

describe('SpreadsheetService', () => {
  const mockSpreadSheet = new Builder(MockSpreadsheet).build();
  let underTest: SpreadsheetService;

  beforeAll(() => {
    global.SpreadsheetApp = new Builder(MockSpreadsheetApp)
      .with({ openById: () => mockSpreadSheet })
      .build();
  });

  beforeEach(() => {
    underTest = new SpreadsheetService();
  });

  describe('open', () => {
    it('should return the spreadsheet', () => {
      const actual = underTest.open();
      expect(actual).toBe(mockSpreadSheet);
    });
  });
});
