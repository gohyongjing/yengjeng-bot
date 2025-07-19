import { MockDeveloperMetadataFinder } from './developerMetadataFinder.mock';
import { MockRange } from './range.mock';
import { MockRangeList } from './rangeList.mock';
import { MockSelection } from './selection.mock';
import { MockSpreadsheet } from './spreadsheet.mock';
import { MockTextFinder } from './textFinder.mock';

export const appendRow = jest.fn((_rowContents: unknown[]) => {
  return MockSheet;
});

export const MockSheet: GoogleAppsScript.Spreadsheet.Sheet = {
  activate: () => MockSheet,
  addDeveloperMetadata: (
    _key: string,
    _visibilityOrValue?:
      | GoogleAppsScript.Spreadsheet.DeveloperMetadataVisibility
      | string,
    _visibility?: GoogleAppsScript.Spreadsheet.DeveloperMetadataVisibility,
  ) => MockSheet,
  appendRow,
  asDataSourceSheet: () => {
    return null;
  },
  autoResizeColumn: (_columnPosition: GoogleAppsScript.Integer) => MockSheet,
  autoResizeColumns: (
    _startColumn: GoogleAppsScript.Integer,
    _numColumns: GoogleAppsScript.Integer,
  ) => MockSheet,
  autoResizeRows: (
    _startRow: GoogleAppsScript.Integer,
    _numRows: GoogleAppsScript.Integer,
  ) => MockSheet,
  clear: (_options?: {
    formatOnly?: boolean | undefined;
    contentsOnly?: boolean | undefined;
  }) => MockSheet,
  clearConditionalFormatRules: () => {},
  clearContents: () => MockSheet,
  clearFormats: () => MockSheet,
  clearNotes: () => MockSheet,
  collapseAllColumnGroups: () => MockSheet,
  collapseAllRowGroups: () => MockSheet,
  copyTo: (_spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet) => MockSheet,
  createDeveloperMetadataFinder: () => MockDeveloperMetadataFinder,
  createTextFinder: (_findText: string) => MockTextFinder,
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
  expandAllColumnGroups: () => MockSheet,
  expandAllRowGroups: () => MockSheet,
  expandColumnGroupsUpToDepth: (_groupDepth: GoogleAppsScript.Integer) =>
    MockSheet,
  expandRowGroupsUpToDepth: (_groupDepth: GoogleAppsScript.Integer) =>
    MockSheet,
  getActiveCell: () => MockRange,
  getActiveRange: () => null,
  getActiveRangeList: () => null,
  getBandings: () => [],
  getCharts: () => [],
  getColumnGroup: (
    _columnIndex: GoogleAppsScript.Integer,
    _groupDepth: GoogleAppsScript.Integer,
  ) => null,
  getColumnGroupControlPosition: () =>
    GoogleAppsScript.Spreadsheet.GroupControlTogglePosition.BEFORE,
  getColumnGroupDepth: (_columnIndex: GoogleAppsScript.Integer) => 0,
  getColumnWidth: (_columnPosition: GoogleAppsScript.Integer) => 0,
  getConditionalFormatRules: () => [],
  getCurrentCell: () => null,
  getDataRange: () => MockRange,
  getDataSourceTables: () => [],
  getDeveloperMetadata: () => [],
  getDrawings: () => [],
  getFilter: () => null,
  getFormUrl: () => null,
  getFrozenColumns: () => 0,
  getFrozenRows: () => 0,
  getImages: () => [],
  getIndex: () => 0,
  getLastColumn: () => 0,
  getLastRow: () => 0,
  getMaxColumns: () => 0,
  getMaxRows: () => 0,
  getName: () => '',
  getNamedRanges: () => [],
  getParent: () => MockSpreadsheet,
  getPivotTables: () => [],
  getProtections: (_type: GoogleAppsScript.Spreadsheet.ProtectionType) => [],
  getRange: (
    _rowOrA1Notation: GoogleAppsScript.Integer | string,
    _column?: GoogleAppsScript.Integer,
    _numRows?: GoogleAppsScript.Integer,
  ) => MockRange,
  getRangeList: (_a1Notations: string[]) => MockRangeList,
  getRowGroup: (
    _rowIndex: GoogleAppsScript.Integer,
    _groupDepth: GoogleAppsScript.Integer,
  ) => null,
  getRowGroupControlPosition: () => {
    return {} as GoogleAppsScript.Spreadsheet.GroupControlTogglePosition;
  },
  getRowGroupDepth: (_rowIndex: GoogleAppsScript.Integer) => 0,
  getRowHeight: (_rowPosition: GoogleAppsScript.Integer) => 0,
  getSelection: () => MockSelection,
  getSheetId: () => 0,
  getSheetName: () => '',
  getSheetValues: (
    _startRow: GoogleAppsScript.Integer,
    _startColumn: GoogleAppsScript.Integer,
    _numRows: GoogleAppsScript.Integer,
    _numColumns: GoogleAppsScript.Integer,
  ) => [],
  getSlicers: () => [],
  getTabColor: () => null,
  getType: () => {
    return {} as GoogleAppsScript.Spreadsheet.SheetType;
  },
  hasHiddenGridlines: () => false,
  hideColumn: (_column: GoogleAppsScript.Spreadsheet.Range) => {},
  hideColumns: (
    _columnIndex: GoogleAppsScript.Integer,
    _numColumns?: GoogleAppsScript.Integer,
  ) => {},
  hideRow: (_row: GoogleAppsScript.Spreadsheet.Range) => {},
  hideRows: (
    _rowIndex: GoogleAppsScript.Integer,
    _numRows?: GoogleAppsScript.Integer,
  ) => {},
  hideSheet: () => MockSheet,
  insertChart: (_chart: GoogleAppsScript.Spreadsheet.EmbeddedChart) => {},
  insertColumnAfter: (_afterPosition: GoogleAppsScript.Integer) => MockSheet,
  insertColumnBefore: (_beforePosition: GoogleAppsScript.Integer) => MockSheet,
  insertColumns: (
    _columnIndex: GoogleAppsScript.Integer,
    _numColumns?: GoogleAppsScript.Integer,
  ) => {},
  insertColumnsAfter: (
    _afterPosition: GoogleAppsScript.Integer,
    _howMany: GoogleAppsScript.Integer,
  ) => MockSheet,
  insertColumnsBefore: (
    _beforePosition: GoogleAppsScript.Integer,
    _howMany: GoogleAppsScript.Integer,
  ) => MockSheet,
  insertImage: (
    _blobSourceOrUrl: GoogleAppsScript.Base.BlobSource | string,
    _column: GoogleAppsScript.Integer,
    _row: GoogleAppsScript.Integer,
    _offsetX?: GoogleAppsScript.Integer,
    _offsetY?: GoogleAppsScript.Integer,
  ) => {
    return {} as GoogleAppsScript.Spreadsheet.OverGridImage;
  },
  insertRowAfter: (_afterPosition: GoogleAppsScript.Integer) => MockSheet,
  insertRowBefore: (_beforePosition: GoogleAppsScript.Integer) => MockSheet,
  insertRows: (
    _rowIndex: GoogleAppsScript.Integer,
    _numRows?: GoogleAppsScript.Integer,
  ) => {},
  insertRowsAfter: (
    _afterPosition: GoogleAppsScript.Integer,
    _howMany: GoogleAppsScript.Integer,
  ) => MockSheet,
  insertRowsBefore: (
    _beforePosition: GoogleAppsScript.Integer,
    _howMany: GoogleAppsScript.Integer,
  ) => MockSheet,
  insertSlicer: (
    _range: GoogleAppsScript.Spreadsheet.Range,
    _anchorRowPos: GoogleAppsScript.Integer,
    _anchorColPos: GoogleAppsScript.Integer,
    _offsetX?: GoogleAppsScript.Integer,
    _offsetY?: GoogleAppsScript.Integer,
  ) => {
    return {} as GoogleAppsScript.Spreadsheet.Slicer;
  },
  isColumnHiddenByUser: (_columnPosition: GoogleAppsScript.Integer) => false,
  isRightToLeft: () => false,
  isRowHiddenByFilter: (_rowPosition: GoogleAppsScript.Integer) => false,
  isRowHiddenByUser: (_rowPosition: GoogleAppsScript.Integer) => false,
  isSheetHidden: () => false,
  moveColumns: (
    _columnSpec: GoogleAppsScript.Spreadsheet.Range,
    _destinationIndex: GoogleAppsScript.Integer,
  ) => {},
  moveRows: (
    _rowSpec: GoogleAppsScript.Spreadsheet.Range,
    _destinationIndex: GoogleAppsScript.Integer,
  ) => {},
  newChart: () => {
    return {} as GoogleAppsScript.Spreadsheet.EmbeddedChartBuilder;
  },
  protect: () => {
    return {} as GoogleAppsScript.Spreadsheet.Protection;
  },
  removeChart: (_chart: GoogleAppsScript.Spreadsheet.EmbeddedChart) => {},
  setActiveRange: (_range: GoogleAppsScript.Spreadsheet.Range) => MockRange,
  setActiveRangeList: (_rangeList: GoogleAppsScript.Spreadsheet.RangeList) =>
    MockRangeList,
  setActiveSelection: (
    _rangeOrA1Notation: GoogleAppsScript.Spreadsheet.Range | string,
  ) => MockRange,
  setColumnGroupControlPosition: (
    _position: GoogleAppsScript.Spreadsheet.GroupControlTogglePosition,
  ) => MockSheet,
  setColumnWidth: (
    _columnPosition: GoogleAppsScript.Integer,
    _width: GoogleAppsScript.Integer,
  ) => MockSheet,
  setColumnWidths: (
    _startColumn: GoogleAppsScript.Integer,
    _numColumns: GoogleAppsScript.Integer,
    _width: GoogleAppsScript.Integer,
  ) => MockSheet,
  setConditionalFormatRules: (
    _rules: GoogleAppsScript.Spreadsheet.ConditionalFormatRule[],
  ) => {},
  setCurrentCell: (_cell: GoogleAppsScript.Spreadsheet.Range) => MockRange,
  setFrozenColumns: (_columns: GoogleAppsScript.Integer) => {},
  setFrozenRows: (_rows: GoogleAppsScript.Integer) => {},
  setHiddenGridlines: (_hideGridlines: boolean) => MockSheet,
  setName: (_name: string) => MockSheet,
  setRightToLeft: (_rightToLeft: boolean) => MockSheet,
  setRowGroupControlPosition: (
    _position: GoogleAppsScript.Spreadsheet.GroupControlTogglePosition,
  ) => MockSheet,
  setRowHeight: (
    _rowPosition: GoogleAppsScript.Integer,
    _height: GoogleAppsScript.Integer,
  ) => MockSheet,
  setRowHeights: (
    _startRow: GoogleAppsScript.Integer,
    _numRows: GoogleAppsScript.Integer,
    _height: GoogleAppsScript.Integer,
  ) => MockSheet,
  setRowHeightsForced: (
    _startRow: GoogleAppsScript.Integer,
    _numRows: GoogleAppsScript.Integer,
    _height: GoogleAppsScript.Integer,
  ) => MockSheet,
  setTabColor: (_color: string | null) => MockSheet,
  showColumns: (
    _columnIndex: GoogleAppsScript.Integer,
    _numColumns?: GoogleAppsScript.Integer,
  ) => {},
  showRows: (
    _rowIndex: GoogleAppsScript.Integer,
    _numRows?: GoogleAppsScript.Integer,
  ) => {},
  showSheet: () => MockSheet,
  sort: (_columnPosition: GoogleAppsScript.Integer, _ascending?: boolean) =>
    MockSheet,
  unhideColumn: (_column: GoogleAppsScript.Spreadsheet.Range) => {},
  unhideRow: (_row: GoogleAppsScript.Spreadsheet.Range) => {},
  updateChart: (_chart: GoogleAppsScript.Spreadsheet.EmbeddedChart) => {},
  getSheetProtection: () => {
    return {} as GoogleAppsScript.Spreadsheet.PageProtection;
  },
  setSheetProtection: (
    _permissions: GoogleAppsScript.Spreadsheet.PageProtection,
  ) => {},
};
