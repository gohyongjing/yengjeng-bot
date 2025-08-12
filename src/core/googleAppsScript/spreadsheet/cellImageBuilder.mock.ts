import { MockCellImage } from './cellImage.mock';

export const MockCellImageBuilder: GoogleAppsScript.Spreadsheet.CellImageBuilder =
  {
    build: () => MockCellImage,
    getAltTextDescription: () => '',
    getAltTextTitle: () => '',
    getContentUrl: () => '',
    getUrl: () => null,
    setAltTextDescription: (_description: string) => MockCellImageBuilder,
    setAltTextTitle: (_title: string) => MockCellImageBuilder,
    setSourceUrl: (_url: string) => MockCellImageBuilder,
    toBuilder: () => MockCellImageBuilder,
  } as GoogleAppsScript.Spreadsheet.CellImageBuilder;
