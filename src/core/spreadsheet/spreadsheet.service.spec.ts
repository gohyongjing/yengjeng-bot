import { SpreadsheetService } from './spreadsheet.service';
import { MockLogger } from '@core/googleAppsScript';
import { MockGoogleAppsScript } from '@core/googleAppsScript/googleAppsScript.mock';
import {
  mockSpreadsheetData,
  createMockSpreadsheetApp,
} from './spreadsheet.mock';

describe('SpreadsheetService', () => {
  let underTest: SpreadsheetService;

  beforeAll(() => {
    global.GoogleAppsScript = MockGoogleAppsScript;
    global.Logger = MockLogger;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.SpreadsheetApp = createMockSpreadsheetApp();
    underTest = new SpreadsheetService('TestSheet');
  });

  describe('createRow', () => {
    it('should create a new row with provided values and return those values', () => {
      const values = ['value1', 'value2', 'value3'];

      const result = underTest.createRow(values);

      expect(result).toEqual(values);
    });

    it('should handle empty values array', () => {
      const values: unknown[] = [];

      const result = underTest.createRow(values);

      expect(result).toEqual(values);
    });

    it('should handle single value', () => {
      const values = ['single-value'];

      const result = underTest.createRow(values);

      expect(result).toEqual(values);
    });

    it('should handle mixed data types', () => {
      const values = [
        'string',
        123,
        true,
        null,
        '',
        'HELLO123',
        123.45,
        Number.MAX_SAFE_INTEGER,
      ];

      const result = underTest.createRow(values);

      expect(result).toEqual(values);
    });

    it('should handle all input types for row creation without throwing errors', () => {
      const testInputs = [
        'string message',
        123,
        { key: 'value' },
        ['array', 'of', 'items'],
        null,
        undefined,
        '',
        '   ',
        'message with "quotes"',
        'message with \n newlines',
        'message with \t tabs',
        'message with unicode: 🚀',
        new Error('test error'),
        new Date(),
        true,
        false,
      ];

      testInputs.forEach((input) => {
        expect(() => {
          underTest.createRow([input]);
        }).not.toThrow();
      });
    });

    it('should handle very long data values', () => {
      const longData = 'A'.repeat(10000);
      expect(() => {
        underTest.createRow([longData]);
      }).not.toThrow();
    });

    it('should handle special characters and encoding', () => {
      const specialInputs = [
        'data with émojis 🎉',
        'data with 中文',
        'data with русский',
        'data with العربية',
        'data with 🚀🚁🚂🚃🚄🚅',
        'data with \x00\x01\x02',
        'data with \u0000\u0001\u0002',
      ];
      specialInputs.forEach((input) => {
        expect(() => {
          underTest.createRow([input]);
        }).not.toThrow();
      });
    });

    it('should handle high volume row creation', () => {
      expect(() => {
        for (let i = 0; i < 100; i++) {
          underTest.createRow([`data ${i}`]);
        }
      }).not.toThrow();
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

  describe('readRows', () => {
    describe('when rows are found', () => {
      it('should return array with single row when one match is found', () => {
        const lookupColumnNumber = 1;
        const expectedRow = mockSpreadsheetData[1];
        const lookupValue = expectedRow[0];

        const result = underTest.readRows(lookupColumnNumber, lookupValue);

        expect(result).toEqual([expectedRow]);
        expect(result).toHaveLength(1);
      });

      it('should find row in different columns', () => {
        const lookupColumnNumber = 2;
        const expectedRow = mockSpreadsheetData[2];
        const lookupValue = expectedRow[1];

        const result = underTest.readRows(lookupColumnNumber, lookupValue);

        expect(result).toEqual([expectedRow]);
        expect(result).toHaveLength(1);
      });

      it('should handle case-sensitive search', () => {
        const lookupColumnNumber = 3;
        const expectedRow = mockSpreadsheetData[3];
        const lookupValue = expectedRow[2];

        const result = underTest.readRows(lookupColumnNumber, lookupValue);

        expect(result).toEqual([expectedRow]);
        expect(result).toHaveLength(1);
      });
    });

    describe('when no rows are found', () => {
      it('should return empty array for non-existent value', () => {
        const lookupColumnNumber = 1;
        const lookupValue = 'non-existent-value';

        const result = underTest.readRows(lookupColumnNumber, lookupValue);

        expect(result).toEqual([]);
        expect(result).toHaveLength(0);
      });

      it('should return empty array for empty search value', () => {
        const lookupColumnNumber = 1;
        const lookupValue = '';

        const result = underTest.readRows(lookupColumnNumber, lookupValue);

        expect(result).toEqual([]);
        expect(result).toHaveLength(0);
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
        const values: unknown[] = [];

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
        const values: unknown[] = [];

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

  describe('deleteRow', () => {
    describe('when row exists', () => {
      it('should delete existing row and return true', () => {
        const lookupColumnNumber = 1;
        const existingRow = mockSpreadsheetData[1];
        const lookupValue = existingRow[0];

        const result = underTest.deleteRow(lookupColumnNumber, lookupValue);

        expect(result).toBe(true);
      });

      it('should handle different lookup columns', () => {
        const lookupColumnNumber = 2;
        const existingRow = mockSpreadsheetData[2];
        const lookupValue = existingRow[1];

        const result = underTest.deleteRow(lookupColumnNumber, lookupValue);

        expect(result).toBe(true);
      });
    });

    describe('when row does not exist', () => {
      it('should return false for non-existent value', () => {
        const lookupColumnNumber = 1;
        const lookupValue = 'non-existent-value';

        const result = underTest.deleteRow(lookupColumnNumber, lookupValue);

        expect(result).toBe(false);
      });

      it('should return false for empty search value', () => {
        const lookupColumnNumber = 1;
        const lookupValue = '';

        const result = underTest.deleteRow(lookupColumnNumber, lookupValue);

        expect(result).toBe(false);
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple operations on different sheets', () => {
      const sheet1 = new SpreadsheetService('Users');
      const sheet2 = new SpreadsheetService('Products');
      const userData = ['user1', 'john'];
      const productData = ['product1', 'laptop'];

      //create
      const userResult = sheet1.createRow(userData);
      const productResult = sheet2.createRow(productData);
      expect(userResult).toEqual(userData);
      expect(productResult).toEqual(productData);

      const readUserResult = sheet1.readRow(1, 'user1');
      const readProductResult = sheet2.readRow(1, 'product1');
      expect(readUserResult).toEqual(userData);
      expect(readProductResult).toEqual(productData);

      //update
      const updatedUserData = ['user1', 'john-updated'];
      const newUserData = ['user2', 'jane'];
      const updateResult = sheet1.updateRow(1, 'user1', updatedUserData);
      const createResult = sheet1.updateRow(1, 'user2', newUserData);
      expect(updateResult).toEqual(updatedUserData);
      expect(createResult).toEqual(newUserData);

      const finalReadUser1 = sheet1.readRow(1, 'user1');
      const finalReadUser2 = sheet1.readRow(1, 'user2');
      const finalReadProduct = sheet2.readRow(1, 'product1');
      expect(finalReadUser1).toEqual(updatedUserData);
      expect(finalReadUser2).toEqual(newUserData);
      expect(finalReadProduct).toEqual(productData);

      //delete
      const deleteUserResult = sheet1.deleteRow(1, 'user1');
      const deleteProductResult = sheet2.deleteRow(1, 'product1');
      expect(deleteUserResult).toBe(true);
      expect(deleteProductResult).toBe(true);

      const deletedUserRead = sheet1.readRow(1, 'user1');
      const deletedProductRead = sheet2.readRow(1, 'product1');
      expect(deletedUserRead).toBeNull();
      expect(deletedProductRead).toBeNull();

      const remainingUser = sheet1.readRow(1, 'user2');
      expect(remainingUser).toEqual(newUserData);
    });

    it('should handle multiple rows on the same sheet', () => {
      const row1 = ['user1', 'john'];
      const row2 = ['user2', 'jane'];
      const row3 = ['user3', 'bob'];
      const result1 = underTest.createRow(row1);
      const result2 = underTest.createRow(row2);
      const result3 = underTest.createRow(row3);
      expect(result1).toEqual(row1);
      expect(result2).toEqual(row2);
      expect(result3).toEqual(row3);

      const readRow1 = underTest.readRow(1, 'user1');
      const readRow2 = underTest.readRow(1, 'user2');
      const readRow3 = underTest.readRow(1, 'user3');
      expect(readRow1).toEqual(row1);
      expect(readRow2).toEqual(row2);
      expect(readRow3).toEqual(row3);

      const updatedRow2 = ['user2', 'jane-updated'];
      const newRow4 = ['user4', 'alice'];
      const updateResult = underTest.updateRow(1, 'user2', updatedRow2);
      const createResult = underTest.updateRow(1, 'user4', newRow4);
      expect(updateResult).toEqual(updatedRow2);
      expect(createResult).toEqual(newRow4);

      const finalReadRow1 = underTest.readRow(1, 'user1');
      const finalReadRow2 = underTest.readRow(1, 'user2');
      const finalReadRow3 = underTest.readRow(1, 'user3');
      const finalReadRow4 = underTest.readRow(1, 'user4');
      expect(finalReadRow1).toEqual(row1);
      expect(finalReadRow2).toEqual(updatedRow2);
      expect(finalReadRow3).toEqual(row3);
      expect(finalReadRow4).toEqual(newRow4);
    });
  });
});
