import { MockUi } from '../base';
import { MockCellImageBuilder } from './cellImageBuilder.mock';
import { MockColorBuilder } from './colorBuilder.mock';
import { MockConditionFormatRuleBuilder } from './conditionalFormatRuleBuilder.mock';
import { MockRange } from './range.mock';
import { MockRangeList } from './rangeList.mock';
import { MockSelection } from './selection.mock';
import { MockSheet } from './sheet.mock';
import { MockSpreadsheet } from './spreadsheet.mock';

export const MockSpreadsheetApp: GoogleAppsScript.Spreadsheet.SpreadsheetApp = {
  Dimension: { COLUMNS: 0, ROWS: 1 },
  create: (
    _name: string,
    _rows?: GoogleAppsScript.Integer,
    _columns?: GoogleAppsScript.Integer,
  ) => MockSpreadsheet,
  enableAllDataSourcesExecution: () => {},
  enableBigQueryExecution: () => {},
  flush: () => {},
  getActive: () => MockSpreadsheet,
  getActiveRange: () => MockRange,
  getActiveRangeList: () => MockRangeList,
  getActiveSheet: () => MockSheet,
  getActiveSpreadsheet: () => MockSpreadsheet,
  getCurrentCell: () => MockRange,
  getSelection: () => MockSelection,
  getUi: () => MockUi,
  newCellImage: () => MockCellImageBuilder,
  newColor: () => MockColorBuilder,
  newConditionalFormatRule: () => MockConditionFormatRuleBuilder,
  newDataSourceSpec: () => {
    return {} as GoogleAppsScript.Spreadsheet.DataSourceSpecBuilder;
  },
  newDataValidation: () => {
    return {} as GoogleAppsScript.Spreadsheet.DataValidationBuilder;
  },
  newFilterCriteria: () => {
    return {} as GoogleAppsScript.Spreadsheet.FilterCriteriaBuilder;
  },
  newRichTextValue: () => {
    return {} as GoogleAppsScript.Spreadsheet.RichTextValueBuilder;
  },
  newTextStyle: () => {
    return {} as GoogleAppsScript.Spreadsheet.TextStyleBuilder;
  },
  open: (_file: GoogleAppsScript.Drive.File) => MockSpreadsheet,
  openById: (_id: string) => MockSpreadsheet,
  openByUrl: (_url: string) => MockSpreadsheet,
  setActiveRange: (_range: GoogleAppsScript.Spreadsheet.Range) => MockRange,
  setActiveRangeList: (_rangeList: GoogleAppsScript.Spreadsheet.RangeList) =>
    MockRangeList,
  setActiveSheet: (
    _sheet: GoogleAppsScript.Spreadsheet.Sheet,
    _restoreSelection?: boolean,
  ) => MockSheet,
  setActiveSpreadsheet: (
    _newActiveSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  ) => {},
  setCurrentCell: (_cell: GoogleAppsScript.Spreadsheet.Range) => MockRange,
} as GoogleAppsScript.Spreadsheet.SpreadsheetApp;
