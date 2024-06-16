import { EnvironmentService } from '@core/environment';
import { PropertyService } from '@core/properties';

export class ConfigService<T> {
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
        console.log(
          "Both environment variables and property service not found. Please set process.env.ENV to 'DEV' or GoogleAppsScript.PropertiesService.ScriptService.ENV to PROD",
        );
        throw e;
      }
      if (this.propertyService.get('ENV') !== null) {
        this.env = 'prod';
      } else {
        throw "Both environment variables and property service not found. Please set process.env.ENV to 'DEV' or GoogleAppsScript.PropertiesService.ScriptService.ENV to PROD";
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
