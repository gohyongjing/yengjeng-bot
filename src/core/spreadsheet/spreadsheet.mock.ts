import {
  MockRange,
  MockSheet,
  MockSpreadsheet,
  MockSpreadsheetApp,
  MockTextFinder,
} from '@core/googleAppsScript';
import { Builder } from '@core/util/builder';

export const mockSpreadsheetData = [
  ['ID', 'Name', 'Email', 'Status', 'Created'],
  ['1', 'John Doe', 'john@example.com', 'active', '2024-01-01'],
  ['2', 'Jane Smith', 'jane@example.com', 'inactive', '2024-01-02'],
  ['3', 'Bob Johnson', 'bob@example.com', 'active', '2024-01-03'],
  ['4', 'Alice Brown', 'alice@example.com', 'pending', '2024-01-04'],
];

export const createMockSpreadsheetApp = () => {
  const spreadsheetInstances = new Map<
    string,
    GoogleAppsScript.Spreadsheet.Spreadsheet
  >();

  const createMockSpreadsheet = (
    initialData: string[][] = [],
  ): GoogleAppsScript.Spreadsheet.Spreadsheet => {
    const sheetMap = new Map<string, GoogleAppsScript.Spreadsheet.Sheet>();

    const createSheet = (
      sheetName: string,
      initialSheetData: string[][] = [],
    ): GoogleAppsScript.Spreadsheet.Sheet => {
      const data = initialSheetData.map((row) => [...row]);

      const createMockFoundCell = (
        rowIndex: number,
      ): GoogleAppsScript.Spreadsheet.Range => {
        return new Builder(MockRange)
          .with({
            getRow: () => rowIndex + 1,
          })
          .build();
      };

      const createMockTextFinder = (
        searchValue: string,
        searchColumn: number,
      ): GoogleAppsScript.Spreadsheet.TextFinder => {
        return new Builder(MockTextFinder)
          .with({
            findNext: () => {
              for (let i = 0; i < data.length; i++) {
                const row = data[i];
                if (row && row.length >= searchColumn) {
                  // Google sheets use non strict equality check
                  // eslint-disable-next-line eqeqeq
                  if (row[searchColumn - 1] == searchValue) {
                    return createMockFoundCell(i);
                  }
                }
              }
              return null;
            },
            findAll: () => {
              const foundCells: GoogleAppsScript.Spreadsheet.Range[] = [];
              for (let i = 0; i < data.length; i++) {
                const row = data[i];
                if (row && row.length >= searchColumn) {
                  // Google sheets use non strict equality check
                  // eslint-disable-next-line eqeqeq
                  if (row[searchColumn - 1] == searchValue) {
                    foundCells.push(createMockFoundCell(i));
                  }
                }
              }
              return foundCells;
            },
          })
          .build();
      };

      const createMockRange = (
        rowIndex: number,
        colIndex: number,
        numRows: number,
        numCols: number,
      ): GoogleAppsScript.Spreadsheet.Range => {
        return new Builder(MockRange)
          .with({
            setValues: (values: string[][]) => {
              if (values && values.length > 0) {
                if (rowIndex >= 0 && rowIndex < data.length) {
                  data[rowIndex] = values[0];
                } else if (rowIndex >= data.length) {
                  data.push(values[0]);
                }
              }
              return createMockRange(rowIndex, colIndex, numRows, numCols);
            },
            getValues: () => {
              if (rowIndex >= 0 && rowIndex < data.length) {
                return [data[rowIndex]];
              }
              return [[]];
            },
            createTextFinder: (searchValue: string) => {
              return createMockTextFinder(searchValue, colIndex + 1);
            },
            getRow: () => rowIndex + 1,
            getColumn: () => colIndex + 1,
            getNumRows: () => numRows,
            getNumColumns: () => numCols,
            deleteCells: (
              shiftDimension: GoogleAppsScript.Spreadsheet.Dimension,
            ) => {
              if (
                shiftDimension === GoogleAppsScript.Spreadsheet.Dimension.ROWS
              ) {
                if (rowIndex >= 0 && rowIndex < data.length) {
                  data.splice(rowIndex, numRows);
                }
              }
              return createMockRange(rowIndex, colIndex, numRows, numCols);
            },
          })
          .build();
      };

      const mockSheet: GoogleAppsScript.Spreadsheet.Sheet = new Builder(
        MockSheet,
      )
        .with({
          getRange: (
            rowOrA1Notation: GoogleAppsScript.Integer | string,
            column?: GoogleAppsScript.Integer,
            numRows?: GoogleAppsScript.Integer,
            numCols?: GoogleAppsScript.Integer,
          ) => {
            if (typeof rowOrA1Notation === 'string') {
              // Handle A1 notation - for simplicity, assume it's a single cell
              return createMockRange(0, 0, 1, 1);
            }

            const row = rowOrA1Notation;
            const col = column || 1;
            const rows = numRows || 1;
            const cols = numCols || 1;

            return createMockRange(row - 1, col - 1, rows, cols);
          },
          getLastRow: () => data.length,
          getLastColumn: () => data[0]?.length || 0,
          appendRow: (values: string[]): GoogleAppsScript.Spreadsheet.Sheet => {
            data.push(values);
            return mockSheet;
          },
          createTextFinder: (searchValue: string) => {
            return createMockTextFinder(searchValue, 1);
          },
          getName: () => sheetName,
        })
        .build();

      return mockSheet;
    };

    const defaultSheet = createSheet('TestSheet', initialData);
    sheetMap.set('TestSheet', defaultSheet);

    const mockSpreadsheet = new Builder(MockSpreadsheet)
      .with({
        getSheetByName: (sheetName: string) => {
          return sheetMap.get(sheetName) || null;
        },
        insertSheet: (sheetName: string) => {
          const newSheet = createSheet(sheetName);
          sheetMap.set(sheetName, newSheet);
          return newSheet;
        },
      })
      .build();

    return mockSpreadsheet;
  };

  return new Builder(MockSpreadsheetApp)
    .with({
      openById: jest.fn((spreadsheetId: string) => {
        if (!spreadsheetInstances.has(spreadsheetId)) {
          spreadsheetInstances.set(
            spreadsheetId,
            createMockSpreadsheet(mockSpreadsheetData),
          );
        }
        return spreadsheetInstances.get(spreadsheetId)!;
      }),
    })
    .build();
};
