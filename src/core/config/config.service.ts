import { EnvironmentService } from '@core/environment';
import { PropertyService } from '@core/properties';

export class ConfigService<T> {
  private ERR_NO_CONFIG =
    'Both environment variables and property service not found. Please set process.env' +
    ".ENV to 'DEV' or GoogleAppsScript.PropertiesService.ScriptService.ENV to PROD";
  private propertyService: PropertyService;
  private environmentService: EnvironmentService;
  env: 'dev' | 'prod';

  constructor() {
    this.propertyService = new PropertyService();
    this.environmentService = new EnvironmentService();

    if (this.environmentService.get('ENV') !== null) {
      this.env = 'dev';
    } else {
      try {
        PropertiesService;
      } catch (e) {
        console.error(this.ERR_NO_CONFIG);
        throw e;
      }
      if (this.propertyService.get('ENV') !== null) {
        this.env = 'prod';
      } else {
        throw this.ERR_NO_CONFIG;
      }
    }
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
