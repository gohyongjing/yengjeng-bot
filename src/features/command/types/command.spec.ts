import { CommandV2 } from './command';

describe('CommandV2', () => {
  describe('constructor', () => {
    describe('when command starts with slash', () => {
      it('should set hasSlash to true and remove slash from first argument', () => {
        const command = new CommandV2('/cmd subcmd arg1 arg2');

        expect(command.hasSlash).toBe(true);
        expect(command.toString()).toBe('cmd subcmd arg1 arg2');
      });

      it('should handle single slash command', () => {
        const command = new CommandV2('/');

        expect(command.hasSlash).toBe(true);
        expect(command.toString()).toBe('');
      });

      it('should handle command with only slash and command word', () => {
        const command = new CommandV2('/cmd');

        expect(command.hasSlash).toBe(true);
        expect(command.toString()).toBe('cmd');
      });

      it('should convert first argument to lowercase', () => {
        const command = new CommandV2('/CMD subcmd ARG1 arg2');

        expect(command.hasSlash).toBe(true);
        expect(command.toString()).toBe('cmd subcmd ARG1 arg2');
      });
    });

    describe('when command does not start with slash', () => {
      it('should set hasSlash to false', () => {
        const command = new CommandV2('cmd subcmd arg1 arg2');

        expect(command.hasSlash).toBe(false);
        expect(command.toString()).toBe('cmd subcmd arg1 arg2');
      });
    });

    describe('edge cases', () => {
      it('should handle empty string', () => {
        const command = new CommandV2('');

        expect(command.hasSlash).toBe(false);
        expect(command.toString()).toBe('');
      });

      it('should handle multiple spaces between arguments', () => {
        const command = new CommandV2('/cmd   subcmd    arg1');

        expect(command.hasSlash).toBe(true);
        expect(command.toString()).toBe('cmd subcmd arg1');
      });

      it('should handle leading and trailing whitespace', () => {
        const command = new CommandV2('  /cmd subcmd arg1  ');

        expect(command.hasSlash).toBe(true);
        expect(command.toString()).toBe('cmd subcmd arg1');
      });
    });
  });

  describe('nextArg', () => {
    it('should return arguments in order', () => {
      const command = new CommandV2('/cmd subcmd arg1 arg2');

      expect(command.nextArg()).toBe('cmd');
      expect(command.nextArg()).toBe('subcmd');
      expect(command.nextArg()).toBe('arg1');
      expect(command.nextArg()).toBe('arg2');
    });

    it('should return null when no more arguments', () => {
      const command = new CommandV2('/cmd');

      expect(command.nextArg()).toBe('cmd');
      expect(command.nextArg()).toBeNull();
      expect(command.nextArg()).toBeNull();
    });

    it('should handle empty command', () => {
      const command = new CommandV2('');

      expect(command.nextArg()).toBeNull();
    });
  });

  describe('popArg', () => {
    it('should return null when no arguments', () => {
      const command = new CommandV2('');

      expect(command.popArg()).toBeNull();
    });

    it('should return the last argument', () => {
      const command = new CommandV2('/cmd subcmd arg1 arg2');

      expect(command.popArg()).toBe('arg2');
    });

    it('should handle multiple pop operations', () => {
      const command = new CommandV2('/cmd subcmd arg1 arg2 arg3');

      expect(command.popArg()).toBe('arg3');
      expect(command.popArg()).toBe('arg2');
      expect(command.popArg()).toBe('arg1');
      expect(command.popArg()).toBe('subcmd');
      expect(command.popArg()).toBe('cmd');
      expect(command.popArg()).toBeNull();
    });
  });

  describe('toString', () => {
    it('should return space-separated arguments', () => {
      const command = new CommandV2('/cmd subcmd arg1 arg2');

      expect(command.toString()).toBe('cmd subcmd arg1 arg2');
    });

    it('should return empty string for empty command', () => {
      const command = new CommandV2('');

      expect(command.toString()).toBe('');
    });

    it('should return single argument without spaces', () => {
      const command = new CommandV2('/cmd');

      expect(command.toString()).toBe('cmd');
    });
  });

  describe('integration scenarios', () => {
    it('should reflect current state after nextArg calls', () => {
      const command = new CommandV2('/cmd subcmd arg1 arg2');

      expect(command.toString()).toBe('cmd subcmd arg1 arg2');

      command.nextArg();
      command.nextArg();

      expect(command.toString()).toBe('cmd subcmd arg1 arg2');
    });

    it('should reflect current state after popArg calls', () => {
      const command = new CommandV2('/cmd subcmd arg1 arg2');

      command.popArg();

      expect(command.toString()).toBe('cmd subcmd arg1');
    });

    it('should handle stateful command processing', () => {
      const command = new CommandV2('/bus stop 12345');

      expect(command.nextArg()).toBe('bus');
      expect(command.nextArg()).toBe('stop');
      expect(command.nextArg()).toBe('12345');
      expect(command.nextArg()).toBeNull();

      expect(command.popArg()).toBe('12345');
      expect(command.nextArg()).toBeNull();
    });
  });
});
