/**
 * Types taken from the description at https://developers.google.com/apps-script/guides/web#request_parameters
 */

export type WebAppEvent = {
  queryString: string | null;
  parameter: { [key: string]: string };
  parameters: { [key: string]: string[] };
  pathInfo: string;
  contextPath: '';
  contentLength: number;
  postData: WebAppPostData;
};

export type WebAppPostData = {
  length: number;
  type: string;
  contents: string;
  name: 'postData';
};
