import { Command } from './command.util';

describe('Command', () => {
  describe('isCommand', () => {
    describe('Different command word', () => {
      it.each(['dothat', 'do', 'dothiss', '123'])(
        'returns false',
        (commandWord) => {
          const underTest = new Command('dothis dothat 123');
          const actual = underTest.isCommand(commandWord);

          expect(actual).toBeFalsy();
        },
      );
    });

    describe('Different case', () => {
      it.each(['DOCOMMAND', 'docommand', 'dOComMand'])(
        'Ignores case',
        (commandWord) => {
          const underTest = new Command('doCommand dothat 123');
          const actual = underTest.isCommand(commandWord);

          expect(actual).toBeTruthy();
        },
      );
    });

    describe('Includes leading slash case', () => {
      it.each(['calculate', 'CALCULATE'])('returns true', (commandWord) => {
        const underTest = new Command('/calculate 123 456');
        const actual = underTest.isCommand(commandWord);

        expect(actual).toBeTruthy();
      });
    });
  });

  describe('commandWord', () => {
    it('Correctly extracts command word with positional arguments', () => {
      const underTest = new Command('/test arg1 arg2');

      expect(underTest.commandWord).toBe('test');
    });

    it('Correctly extracts command word without leading slash', () => {
      const underTest = new Command('test arg1 arg2');

      expect(underTest.commandWord).toBe('test');
    });

    it('Handles empty command', () => {
      const underTest = new Command('');

      expect(underTest.commandWord).toBeNull();
    });

    it('Handles command with only slash', () => {
      const underTest = new Command('/');

      expect(underTest.commandWord).toBeNull();
    });
  });

  describe('positionalArgs', () => {
    it('Ignores keyword arguments', () => {
      const underTest = new Command('cmd pos1 pos2 -key1 val1 pos3 --k2 v2');

      expect(underTest.positionalArgs).toEqual(['pos1', 'pos2', 'pos3']);
    });

    it('Correctly extracts positional arguments', () => {
      const underTest = new Command('/test arg1 arg2');

      expect(underTest.positionalArgs).toEqual(['arg1', 'arg2']);
    });
  });

  describe('keywordArgs', () => {
    it('Ignores positional arguments', () => {
      const underTest = new Command('cmd pos1 pos2 -key1 val1 pos3 --k2 v2');

      expect(underTest.keywordArgs['key1']).toBe('val1');
      expect(underTest.keywordArgs['-k2']).toBe('v2');
    });
  });
});
