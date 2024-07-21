export const log = jest.fn((formatOrValue: any | string, ..._values: any[]) => {
  if (typeof formatOrValue === 'string') {
    console.log(formatOrValue);
  }
  return MockLogger;
});

export const MockLogger: GoogleAppsScript.Base.Logger = {
  clear: () => {},
  getLog: () => '',
  log,
};
