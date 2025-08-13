import {
  MockGoogleAppsScript,
  MockLogger,
  MockSpreadsheetApp,
  MockUrlFetchApp,
} from '../src/core/googleAppsScript';

global.GoogleAppsScript = MockGoogleAppsScript;
global.Logger = MockLogger;
global.SpreadsheetApp = MockSpreadsheetApp;
global.UrlFetchApp = MockUrlFetchApp;
