import { SpreadsheetService } from './spreadsheet.service_v2';
import { MockLogger } from '@core/googleAppsScript';
import {
  mockSpreadsheetData,
  MockSpreadsheetAppWithData,
} from './spreadsheet.mock';

jest.mock('@core/config', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({
    get: jest.fn().mockReturnValue('test-spreadsheet-id'),
  })),
}));

describe('SpreadsheetService', () => {
  let underTest: SpreadsheetService;

  beforeAll(() => {
    global.Logger = MockLogger;
    global.SpreadsheetApp = MockSpreadsheetAppWithData;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    underTest = new SpreadsheetService('TestSheet');
  });

  describe('createRow', () => {
    it('should create a new row with provided values and return those values', () => {
      const values = ['value1', 'value2', 'value3'];

      const result = underTest.createRow(values);

      expect(result).toEqual(values);
    });

    it('should handle empty values array', () => {
      const values: any[] = [];

      const result = underTest.createRow(values);

      expect(result).toEqual(values);
    });

    it('should handle single value', () => {
      const values = ['single-value'];

      const result = underTest.createRow(values);

      expect(result).toEqual(values);
    });

    it('should handle mixed data types', () => {
      const values = ['string', 123, true, null];

      const result = underTest.createRow(values);

      expect(result).toEqual(values);
    });
  });

  describe('readRow', () => {
    describe('when row is found', () => {
      it('should return the values in the found row', () => {
        const lookupColumnNumber = 1;
        const expectedRow = mockSpreadsheetData[1];
        const lookupValue = expectedRow[0];

        const result = underTest.readRow(lookupColumnNumber, lookupValue);

        expect(result).toEqual(expectedRow);
      });

      it('should find row in different columns', () => {
        const lookupColumnNumber = 2;
        const expectedRow = mockSpreadsheetData[2];
        const lookupValue = expectedRow[1];

        const result = underTest.readRow(lookupColumnNumber, lookupValue);

        expect(result).toEqual(expectedRow);
      });

      it('should handle case-sensitive search', () => {
        const lookupColumnNumber = 3;
        const expectedRow = mockSpreadsheetData[3];
        const lookupValue = expectedRow[2];

        const result = underTest.readRow(lookupColumnNumber, lookupValue);

        expect(result).toEqual(expectedRow);
      });
    });

    describe('when row is not found', () => {
      it('should return null for non-existent value', () => {
        const lookupColumnNumber = 1;
        const lookupValue = 'non-existent-value';

        const result = underTest.readRow(lookupColumnNumber, lookupValue);

        expect(result).toBeNull();
      });

      it('should return null for empty search value', () => {
        const lookupColumnNumber = 1;
        const lookupValue = '';

        const result = underTest.readRow(lookupColumnNumber, lookupValue);

        expect(result).toBeNull();
      });
    });
  });

  describe('updateRow', () => {
    describe('when row exists', () => {
      it('should update existing row with new values', () => {
        const lookupColumnNumber = 1;
        const newValues = mockSpreadsheetData[1];
        const lookupValue = newValues[0];

        const result = underTest.updateRow(
          lookupColumnNumber,
          lookupValue,
          newValues,
        );

        expect(result).toEqual(newValues);
      });

      it('should handle partial row update', () => {
        const lookupColumnNumber = 2;
        const lookupValue = 'Jane Smith';
        const partialValues = ['2', 'Jane Smith', 'jane.updated@example.com'];

        const result = underTest.updateRow(
          lookupColumnNumber,
          lookupValue,
          partialValues,
        );

        expect(result).toEqual(partialValues);
      });

      it('should handle update with more columns than original', () => {
        const lookupColumnNumber = 3;
        const lookupValue = 'bob@example.com';
        const expandedValues = [
          '3',
          'Bob Johnson',
          'bob@example.com',
          'active',
          '2024-01-03',
          'extra',
          'columns',
        ];

        const result = underTest.updateRow(
          lookupColumnNumber,
          lookupValue,
          expandedValues,
        );

        expect(result).toEqual(expandedValues);
      });
    });

    describe('when row does not exist', () => {
      it('should create new row with values', () => {
        const lookupColumnNumber = 1;
        const lookupValue = 'new-row-value';
        const values = ['new-row-value', 'new-data', 'created'];

        const result = underTest.updateRow(
          lookupColumnNumber,
          lookupValue,
          values,
        );

        expect(result).toEqual(values);
      });

      it('should handle empty values array for new row', () => {
        const lookupColumnNumber = 1;
        const lookupValue = 'empty-new-row';
        const values: any[] = [];

        const result = underTest.updateRow(
          lookupColumnNumber,
          lookupValue,
          values,
        );

        expect(result).toEqual(values);
      });
    });

    describe('edge cases', () => {
      it('should handle update with empty values array', () => {
        const lookupColumnNumber = 1;
        const lookupValue = '4';
        const values: any[] = [];

        const result = underTest.updateRow(
          lookupColumnNumber,
          lookupValue,
          values,
        );

        expect(result).toEqual(values);
      });

      it('should handle update with null values', () => {
        const lookupColumnNumber = 2;
        const values = mockSpreadsheetData[4];
        const lookupValue = values[1];

        const result = underTest.updateRow(
          lookupColumnNumber,
          lookupValue,
          values,
        );

        expect(result).toEqual(values);
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete workflow: create, read, update', () => {
      const initialValues = mockSpreadsheetData[1];
      const createResult = underTest.createRow(initialValues);
      expect(createResult).toEqual(initialValues);

      const readResult = underTest.readRow(1, initialValues[0]);
      expect(readResult).toEqual(initialValues);

      const updatedValues = mockSpreadsheetData[2];
      const updateResult = underTest.updateRow(
        1,
        initialValues[0],
        updatedValues,
      );
      expect(updateResult).toEqual(updatedValues);
    });

    it('should handle multiple operations on same data', () => {
      const row1 = ['user1', 'data1'];
      const row2 = ['user2', 'data2'];
      const row3 = ['user3', 'data3'];

      underTest.createRow(row1);
      underTest.createRow(row2);
      underTest.createRow(row3);

      const updatedRow2 = ['user2', 'updated-data2'];
      const updateResult = underTest.updateRow(1, 'user2', updatedRow2);
      expect(updateResult).toEqual(updatedRow2);

      const readResult = underTest.readRow(1, 'user1');
      expect(readResult).toEqual(row1);
    });

    it('should handle multiple sheets with different names', () => {
      const sheet1 = new SpreadsheetService('Users');
      const sheet2 = new SpreadsheetService('Products');

      const values1 = ['user1', 'john'];
      const values2 = ['product1', 'laptop'];

      const result1 = sheet1.createRow(values1);
      const result2 = sheet2.createRow(values2);

      expect(result1).toEqual(values1);
      expect(result2).toEqual(values2);
    });

    it('should handle data persistence across operations', () => {
      const row1 = ['persistent', 'data1'];
      const row2 = ['persistent', 'data2'];

      underTest.createRow(row1);
      underTest.createRow(row2);

      const updatedRow1 = ['persistent', 'updated1'];
      const updateResult = underTest.updateRow(1, 'persistent', updatedRow1);
      expect(updateResult).toEqual(updatedRow1);

      const readResult1 = underTest.readRow(1, 'persistent');
      expect(readResult1).toEqual(updatedRow1);
    });
  });
});
