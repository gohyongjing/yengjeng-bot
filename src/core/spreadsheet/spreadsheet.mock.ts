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

const createMockSpreadsheetApp = () => {
  const spreadsheetInstances = new Map<
    string,
    GoogleAppsScript.Spreadsheet.Spreadsheet
  >();

  const createMockSpreadsheet = (
    initialData: any[][] = [],
  ): GoogleAppsScript.Spreadsheet.Spreadsheet => {
    const sheetMap = new Map<string, any>();

    const createSheet = (
      sheetName: string,
      initialSheetData: any[][] = [],
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
                if (data[i][searchColumn - 1] === searchValue) {
                  return createMockFoundCell(i);
                }
              }
              return null;
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
            setValues: (values: any[][]) => {
              if (
                values &&
                values.length > 0 &&
                rowIndex >= 0 &&
                rowIndex < data.length
              ) {
                data[rowIndex] = values[0];
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
          })
          .build();
      };

      const mockSheet: GoogleAppsScript.Spreadsheet.Sheet = new Builder(
        MockSheet,
      )
        .with({
          getRange: ((
            row: number,
            col: number,
            numRows: number,
            numCols: number,
          ) => {
            return createMockRange(row - 1, col - 1, numRows, numCols);
          }) as any, //TODO: Fix as any
          getLastRow: () => data.length,
          getLastColumn: () => data[0]?.length || 0,
          appendRow: (values: any[]): GoogleAppsScript.Spreadsheet.Sheet => {
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

export const MockSpreadsheetAppWithData = createMockSpreadsheetApp();
