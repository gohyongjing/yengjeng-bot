import { MockPropertiesService } from '@core/googleAppsScript';
import { ConfigService } from './config.service';

describe('PropertyService', () => {
  describe('get', () => {
    type Properties = {
      keyA: string;
      keyB: string;
      keyC: string;
      keyD: string;
      keyE: string;
    };

    let underTest: ConfigService<Properties>;

    describe('dotenv', () => {
      const properties = {
        keyA: 'valueA',
        keyB: 'valueB',
      };

      beforeEach(() => {
        process.env = properties;
        underTest = new ConfigService();
      });

      describe('when the variable is defined', () => {
        it.each(Object.keys(properties))(
          'should return the value of the variable called %s',
          (rawKey) => {
            const key = rawKey as keyof typeof properties;
            const expected = properties[key];

            const actual = underTest.get(key);

            expect(actual).toEqual(expected);
          },
        );
      });

      describe('when the variable is not defined', () => {
        it('should fail fast and throw an exception', () => {
          expect(() => underTest.get('keyE')).toThrow();
        });
      });
    });

    describe('PropertiesService', () => {
      let originalProcess = process;
      const properties = {
        keyC: 'valueC',
        keyD: 'valueD',
      };

      beforeAll(() => {
        global.PropertiesService = MockPropertiesService;
        MockPropertiesService.getScriptProperties().setProperties(properties);

        originalProcess = process;
        //@ts-ignore Allow deleting non-optional global variable for testing purposes
        delete global.process;
      });

      afterAll(() => {
        //@ts-ignore Allow deleting non-optional global variable for testing purposes
        delete global.PropertiesService;

        global.process = originalProcess;
      });

      beforeEach(() => {
        underTest = new ConfigService();
      });

      describe('when the property is defined', () => {
        it.each(Object.keys(properties))(
          'should return the value of the variable called %s',
          (rawKey) => {
            const key = rawKey as keyof typeof properties;
            const expected = properties[key];

            const actual = underTest.get(key);

            expect(actual).toEqual(expected);
          },
        );
      });

      describe('when the property is not defined', () => {
        it('should fail fast and throw an exception', () => {
          expect(() => underTest.get('keyE')).toThrow();
        });
      });
    });
  });
});
