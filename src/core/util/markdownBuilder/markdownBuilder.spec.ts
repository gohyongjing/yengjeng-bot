import { MarkdownBuilder } from './markdownBuilder';

describe('MarkdownBuilder', () => {
  let underTest: MarkdownBuilder;

  beforeEach(() => {
    underTest = new MarkdownBuilder();
  });

  describe('constructor', () => {
    it('should not escape alpha-numeric, space, backslash and newline input text', () => {
      const expected = '\\Hello 123\n';
      const actual = new MarkdownBuilder(expected).build();

      expect(actual).toEqual(expected);
    });

    it('should escape special characters from input text', () => {
      const input = 'Hello. 123!';
      const expected = 'Hello\\. 123\\!';
      const actual = new MarkdownBuilder(input).build();

      expect(actual).toEqual(expected);
    });
  });

  describe('raw', () => {
    it('should not escape alpha-numeric, space, backslash and newline input text', () => {
      const expected = '\\Goodbye 456\n';
      const actual = underTest.raw(expected).build();

      expect(actual).toEqual(expected);
    });

    it('should escape special characters from input text', () => {
      const input = '54321... Good bye!';
      const expected = '54321\\.\\.\\. Good bye\\!';
      const actual = underTest.raw(input).build();

      expect(actual).toEqual(expected);
    });
  });

  describe('bold', () => {
    it('should escape special characters from input text', () => {
      const input = 'BIG and B0LD!';
      const expected = '*BIG and B0LD\\!*';
      const actual = underTest.bold(input).build();

      expect(actual).toEqual(expected);
    });
  });

  describe('build', () => {
    it('should concatenate previous inputs', () => {
      const input1 = 'First line!\n';
      const input2 = '2nd Line!';
      const expected = 'First line\\!\n*2nd Line\\!*';
      const actual = underTest.raw(input1).bold(input2).build();

      expect(actual).toEqual(expected);
    });
  });

  describe('code', () => {
    it('should not escape any internal characters', () => {
      const input = 'for (int i = 0; i < 10; i++)';
      const expected = `\`\`\`java\n${input}\n\`\`\``;
      const actual = underTest.code(input, 'java').build();

      expect(actual).toEqual(expected);
    });
  });
});
