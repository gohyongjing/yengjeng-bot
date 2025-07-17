import { SpreadsheetService } from './spreadsheet.service';

describe('SpreadsheetService', () => {
  let mockSheet: jest.Mocked<GoogleAppsScript.Spreadsheet.Sheet>;
  let mockSpreadsheet: jest.Mocked<GoogleAppsScript.Spreadsheet.Spreadsheet>;
  let mockRange: jest.Mocked<GoogleAppsScript.Spreadsheet.Range>;
  let mockCell: jest.Mocked<GoogleAppsScript.Spreadsheet.Range>;
  let mockTextFinder: jest.Mocked<GoogleAppsScript.Spreadsheet.TextFinder>;

  beforeEach(() => {
    mockCell = {
      getRow: jest.fn().mockReturnValue(2),
      getValue: jest.fn().mockReturnValue('test-value'),
    } as any;

    mockTextFinder = {
      findNext: jest.fn().mockReturnValue(mockCell),
    } as any;

    mockRange = {
      getCell: jest.fn().mockReturnValue(mockCell),
      setValues: jest.fn(),
      createTextFinder: jest.fn().mockReturnValue(mockTextFinder),
    } as any;

    mockSheet = {
      getRange: jest.fn().mockReturnValue(mockRange),
      getLastRow: jest.fn().mockReturnValue(10),
      getLastColumn: jest.fn().mockReturnValue(5),
      appendRow: jest.fn(),
      createTextFinder: jest.fn().mockReturnValue(mockTextFinder),
      getName: jest.fn().mockReturnValue('TestSheet'),
    } as any;

    mockSpreadsheet = {
      getSheets: jest.fn().mockReturnValue([mockSheet]),
    } as any;
  });

  describe('findRowByLookupValue', () => {
    it('should find a row when lookup value exists', () => {
      const result = SpreadsheetService.findRowByLookupValue(
        mockSheet,
        1,
        'test-value',
      );

      expect(mockSheet.getRange).toHaveBeenCalledWith(1, 1, 10, 1);
      expect(mockRange.createTextFinder).toHaveBeenCalledWith('test-value');
      expect(mockTextFinder.findNext).toHaveBeenCalled();
      expect(result).toBe(mockRange);
    });

    it('should return null when lookup value does not exist', () => {
      mockTextFinder.findNext.mockReturnValue(null);

      const result = SpreadsheetService.findRowByLookupValue(
        mockSheet,
        1,
        'non-existent',
      );

      expect(result).toBeNull();
    });
  });

  describe('createRow', () => {
    it('should create a new row with provided values', () => {
      const values = ['value1', 'value2', 'value3'];

      const result = SpreadsheetService.createRow(mockSheet, values);

      expect(mockSheet.appendRow).toHaveBeenCalledWith(values);
      expect(mockSheet.getLastRow).toHaveBeenCalled();
      expect(mockSheet.getRange).toHaveBeenCalledWith(10, 1, 1, 3);
      expect(result).toBe(mockRange);
    });
  });

  describe('updateRow', () => {
    it('should update an existing row with new values', () => {
      const values = ['new-value1', 'new-value2', 'new-value3'];

      const result = SpreadsheetService.updateRow(mockRange, values);

      expect(mockRange.setValues).toHaveBeenCalledWith([values]);
      expect(result).toBe(mockRange);
    });
  });

  describe('createOrUpdateRow', () => {
    it('should update existing row when found', () => {
      const values = ['value1', 'value2', 'value3'];

      const result = SpreadsheetService.createOrUpdateRow(
        mockSheet,
        1,
        'existing-value',
        values,
      );

      expect(mockSheet.getRange).toHaveBeenCalledWith(1, 1, 10, 1);
      expect(mockRange.setValues).toHaveBeenCalledWith([values]);
      expect(result).toBe(mockRange);
    });

    it('should create new row when not found', () => {
      mockTextFinder.findNext.mockReturnValue(null);
      const values = ['value1', 'value2', 'value3'];

      const result = SpreadsheetService.createOrUpdateRow(
        mockSheet,
        1,
        'new-value',
        values,
      );

      expect(mockSheet.appendRow).toHaveBeenCalledWith(values);
      expect(result).toBe(mockRange);
    });
  });

  describe('getCellValue', () => {
    it('should return cell value as string', () => {
      const result = SpreadsheetService.getCellValue(mockRange, 1);

      expect(mockRange.getCell).toHaveBeenCalledWith(1, 1);
      expect(mockCell.getValue).toHaveBeenCalled();
      expect(result).toBe('test-value');
    });

    it('should return null for empty cell', () => {
      mockCell.getValue.mockReturnValue('');

      const result = SpreadsheetService.getCellValue(mockRange, 1);

      expect(result).toBeNull();
    });
  });

  describe('getSheetByName', () => {
    it('should return sheet when name matches', () => {
      const result = SpreadsheetService.getSheetByName(
        mockSpreadsheet,
        'TestSheet',
      );

      expect(mockSpreadsheet.getSheets).toHaveBeenCalled();
      expect(result).toBe(mockSheet);
    });

    it('should return null when sheet name not found', () => {
      const result = SpreadsheetService.getSheetByName(
        mockSpreadsheet,
        'NonExistentSheet',
      );

      expect(result).toBeNull();
    });
  });

  describe('getSheetByIndex', () => {
    it('should return sheet when index is valid', () => {
      const result = SpreadsheetService.getSheetByIndex(mockSpreadsheet, 0);

      expect(mockSpreadsheet.getSheets).toHaveBeenCalled();
      expect(result).toBe(mockSheet);
    });

    it('should return null when index is out of bounds', () => {
      const result = SpreadsheetService.getSheetByIndex(mockSpreadsheet, 5);

      expect(result).toBeNull();
    });
  });
});
