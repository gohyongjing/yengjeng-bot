export class PropertyService {
  get(key: string): string | null {
    return PropertiesService.getScriptProperties().getProperty(key);
  }
}
