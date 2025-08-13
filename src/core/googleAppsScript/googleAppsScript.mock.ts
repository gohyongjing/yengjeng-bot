export const MockGoogleAppsScript: typeof GoogleAppsScript = {
  Spreadsheet: {
    Dimension: {
      ROWS: 'ROWS',
      COLUMNS: 'COLUMNS',
    },
  },
  URL_Fetch: {
    UrlFetchApp: {
      fetch: jest.fn(),
      fetchAll: jest.fn(),
      getRequest: jest.fn(),
    },
  },
} as unknown as typeof GoogleAppsScript;
