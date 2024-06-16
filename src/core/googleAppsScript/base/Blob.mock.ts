export const MockBlob: GoogleAppsScript.Base.Blob = {
  copyBlob: () => MockBlob,
  getAs: (_contentType: string) => MockBlob,
  getBlob: () => MockBlob,
  getBytes: () => [],
  getContentType: () => null,
  getDataAsString: () => '',
  getName: () => '',
  isGoogleType: () => false,
  setBytes: () => MockBlob,
  setContentType: () => MockBlob,
  setContentTypeFromExtension: () => MockBlob,
  setDataFromString: () => MockBlob,
  setName: () => MockBlob,
  getAllBlobs: () => [],
};
