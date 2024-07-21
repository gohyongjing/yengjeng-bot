import { Builder } from './builder.util';

describe('Builder', () => {
  const defaultCustomObject: {
    id: string;
    name: string;
    description: string;
    optionalField?: number;
  } = {
    id: '12345',
    name: 'cool thing',
    description: 'A cool custom object',
    optionalField: 789,
  };

  let underTest: Builder<typeof defaultCustomObject>;

  beforeEach(() => {
    underTest = new Builder(defaultCustomObject);
  });

  describe('with', () => {
    describe('when fields are specified', () => {
      it('should replace the specified fields', () => {
        const expected = {
          id: defaultCustomObject.id,
          name: 'New name',
          description: 'Object with new description',
          optionalField: defaultCustomObject.optionalField,
        };
        const actual = underTest
          .with({
            name: expected.name,
            description: expected.description,
          })
          .build();

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('without', () => {
    describe('when keys are specified', () => {
      it('should omit the specified keys', () => {
        const expected = {
          id: defaultCustomObject.id,
          name: defaultCustomObject.name,
          description: defaultCustomObject.description,
        };
        const actual = underTest.without(['optionalField']).build();

        expect(actual).toEqual(expected);
      });
    });
  });
});
