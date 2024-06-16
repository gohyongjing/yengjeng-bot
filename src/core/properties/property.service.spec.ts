import { MockPropertiesService } from './PropertiesService.mock';
import { PropertyService } from './property.service';

describe('PropertyService', () => {
  let underTest: PropertyService;

  const properties = {
    keyA: 'valueA',
    keyB: 'valueB',
  };

  beforeAll(() => {
    global.PropertiesService = MockPropertiesService;
    MockPropertiesService.getScriptProperties().setProperties(properties);
  });

  beforeEach(() => {
    underTest = new PropertyService();
  });

  describe('get', () => {
    describe('when the property is defined', () => {
      it.each(Object.keys(properties))(
        'should return the value of the variable called %s',
        (key) => {
          const entry = Object.entries(properties).find(
            (entry) => entry[0] === key,
          );
          const expected = entry ? entry[1] : null;

          const actual = underTest.get(key);

          expect(actual).toEqual(expected);
        },
      );
    });

    describe('when the environment variable is not defined', () => {
      it('should return an undefined', () => {
        const actual = underTest.get('NOT_DEFINED_VARIABLE');

        expect(actual).toBeNull();
      });
    });
  });
});
