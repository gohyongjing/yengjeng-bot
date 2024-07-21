import { MockHTTPResponse } from './httpResponse.mock';
import { MockUrlFetchRequest } from './urlFetchRequest.mock';

export const MockUrlFetchApp: GoogleAppsScript.URL_Fetch.UrlFetchApp = {
  fetch: () => {
    return MockHTTPResponse;
  },
  fetchAll: () => [],
  getRequest: () => MockUrlFetchRequest,
};
