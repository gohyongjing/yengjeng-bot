export const MockTextFinder: GoogleAppsScript.Spreadsheet.TextFinder = {
  findAll: () => [],
  findNext: () => null,
  findPrevious: () => null,
  getCurrentMatch: () => null,
  ignoreDiacritics: (_ignoreDiacritics: boolean) => MockTextFinder,
  matchCase: (_matchCase: boolean) => MockTextFinder,
  matchEntireCell: (_matchEntireCell: boolean) => MockTextFinder,
  matchFormulaText: (_matchFormulaText: boolean) => MockTextFinder,
  replaceAllWith: (_replaceText: string) => 0,
  replaceWith: (_replaceText: string) => 0,
  startFrom: (_startRange: GoogleAppsScript.Spreadsheet.Range) =>
    MockTextFinder,
  useRegularExpression: (_useRegEx: boolean) => MockTextFinder,
};
