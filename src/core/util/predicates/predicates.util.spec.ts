import { hasKey, isObject } from './predicates.util';

describe('predicates', () => {
  describe('isObject', () => {
    describe('object given', () => {
      it('should return true', () => {
        const objects = [
          {},
          { key: 'value' },
          {
            key2: 'value2',
            key3: 3,
          },
        ];
        for (const obj of objects) {
          const actual = isObject(obj);
          expect(actual).toBeTruthy();
        }
      });
    });

    describe('non-object given', () => {
      it('should return false', () => {
        const nonObjects = [1, -2, 'a', '{abc: 123}', [], [{ def: 456 }]];
        for (const obj of nonObjects) {
          const actual = isObject(obj);
          expect(actual).toBeFalsy();
        }
      });
    });
  });

  describe('hasKey', () => {
    describe('object contains key', () => {
      it('should return true', () => {
        const objects = [
          { key: 'value' },
          {
            key: 'value2',
            key3: 3,
          },
          {
            key: false,
            key5: [],
          },
        ];
        for (const obj of objects) {
          const actual = hasKey(obj, 'key');
          expect(actual).toBeTruthy();
        }
      });
    });

    describe('non-object given', () => {
      it('should return false', () => {
        const nonObjects = [1, -2, 'a', '{key: 123}', [], [{ key: 456 }]];
        for (const obj of nonObjects) {
          const actual = hasKey(obj, 'key');
          expect(actual).toBeFalsy();
        }
      });
    });

    describe('object given does not have specified key', () => {
      it('should return false', () => {
        const objects = [
          {},
          { notkey: 1 },
          {
            key2: 'key',
            key3: 123,
          },
          { key4: ['key'] },
          { key5: { key: 456 } },
        ];
        for (const obj of objects) {
          const actual = hasKey(obj, 'key');
          expect(actual).toBeFalsy();
        }
      });
    });
  });
});
