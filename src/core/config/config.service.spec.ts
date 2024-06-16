import { MockPropertiesService } from '@core/properties';
import { ConfigService } from './config.service';

describe('PropertyService', () => {
  describe('get', () => {
    type Properties = {
      ENV: string;
      keyA: string;
      keyB: string;
      keyC: string;
      keyD: string;
      keyE: string;
    };

    let underTest: ConfigService<Properties>;

    describe('dotenv', () => {
      const originalEnv = process.env;

      const properties = {
        ENV: 'dev',
        keyA: 'valueA',
        keyB: 'valueB',
      };

      beforeEach(() => {
        process.env = properties;
        underTest = new ConfigService();
      });

      afterEach(() => {
        process.env = originalEnv;
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

      describe('when the property is no defined', () => {
        it('should fail fast and throw an exception', () => {
          expect(() => underTest.get('keyE')).toThrow();
        });
      });
    });

    describe('PropertiesService', () => {
      const properties = {
        ENV: 'dev',
        keyC: 'valueC',
        keyD: 'valueD',
      };

      beforeEach(() => {
        global.PropertiesService = MockPropertiesService;
        MockPropertiesService.getScriptProperties().setProperties(properties);
        underTest = new ConfigService();
      });

      afterEach(() => {
        //@ts-ignore Allow deleting non-optional global variable for testing purposes
        delete global.PropertiesService;
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

      describe('when the property is no defined', () => {
        it('should fail fast and throw an exception', () => {
          expect(() => underTest.get('keyE')).toThrow();
        });
      });
    });

    describe('no environment set up', () => {
      it('should fail fast and throw an exception', () => {
        expect(() => {
          const service = new ConfigService();
          console.log(`TYPE: ${service.env}`);
        }).toThrow();
      });
    });
  });
});
