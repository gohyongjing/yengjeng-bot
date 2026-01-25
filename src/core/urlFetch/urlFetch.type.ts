export type Options = {
  headers?: { [key: string]: string };
  method?: GoogleAppsScript.URL_Fetch.HttpMethod;
  payload?: string | { [key: string]: unknown };
  contentType?: string;
};

export type Response = {
  getContentText: () => string;
};
