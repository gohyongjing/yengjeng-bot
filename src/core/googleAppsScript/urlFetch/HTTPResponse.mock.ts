import { MockBlob } from '../base';

export const MockHTTPResponse: GoogleAppsScript.URL_Fetch.HTTPResponse = {
  getAllHeaders: () => {
    return {};
  },
  getAs: (_contentType: string) => MockBlob,
  getBlob: () => MockBlob,
  getContent: () => [],
  getContentText: () => '',
  getHeaders: () => [],
  getResponseCode: () => 0,
};
