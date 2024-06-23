export const MockDeveloperMetadataFinder: GoogleAppsScript.Spreadsheet.DeveloperMetadataFinder =
  {
    find: () => [],
    onIntersectingLocations: () => MockDeveloperMetadataFinder,
    withId: (_id: GoogleAppsScript.Integer) => MockDeveloperMetadataFinder,
    withKey: (_key: string) => MockDeveloperMetadataFinder,
    withLocationType: (
      _locationType: GoogleAppsScript.Spreadsheet.DeveloperMetadataLocationType,
    ) => MockDeveloperMetadataFinder,
    withValue: (_value: string) => MockDeveloperMetadataFinder,
    withVisibility: (
      _visibility: GoogleAppsScript.Spreadsheet.DeveloperMetadataVisibility,
    ) => MockDeveloperMetadataFinder,
  };
