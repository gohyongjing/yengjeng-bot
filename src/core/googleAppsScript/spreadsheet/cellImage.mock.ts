import { MockCellImageBuilder } from './cellImageBuilder.mock';

export const MockCellImage: GoogleAppsScript.Spreadsheet.CellImage = {
  getAltTextDescription: () => '',
  getAltTextTitle: () => '',
  getContentUrl: () => '',
  getUrl: () => null,
  toBuilder: () => MockCellImageBuilder,
} as GoogleAppsScript.Spreadsheet.CellImage;
