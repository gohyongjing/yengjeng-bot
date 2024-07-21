import { Parser } from './parser.util';

describe('Parser', () => {
  let underTest: Parser;

  beforeEach(() => {
    underTest = new Parser();
  });

  describe('tokenise', () => {
    describe('one token', () => {
      it.each(['abc', ' 123', 'ghi456  ', ' 789_ ', '--'])(
        'should return one token',
        (command) => {
          const actual = underTest.tokenise(command);

          expect(actual).toHaveLength(1);
          expect(actual[0]).toEqual(command.trim());
        },
      );
    });

    describe('two tokens', () => {
      it.each(['abc 123', '456  def', 'ghi456   789', ' _  --  '])(
        'should return two tokens',
        (command) => {
          const actual = underTest.tokenise(command);

          expect(actual).toHaveLength(2);
          expect(command.includes(actual[0])).toBeTruthy();
          expect(command.includes(actual[1])).toBeTruthy();
        },
      );
    });

    describe('three tokens', () => {
      it('should return three tokens', () => {
        const command = '  def   ghi4_56   --789 ';
        const expected = ['def', 'ghi4_56', '--789'];
        const actual = underTest.tokenise(command);

        expect(actual).toEqual(expected);
      });
    });
  });
});
