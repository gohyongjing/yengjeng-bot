export const log = jest.fn((formatOrValue: unknown, ..._values: unknown[]) => {
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
