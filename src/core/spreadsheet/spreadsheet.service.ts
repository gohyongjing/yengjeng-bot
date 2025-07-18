import { ConfigService } from '@core/config';
import { SpreadsheetConfig } from './spreadsheet.config';

export class SpreadsheetService {
  private spreadsheetId: string;
  private sheetName: string;
  private headers: unknown[] | null;

  constructor(sheetName: string, headers: unknown[] | null = null) {
    const configService = new ConfigService<SpreadsheetConfig>();
    this.spreadsheetId = configService.get('SPREADSHEET_ID');
    this.sheetName = sheetName;
    this.headers = headers;
  }

  private getSheet(): GoogleAppsScript.Spreadsheet.Sheet {
    const spreadsheet = SpreadsheetApp.openById(this.spreadsheetId);
    const sheet = spreadsheet.getSheetByName(this.sheetName);

    if (!sheet) {
      const newSheet = spreadsheet.insertSheet(this.sheetName);
      if (this.headers) {
        newSheet.appendRow(this.headers);
      }
      return newSheet;
    }
    return sheet;
  }

  /**
   * Helper function to find a cell by lookup value and return the range
   * @param lookupColumnNumber - The column number to search in (1-indexed)
   * @param lookupValue - The value to search for
   * @returns The range containing the found row, or null if not found
   */
  private getRange(
    lookupColumnNumber: number,
    lookupValue: string,
  ): GoogleAppsScript.Spreadsheet.Range | null {
    const sheet = this.getSheet();
    const lookupColumn = sheet.getRange(
      1,
      lookupColumnNumber,
      sheet.getLastRow(),
      1,
    );
    const textFinder = lookupColumn.createTextFinder(lookupValue);
    const foundCell = textFinder.findNext();

    if (foundCell) {
      return sheet.getRange(foundCell.getRow(), 1, 1, sheet.getLastColumn());
    }

    return null;
  }

  /**
   * Creates a new row in a sheet with the provided values
   * @param values - Array of values to add to the new row
   * @returns The values that were created
   */
  createRow(values: unknown[]): unknown[] {
    const sheet = this.getSheet().appendRow(values);
    const lastRow = sheet.getLastRow();
    const range = sheet.getRange(lastRow, 1, 1, values.length);
    return range.getValues()[0];
  }

  /**
   * Finds a row in a sheet by looking up a value in a specific column
   * @param lookupColumnNumber - The column number to search in (1-indexed)
   * @param lookupValue - The value to search for
   * @returns The values in the found row, or null if not found
   */
  readRow(lookupColumnNumber: number, lookupValue: string): unknown[] | null {
    const range = this.getRange(lookupColumnNumber, lookupValue);

    if (range) {
      return range.getValues()[0];
    }

    return null;
  }

  /**
   * Updates an existing row with new values
   * @param lookupColumnNumber - The column number to search in (1-indexed)
   * @param lookupValue - The value to search for
   * @param values - Array of values to set in the row
   * @returns The values that were updated
   */
  updateRow(
    lookupColumnNumber: number,
    lookupValue: string,
    values: unknown[],
  ): unknown[] {
    const range = this.getRange(lookupColumnNumber, lookupValue);

    if (range) {
      range.setValues([values]);
      return values;
    }

    return this.createRow(values);
  }
}
