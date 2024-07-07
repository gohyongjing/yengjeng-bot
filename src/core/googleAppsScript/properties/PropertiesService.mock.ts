function getProperties(properties: { [key: string]: string }) {
  const result = {
    getProperty: (key: string): string | null => {
      const entry = Object.entries(properties).find(
        (entry) => entry[0] === key,
      );
      return entry ? entry[1] : null;
    },
    deleteAllProperties: () => result,
    deleteProperty: (key: string) => {
      delete properties[key];
      return result;
    },
    getKeys: () => [],
    getProperties: () => {
      return {};
    },
    setProperties: (newProperties: { [key: string]: string }) => {
      for (const key of Object.keys(newProperties)) {
        properties[key] = newProperties[key];
      }
      return result;
    },
    setProperty: (key: string, value: string) => {
      properties[key] = value;
      return result;
    },
  };
  return result;
}

const scriptProperties: { [key: string]: string } = {};
const documentProperties: { [key: string]: string } = {};
const userProperties: { [key: string]: string } = {};

const getScriptProperties = jest.fn(() => getProperties(scriptProperties));
const getDocumentProperties = jest.fn(() => getProperties(documentProperties));
const getUserProperties = jest.fn(() => getProperties(userProperties));

export const MockPropertiesService: GoogleAppsScript.Properties.PropertiesService =
  {
    getScriptProperties,
    getDocumentProperties,
    getUserProperties,
  };
