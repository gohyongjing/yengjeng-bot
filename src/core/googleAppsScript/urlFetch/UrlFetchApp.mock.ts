import { MockHTTPResponse } from './HTTPResponse.mock';
import { MockUrlFetchRequest } from './UrlFetchRequest.mock';

export const MockUrlFetchApp: GoogleAppsScript.URL_Fetch.UrlFetchApp = {
  fetch: () => {
    return MockHTTPResponse;
  },
  fetchAll: () => [],
  getRequest: () => MockUrlFetchRequest,
};
