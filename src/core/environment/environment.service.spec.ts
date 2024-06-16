import { EnvironmentService } from './environment.service';

describe('EnvironmentService', () => {
  const originalEnv = process.env;

  let underTest: EnvironmentService;

  beforeEach(() => {
    underTest = new EnvironmentService();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('get', () => {
    describe('when the environment variable is defined', () => {
      const environment = {
        keyA: 'valueA',
        keyB: 'valueB',
      };

      beforeEach(() => {
        process.env = environment;
      });

      it.each(Object.keys(environment) as (keyof typeof environment)[])(
        'should return the value of the variable called %s',
        (key) => {
          const expected = environment[key];

          const actual = underTest.get(key);

          expect(actual).toEqual(expected);
        },
      );
    });

    describe('when the environment variable is not defined', () => {
      beforeEach(() => {
        process.env = {};
      });

      it('should return null', () => {
        const actual = underTest.get('NOT_DEFINED_VARIABLE');

        expect(actual).toBeNull();
      });
    });
  });
});
