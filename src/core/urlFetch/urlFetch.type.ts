export type Options = {
  headers?: { [key: string]: string };
};

export type Response = {
  getContentText: () => string;
};
