import { ConfigService } from '@core/config';
import { SpreadsheetConfig } from './spreadsheet.config';

export class SpreadsheetService {
  private spreadsheetId: string;

  constructor() {
    const configService = new ConfigService<SpreadsheetConfig>();
    this.spreadsheetId = configService.get('SPREADSHEET_ID');
  }

  open(): GoogleAppsScript.Spreadsheet.Spreadsheet {
    return SpreadsheetApp.openById(this.spreadsheetId);
  }

  /**
   * Finds a row in a sheet by looking up a value in a specific column
   * @param sheet - The Google Apps Script sheet to search in
   * @param lookupColumnNumber - The column number to search in (1-indexed)
   * @param lookupValue - The value to search for
   * @returns The range containing the found row, or null if not found
   */
  static findRowByLookupValue(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    lookupColumnNumber: number,
    lookupValue: string,
  ): GoogleAppsScript.Spreadsheet.Range | null {
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
   * @param sheet - The Google Apps Script sheet to add the row to
   * @param values - Array of values to add to the new row
   * @returns The range of the newly created row
   */
  static createRow(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    values: unknown[],
  ): GoogleAppsScript.Spreadsheet.Range {
    sheet.appendRow(values);
    const lastRow = sheet.getLastRow();
    return sheet.getRange(lastRow, 1, 1, values.length);
  }

  /**
   * Updates an existing row with new values
   * @param rowRange - The range of the row to update
   * @param values - Array of values to set in the row
   * @returns The updated range
   */
  static updateRow(
    rowRange: GoogleAppsScript.Spreadsheet.Range,
    values: unknown[],
  ): GoogleAppsScript.Spreadsheet.Range {
    rowRange.setValues([values]);
    return rowRange;
  }

  /**
   * Creates or updates a row based on a lookup value
   * @param sheet - The Google Apps Script sheet to operate on
   * @param lookupColumnNumber - The column number to search in (1-indexed)
   * @param lookupValue - The value to search for
   * @param values - Array of values to set in the row
   * @returns The range of the created or updated row
   */
  static createOrUpdateRow(
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    lookupColumnNumber: number,
    lookupValue: string,
    values: unknown[],
  ): GoogleAppsScript.Spreadsheet.Range {
    const existingRow = this.findRowByLookupValue(
      sheet,
      lookupColumnNumber,
      lookupValue,
    );

    if (existingRow) {
      return this.updateRow(existingRow, values);
    } else {
      return this.createRow(sheet, values);
    }
  }

  /**
   * Gets a specific cell value from a row range
   * @param rowRange - The range of the row
   * @param columnNumber - The column number to get the value from (1-indexed)
   * @returns The cell value as a string, or null if the cell is empty
   */
  static getCellValue(
    rowRange: GoogleAppsScript.Spreadsheet.Range,
    columnNumber: number,
  ): string | null {
    const cell = rowRange.getCell(1, columnNumber);
    const value = cell.getValue();
    return value ? value.toString() : null;
  }

  /**
   * Gets a sheet by name from a spreadsheet
   * @param spreadsheet - The Google Apps Script spreadsheet
   * @param sheetName - The name of the sheet to get
   * @returns The sheet, or null if not found
   */
  static getSheetByName(
    spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
    sheetName: string,
  ): GoogleAppsScript.Spreadsheet.Sheet | null {
    const sheets = spreadsheet.getSheets();
    for (const sheet of sheets) {
      if (sheet.getName() === sheetName) {
        return sheet;
      }
    }
    return null;
  }

  /**
   * Gets a sheet by index from a spreadsheet
   * @param spreadsheet - The Google Apps Script spreadsheet
   * @param sheetIndex - The index of the sheet to get (0-indexed)
   * @returns The sheet, or null if index is out of bounds
   */
  static getSheetByIndex(
    spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
    sheetIndex: number,
  ): GoogleAppsScript.Spreadsheet.Sheet | null {
    const sheets = spreadsheet.getSheets();
    if (sheetIndex >= 0 && sheetIndex < sheets.length) {
      return sheets[sheetIndex];
    }
    return null;
  }
}
