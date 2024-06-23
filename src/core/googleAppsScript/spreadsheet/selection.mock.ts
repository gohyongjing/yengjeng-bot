import { MockSheet } from './sheet.mock';

export const MockSelection: GoogleAppsScript.Spreadsheet.Selection = {
  getActiveRange: () => null,
  getActiveRangeList: () => null,
  getActiveSheet: () => MockSheet,
  getCurrentCell: () => null,
  getNextDataRange: (_direction: GoogleAppsScript.Spreadsheet.Direction) =>
    null,
};
