import { Builder } from './builder.util';

describe('Builder', () => {
  const defaultCustomObject = {
    id: '12345',
    name: 'cool thing',
    description: 'A cool custom object',
  };

  let underTest: Builder<typeof defaultCustomObject>;

  beforeEach(() => {
    underTest = new Builder(defaultCustomObject);
  });

  describe('with', () => {
    describe('when fields are specified', () => {
      it('should replace the fields specified', () => {
        const expected = {
          id: defaultCustomObject.id,
          name: 'New name',
          description: 'Object with new description',
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
});
