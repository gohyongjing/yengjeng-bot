import { MockBlob } from '../base';
import { MockDeveloperMetadataFinder } from './developerMetadataFinder.mock';
import { MockRange } from './range.mock';
import { MockRangeList } from './rangeList.mock';
import { MockSelection } from './selection.mock';
import { MockSheet } from './sheet.mock';
import { MockTextFinder } from './textFinder.mock';

export const MockSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet = {
  addDeveloperMetadata: (
    _key: string,
    _visibilityOrValue?:
      | GoogleAppsScript.Spreadsheet.DeveloperMetadataVisibility
      | string,
    _visibility?: GoogleAppsScript.Spreadsheet.DeveloperMetadataVisibility,
  ) => MockSpreadsheet,
  addEditor: (_emailAddressOrUser: string | GoogleAppsScript.Base.User) =>
    MockSpreadsheet,
  addEditors: (_emailAddresses: string[]) => MockSpreadsheet,
  addMenu: (
    _name: string,
    _subMenus: ({ name: string; functionName: string } | null)[],
  ) => {},
  addViewer: (_emailAddressOrUser: string | GoogleAppsScript.Base.User) =>
    MockSpreadsheet,
  addViewers: (_emailAddresses: string[]) => MockSpreadsheet,
  appendRow: (_rowContents: unknown[]) => MockSheet,
  autoResizeColumn: (_columnPosition: GoogleAppsScript.Integer) => MockSheet,
  copy: (_name: string) => MockSpreadsheet,
  createDeveloperMetadataFinder: () => MockDeveloperMetadataFinder,
  createTextFinder: (_findText: string) => MockTextFinder,
  deleteActiveSheet: () => MockSheet,
  deleteColumn: (_columnPosition: GoogleAppsScript.Integer) => MockSheet,
  deleteColumns: (
    _columnPosition: GoogleAppsScript.Integer,
    _howMany: GoogleAppsScript.Integer,
  ) => {},
  deleteRow: (_rowPosition: GoogleAppsScript.Integer) => MockSheet,
  deleteRows: (
    _rowPosition: GoogleAppsScript.Integer,
    _howMany: GoogleAppsScript.Integer,
  ) => {},
  deleteSheet: (_sheet: GoogleAppsScript.Spreadsheet.Sheet) => {},
  duplicateActiveSheet: () => MockSheet,
  getActiveCell: () => MockRange,
  getActiveRange: () => null,
  getActiveRangeList: () => null,
  getActiveSheet: () => MockSheet,
  getAs: (_contentType: string) => MockBlob,
  getBandings: () => [],
  getBlob: () => MockBlob,
  getColumnWidth: (_columnPosition: GoogleAppsScript.Integer) => 0,
  getCurrentCell: () => null,
  getDataRange: () => MockRange,
  getDataSourceTables: () => [],
  getDeveloperMetadata: () => [],
  getEditors: () => [],
  getFormUrl: () => null,
  getFrozenColumns: () => 0,
  getFrozenRows: () => 0,
  getId: () => '',
  getImages: () => [],
  getIterativeCalculationConvergenceThreshold: () => 0,
  getLastColumn: () => 0,
  getLastRow: () => 0,
  getMaxIterativeCalculationCycles: () => 0,
  getName: () => '',
  getNamedRanges: () => [],
  getNumSheets: () => 0,
  getOwner: () => null,
  getPredefinedSpreadsheetThemes: () => [],
  getProtections: (_type: GoogleAppsScript.Spreadsheet.ProtectionType) => [],
  getRange: (_a1Notation: string) => MockRange,
  getRangeByName: (_name: string) => null,
  getRangeList: (_a1Notations: string[]) => MockRangeList,
  getRecalculationInterval: () => {
    return {} as GoogleAppsScript.Spreadsheet.RecalculationInterval;
  },
  getRowHeight: (_rowPosition: GoogleAppsScript.Integer) => 0,
  getSelection: () => MockSelection,
  getSheetByName: (_name: string) => null,
  getSheetById: (_id: GoogleAppsScript.Integer) => MockSheet,
  getSheetId: () => 0,
  getSheetName: () => '',
  getSheetValues: (
    _startRow: GoogleAppsScript.Integer,
    _startColumn: GoogleAppsScript.Integer,
    _numRows: GoogleAppsScript.Integer,
    _numColumns: GoogleAppsScript.Integer,
  ) => [],
  getSheets: () => [MockSheet, MockSheet],
  getSpreadsheetLocale: () => '',
  getSpreadsheetTheme: () => null,
  getSpreadsheetTimeZone: () => '',
  getUrl: () => '',
  getViewers: () => [],
  hideColumn: (_column: GoogleAppsScript.Spreadsheet.Range) => {},
  hideRow: (_row: GoogleAppsScript.Spreadsheet.Range) => {},
  insertColumnAfter: (_afterPosition: GoogleAppsScript.Integer) => MockSheet,
  insertColumnBefore: (_beforePosition: GoogleAppsScript.Integer) => MockSheet,
  insertColumnsAfter: (
    _afterPosition: GoogleAppsScript.Integer,
    _howMany: GoogleAppsScript.Integer,
  ) => MockSheet,
  insertColumnsBefore: (
    _beforePosition: GoogleAppsScript.Integer,
    _howMany: GoogleAppsScript.Integer,
  ) => MockSheet,
  insertImage: (
    _blobSourceOrurl?: GoogleAppsScript.Base.BlobSource | string,
    _column?: GoogleAppsScript.Integer,
    _row?: GoogleAppsScript.Integer,
    _offsetX?: GoogleAppsScript.Integer,
    _offsetY?: GoogleAppsScript.Integer,
  ) => {
    return {} as GoogleAppsScript.Spreadsheet.OverGridImage;
  },
  insertRowAfter: (_afterPosition: GoogleAppsScript.Integer) => MockSheet,
  insertRowBefore: (_beforePosition: GoogleAppsScript.Integer) => MockSheet,
  insertRowsAfter: (
    _afterPosition: GoogleAppsScript.Integer,
    _howMany: GoogleAppsScript.Integer,
  ) => MockSheet,
  insertRowsBefore: (
    _beforePosition: GoogleAppsScript.Integer,
    _howMany: GoogleAppsScript.Integer,
  ) => MockSheet,
  insertSheet: (
    _sheetIndexOrOptionsOrsheetName?:
      | GoogleAppsScript.Integer
      | { template?: GoogleAppsScript.Spreadsheet.Sheet | undefined }
      | string,
    _optionsOrSheetIndex?:
      | { template?: GoogleAppsScript.Spreadsheet.Sheet | undefined }
      | GoogleAppsScript.Integer,
    _options?: { template?: GoogleAppsScript.Spreadsheet.Sheet | undefined },
  ) => MockSheet,
  insertSheetWithDataSourceTable: (
    _spec: GoogleAppsScript.Spreadsheet.DataSourceSpec,
  ) => MockSheet,
  isColumnHiddenByUser: (_columnPosition: GoogleAppsScript.Integer) => false,
  isIterativeCalculationEnabled: () => false,
  isRowHiddenByFilter: (_rowPosition: GoogleAppsScript.Integer) => false,
  isRowHiddenByUser: (_rowPosition: GoogleAppsScript.Integer) => false,
  moveActiveSheet: (_pos: GoogleAppsScript.Integer) => {},
  moveChartToObjectSheet: (
    _chart: GoogleAppsScript.Spreadsheet.EmbeddedChart,
  ) => MockSheet,
  removeEditor: (_emailAddressOruser: string | GoogleAppsScript.Base.User) => {
    return MockSpreadsheet;
  },
  removeMenu: (_name: string) => {},
  removeNamedRange: (_name: string) => {},
  removeViewer: (_emailAddressOrUser: string | GoogleAppsScript.Base.User) => {
    return MockSpreadsheet;
  },
  rename: (_newName: string) => {},
  renameActiveSheet: (_newName: string) => {},
  resetSpreadsheetTheme: () => {
    return {} as GoogleAppsScript.Spreadsheet.SpreadsheetTheme;
  },
  setActiveRange: (_range: GoogleAppsScript.Spreadsheet.Range) => MockRange,
  setActiveRangeList: (_rangeList: GoogleAppsScript.Spreadsheet.RangeList) =>
    MockRangeList,
  setActiveSelection: (
    _rangeOrA1Notation: GoogleAppsScript.Spreadsheet.Range | string,
  ) => MockRange,
  setActiveSheet: (
    _sheet: GoogleAppsScript.Spreadsheet.Sheet,
    _restoreSelection?: boolean,
  ) => MockSheet,
  setColumnWidth: (
    _columnPosition: GoogleAppsScript.Integer,
    _width: GoogleAppsScript.Integer,
  ) => MockSheet,
  setCurrentCell: (_cell: GoogleAppsScript.Spreadsheet.Range) => MockRange,
  setFrozenColumns: (_columns: GoogleAppsScript.Integer) => {},
  setFrozenRows: (_rows: GoogleAppsScript.Integer) => {},
  setIterativeCalculationConvergenceThreshold: (_minThreshold: number) => {
    return MockSpreadsheet;
  },
  setIterativeCalculationEnabled: (_isEnabled: boolean) => {
    return MockSpreadsheet;
  },
  setMaxIterativeCalculationCycles: (
    _maxIterations: GoogleAppsScript.Integer,
  ) => {
    return MockSpreadsheet;
  },
  setNamedRange: (
    _name: string,
    _range: GoogleAppsScript.Spreadsheet.Range,
  ) => {},
  setRecalculationInterval: (
    _recalculationInterval: GoogleAppsScript.Spreadsheet.RecalculationInterval,
  ) => {
    return MockSpreadsheet;
  },
  setRowHeight: (
    _rowPosition: GoogleAppsScript.Integer,
    _height: GoogleAppsScript.Integer,
  ) => MockSheet,
  setSpreadsheetLocale: (_locale: string) => {},
  setSpreadsheetTheme: (
    _theme: GoogleAppsScript.Spreadsheet.SpreadsheetTheme,
  ) => {
    return {} as GoogleAppsScript.Spreadsheet.SpreadsheetTheme;
  },
  setSpreadsheetTimeZone: (_timezone: string) => {},
  show: (_userInterface: GoogleAppsScript.HTML.HtmlOutput) => {},
  sort: (_columnPosition: GoogleAppsScript.Integer, _ascending?: boolean) =>
    MockSheet,
  toast: (_msg: string, _title?: string, _timeoutSeconds?: number | null) => {},
  unhideColumn: (_column: GoogleAppsScript.Spreadsheet.Range) => {},
  unhideRow: (_row: GoogleAppsScript.Spreadsheet.Range) => {},
  updateMenu: (
    _name: string,
    _subMenus: { name: string; functionName: string }[],
  ) => {},
  getSheetProtection: () => {
    return {} as GoogleAppsScript.Spreadsheet.PageProtection;
  },
  isAnonymousView: () => false,
  isAnonymousWrite: () => false,
  setAnonymousAccess: () => {},
  setSheetProtection: (
    _permissions: GoogleAppsScript.Spreadsheet.PageProtection,
  ) => {},
};
