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

export const defaultMockSpreadsheetApps = {
  TEST_SPREADSHEET_ID: {
    DefaultTestSheet: mockSpreadsheetData,
  },
};

export const createMockSpreadsheetApp = (
  spreadsheetApps: {
    [id: string]: { [sheetName: string]: unknown[][] };
  } = defaultMockSpreadsheetApps,
) => {
  const createMockSpreadsheet = (
    sheets: { [sheetName: string]: unknown[][] } = {},
  ): GoogleAppsScript.Spreadsheet.Spreadsheet => {
    const createSheet = (
      sheetName: string,
      initialSheetData: unknown[][] = [],
    ): GoogleAppsScript.Spreadsheet.Sheet => {
      const data = initialSheetData.map((row) => [...row]);

      const createMockTextFinder = (
        startRow: number,
        searchValue: string,
        searchColumn: number,
      ): GoogleAppsScript.Spreadsheet.TextFinder => {
        let currentRow = startRow;
        return new Builder(MockTextFinder)
          .with({
            findNext: () => {
              while (currentRow < data.length) {
                const row = data[currentRow];
                if (row && row.length >= searchColumn) {
                  // Google sheets use non strict equality check
                  // eslint-disable-next-line eqeqeq
                  if (row[searchColumn - 1] == searchValue) {
                    return new Builder(MockRange)
                      .with({
                        getRow: () => currentRow + 1,
                      })
                      .build();
                  }
                }
                currentRow++;
              }
              return null;
            },
            findAll: () => {
              const foundCells: GoogleAppsScript.Spreadsheet.Range[] = [];
              for (let i = startRow; i < data.length; i++) {
                const row = data[i];
                if (row && row.length >= searchColumn) {
                  // Google sheets use non strict equality check
                  // eslint-disable-next-line eqeqeq
                  if (row[searchColumn - 1] == searchValue) {
                    foundCells.push(
                      new Builder(MockRange)
                        .with({
                          getRow: () => i + 1,
                        })
                        .build(),
                    );
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
              return createMockTextFinder(rowIndex, searchValue, colIndex + 1);
            },
            getRow: () => rowIndex + 1,
            getColumn: () => colIndex + 1,
            getNumRows: () => numRows,
            getNumColumns: () => numCols,
            deleteCells: (
              // shiftDimension: GoogleAppsScript.Spreadsheet.Dimension,
              shiftDimension: unknown,
            ) => {
              if (
                // shiftDimension === GoogleAppsScript.Spreadsheet.Dimension.ROWS
                shiftDimension === 'ROWS'
              ) {
                if (rowIndex >= 0 && rowIndex < data.length) {
                  data.splice(rowIndex, numRows);
                }
              }
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
            return createMockTextFinder(0, searchValue, 1);
          },
          getName: () => sheetName,
        })
        .build();

      return mockSheet;
    };

    const sheetMap = new Map<string, GoogleAppsScript.Spreadsheet.Sheet>();
    for (const [sheetName, data] of Object.entries(sheets)) {
      sheetMap.set(sheetName, createSheet(sheetName, data));
    }

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

  const spreadsheetInstances = new Map<
    string,
    GoogleAppsScript.Spreadsheet.Spreadsheet
  >();

  if (spreadsheetApps) {
    Object.entries(spreadsheetApps).forEach(([spreadsheetId, sheets]) => {
      spreadsheetInstances.set(spreadsheetId, createMockSpreadsheet(sheets));
    });
  }

  return new Builder(MockSpreadsheetApp)
    .with({
      openById: jest.fn((spreadsheetId: string) => {
        const sheet = spreadsheetInstances.get(spreadsheetId)!;
        if (sheet === undefined) {
          throw `Sheet with id ${spreadsheetId} not found`;
        }
        return sheet;
      }),
    })
    .build();
};
