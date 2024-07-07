import { Result } from '@core/util/result';
import { Options, Response } from './urlFetch.type';

export const UrlFetchService: {
  fetch: (url: string, params?: Options) => Result<Response, Response>;
} = {
  fetch: (url: string, params: Options = {}) => {
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      ...params,
      muteHttpExceptions: true,
    };
    const response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() === 200) {
      return { Ok: response };
    }
    return { Err: response };
  },
} as const;
