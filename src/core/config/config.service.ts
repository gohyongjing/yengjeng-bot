import { EnvironmentService } from '@core/environment';
import { PropertyService } from '@core/properties';

export class ConfigService<T> {
  private ERR_NO_CONFIG =
    'Both environment variables and property service not found. Please set process.env' +
    ".ENV to 'DEV' or GoogleAppsScript.PropertiesService.ScriptService.ENV to PROD";
  private propertyService: PropertyService;
  private environmentService: EnvironmentService;
  private env: 'dev' | 'prod';

  constructor() {
    this.propertyService = new PropertyService();
    this.environmentService = new EnvironmentService();
    this.env = this.getEnvironment();
  }

  getEnvironment(): 'dev' | 'prod' {
    try {
      process;
    } catch {
      try {
        PropertiesService;
      } catch (e) {
        console.error(this.ERR_NO_CONFIG);
        throw e;
      }
      return 'prod';
    }
    return 'dev';
  }

  get<Key extends keyof T>(key: Key): string {
    let result: string | null;
    if (this.env === 'dev') {
      result = this.environmentService.get(key.toString());
    } else {
      result = this.propertyService.get(key.toString());
    }
    if (result === null) {
      throw `Config variable ${key.toString()} not found.`;
    }
    return result;
  }
}
