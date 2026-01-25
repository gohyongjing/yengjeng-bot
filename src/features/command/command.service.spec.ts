import {
  parseCommandWithState,
  handleCommand,
  getArg,
} from './command.service';
import { CommandV2 } from './types/command';
import { Feature, CommandHandler, Parameter } from './types';
import { User } from '@core/telegram';
import { CommandData } from './command.data';
import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';
import { MockTelegramUrlFetchApp } from '@core/telegram/telegram.mock';

describe('CommandService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    global.SpreadsheetApp = createMockSpreadsheetApp({
      TEST_SPREADSHEET_ID: {
        command_service: [['User Id', 'Command']],
      },
    });

    global.UrlFetchApp = MockTelegramUrlFetchApp;
  });

  describe('parseCommandWithState', () => {
    const userId = 12345;

    describe('when command has slash', () => {
      it('should replace previous command and return new command', () => {
        const previousCommand = 'bus stop';
        const newCommand = new CommandV2('/help commands');

        const commandData = new CommandData();
        commandData.updateCommand(userId, previousCommand);

        const result = parseCommandWithState(newCommand, userId);

        expect(result.hasSlash).toBe(true);
        expect(result.toString()).toBe('help commands');

        expect(commandData.readCommand(userId)).toBe('help commands');
      });
    });

    describe('when command does not have slash', () => {
      it('should append to previous command when previous command exists', () => {
        const previousCommand = 'bus stop';
        const newCommand = new CommandV2('12345');

        const commandData = new CommandData();
        commandData.updateCommand(userId, previousCommand);

        const result = parseCommandWithState(newCommand, userId);

        expect(result.hasSlash).toBe(true);
        expect(result.toString()).toBe('bus stop 12345');

        expect(commandData.readCommand(userId)).toBe('bus stop 12345');
      });

      it('should handle command when no previous command exists', () => {
        const newCommand = new CommandV2('help');

        const result = parseCommandWithState(newCommand, userId);

        expect(result.hasSlash).toBe(false);
        expect(result.toString()).toBe('help');

        const commandData = new CommandData();
        expect(commandData.readCommand(userId)).toBe('help');
      });
    });

    describe('edge cases', () => {
      it('should handle empty command', () => {
        const previousCommand = 'bus stop';
        const newCommand = new CommandV2('');

        const commandData = new CommandData();
        commandData.updateCommand(userId, previousCommand);

        const result = parseCommandWithState(newCommand, userId);

        expect(result.toString()).toBe('bus stop');

        expect(commandData.readCommand(userId)).toBe('bus stop');
      });

      it('should handle command with only slash', () => {
        const previousCommand = 'bus stop';
        const newCommand = new CommandV2('/');

        const commandData = new CommandData();
        commandData.updateCommand(userId, previousCommand);

        const result = parseCommandWithState(newCommand, userId);

        expect(result.toString()).toBe('');

        expect(commandData.readCommand(userId)).toBe('');
      });
    });
  });

  describe('handleCommand', () => {
    const user: User = { id: 12345, first_name: 'Test', is_bot: false };
    const chatId = 67890;

    describe('terminal feature (with handler)', () => {
      const mockHandler: CommandHandler = jest.fn();

      const terminalFeature: Feature = {
        commandWord: 'help',
        description: 'Get help information',
        button: {
          text: 'Help',
          callback_data: 'help',
        },
        help: 'This command shows help information',
        handler: mockHandler,
      };

      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('should call handler for terminal feature', () => {
        const command = new CommandV2('/help');

        handleCommand(
          terminalFeature,
          command,
          user,
          chatId,
          command.nextArg() ?? '',
        );

        expect(mockHandler).toHaveBeenCalledWith(command, user, chatId);
      });
    });

    describe('parent feature (with subFeatures)', () => {
      const mockSubHandler: CommandHandler = jest.fn();

      const subFeature: Feature = {
        commandWord: 'stop',
        description: 'Get bus stop information',
        button: {
          text: 'Stop Info',
          callback_data: 'stop',
        },
        help: 'This command shows bus stop information',
        handler: mockSubHandler,
      };

      const parentFeature: Feature = {
        commandWord: 'bus',
        description: 'Bus-related commands',
        button: {
          text: 'Bus',
          callback_data: 'bus',
        },
        subFeatures: [subFeature],
      };

      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('should show help when no next argument', () => {
        const command = new CommandV2('/bus');

        handleCommand(
          parentFeature,
          command,
          user,
          chatId,
          command.nextArg() ?? '',
        );

        //TODO: check help message

        expect(mockSubHandler).not.toHaveBeenCalled();
      });

      it('should handle valid subcommand', () => {
        const command = new CommandV2('/bus stop');

        handleCommand(
          parentFeature,
          command,
          user,
          chatId,
          command.nextArg() ?? '',
        );

        expect(mockSubHandler).toHaveBeenCalledWith(command, user, chatId);
      });

      it('should handle invalid subcommand', () => {
        const command = new CommandV2('/bus invalid');

        handleCommand(
          parentFeature,
          command,
          user,
          chatId,
          command.nextArg() ?? '',
        );

        expect(mockSubHandler).not.toHaveBeenCalled();
      });

      it('should handle nested subcommands', () => {
        const deepHandler: CommandHandler = jest.fn();

        const deepFeature: Feature = {
          commandWord: 'arrivals',
          description: 'Get arrival times',
          button: null,
          help: 'Shows arrival times',
          handler: deepHandler,
        };

        const middleFeature: Feature = {
          commandWord: 'stop',
          description: 'Stop commands',
          button: null,
          subFeatures: [deepFeature],
        };

        const topFeature: Feature = {
          commandWord: 'bus',
          description: 'Bus commands',
          button: null,
          subFeatures: [middleFeature],
        };

        const command = new CommandV2('/bus stop arrivals');

        handleCommand(
          topFeature,
          command,
          user,
          chatId,
          command.nextArg() ?? '',
        );

        expect(deepHandler).toHaveBeenCalledWith(command, user, chatId);
      });

      it('should show buttons for subfeatures', () => {
        const featureWithButton: Feature = {
          commandWord: 'stop',
          description: 'Stop info',
          button: { text: 'Stop', callback_data: 'stop' },
          help: 'Stop help',
          handler: jest.fn(),
        };

        const featureWithoutButton: Feature = {
          commandWord: 'route',
          description: 'Route info',
          button: null,
          help: 'Route help',
          handler: jest.fn(),
        };

        const parentFeature: Feature = {
          commandWord: 'bus',
          description: 'Bus commands',
          button: null,
          subFeatures: [featureWithButton, featureWithoutButton],
        };

        const command = new CommandV2('/bus');

        handleCommand(
          parentFeature,
          command,
          user,
          chatId,
          command.nextArg() ?? '',
        );

        expect(featureWithButton.handler).not.toHaveBeenCalled();
        expect(featureWithoutButton.handler).not.toHaveBeenCalled();
        //TODO: This test does not check for buttons
      });
    });

    describe('command prefix handling', () => {
      const mockHandler: CommandHandler = jest.fn();

      const subFeature: Feature = {
        commandWord: 'stop',
        description: 'Stop info',
        button: null,
        help: 'Stop help',
        handler: mockHandler,
      };

      const parentFeature: Feature = {
        commandWord: 'bus',
        description: 'Bus commands',
        button: null,
        subFeatures: [subFeature],
      };

      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('should pass correct command prefix to subcommand', () => {
        const command = new CommandV2('/bus stop');

        handleCommand(
          parentFeature,
          command,
          user,
          chatId,
          command.nextArg() ?? '',
        );

        expect(mockHandler).toHaveBeenCalledWith(command, user, chatId);
        //TODO: This test does not check for command prefix
      });
    });
  });

  describe('getArg', () => {
    const user: User = { id: 12345, first_name: 'Test', is_bot: false };
    const chatId = 67890;

    describe('when argument exists', () => {
      it('should process valid argument and return value', () => {
        const command = new CommandV2('/test valid_arg');
        const param: Parameter<string> = {
          name: 'testParam',
          helpMessage: 'Please enter a test parameter',
          processor: (value: string) => ({
            isSuccess: true,
            value: value.toUpperCase(),
          }),
        };
        command.nextArg();

        const result = getArg(command, user, chatId, param);

        expect(result).toBe('VALID_ARG');
      });

      it('should handle processing failure', () => {
        const command = new CommandV2('/test invalid_arg');
        const param: Parameter<number> = {
          name: 'numberParam',
          helpMessage: 'Please enter a number',
          processor: (value: string) => {
            const num = parseInt(value, 10);
            if (isNaN(num)) {
              return { isSuccess: false, errorMessage: 'Invalid number' };
            }
            return { isSuccess: true, value: num };
          },
        };

        command.nextArg();

        const result = getArg(command, user, chatId, param);

        expect(result).toBeNull();
        //TODO: This test does not check for error message
      });

      it('should call popArg when processing fails', () => {
        const command = new CommandV2('/test invalid_arg');
        const param: Parameter<number> = {
          name: 'numberParam',
          helpMessage: 'Please enter a number',
          processor: (_value: string) => ({
            isSuccess: false,
            errorMessage: 'Invalid number',
          }),
        };

        command.nextArg();

        const commandData = new CommandData();
        commandData.updateCommand(user.id, 'test invalid_arg');

        getArg(command, user, chatId, param);

        expect(commandData.readCommand(user.id)).toBe('test');
      });
    });

    describe('when no argument exists', () => {
      it('should show help message and return null', () => {
        const command = new CommandV2('/test');
        const param: Parameter<string> = {
          name: 'testParam',
          helpMessage: 'Please enter a test parameter',
          processor: (value: string) => ({ isSuccess: true, value: value }),
        };

        command.nextArg();

        const result = getArg(command, user, chatId, param);

        expect(result).toBeNull();
        //TODO: This test does not check for help message
      });

      it('should not call popArg when no argument exists', () => {
        const command = new CommandV2('/test');
        const param: Parameter<string> = {
          name: 'testParam',
          helpMessage: 'Please enter a test parameter',
          processor: (value: string) => ({ isSuccess: true, value: value }),
        };

        command.nextArg();

        const commandData = new CommandData();
        const initialCommand = commandData.readCommand(user.id);

        getArg(command, user, chatId, param);

        expect(commandData.readCommand(user.id)).toBe(initialCommand);
      });
    });

    describe('parameter processing', () => {
      it('should handle different parameter types', () => {
        const command = new CommandV2('/test 123');

        const stringParam: Parameter<string> = {
          name: 'stringParam',
          helpMessage: 'Enter string',
          processor: (value: string) => ({ isSuccess: true, value: value }),
        };

        const numberParam: Parameter<number> = {
          name: 'numberParam',
          helpMessage: 'Enter number',
          processor: (value: string) => ({
            isSuccess: true,
            value: parseInt(value, 10),
          }),
        };

        command.nextArg();

        const stringResult = getArg(command, user, chatId, stringParam);
        expect(stringResult).toBe('123');

        const command2 = new CommandV2('/test 123');
        command2.nextArg();

        const numberResult = getArg(command2, user, chatId, numberParam);
        expect(numberResult).toBe(123);
      });
    });
  });

  describe('integration scenarios', () => {
    const user: User = { id: 12345, first_name: 'Test', is_bot: false };
    const chatId = 67890;

    it('should handle complete command flow', () => {
      const mockHandler: CommandHandler = jest.fn();

      const stopFeature: Feature = {
        commandWord: 'stop',
        description: 'Get stop info',
        button: null,
        help: 'Stop help',
        handler: mockHandler,
      };

      const busFeature: Feature = {
        commandWord: 'bus',
        description: 'Bus commands',
        button: null,
        subFeatures: [stopFeature],
      };

      let command = new CommandV2('/bus');
      const parsedCommand = parseCommandWithState(command, user.id);
      handleCommand(
        busFeature,
        parsedCommand,
        user,
        chatId,
        parsedCommand.nextArg() ?? '',
      );

      expect(mockHandler).not.toHaveBeenCalled();

      command = new CommandV2('stop');
      const parsedCommand2 = parseCommandWithState(command, user.id);
      handleCommand(
        busFeature,
        parsedCommand2,
        user,
        chatId,
        parsedCommand2.nextArg() ?? '',
      );

      expect(mockHandler).toHaveBeenCalledWith(parsedCommand2, user, chatId);
    });

    it('should handle error recovery flow', () => {
      const mockHandler: CommandHandler = jest.fn();

      const stopFeature: Feature = {
        commandWord: 'stop',
        description: 'Get stop info',
        button: null,
        help: 'Stop help',
        handler: mockHandler,
      };

      const busFeature: Feature = {
        commandWord: 'bus',
        description: 'Bus commands',
        button: null,
        subFeatures: [stopFeature],
      };

      const command = new CommandV2('/bus stop invalid_id');
      const parsedCommand = parseCommandWithState(command, user.id);
      handleCommand(
        busFeature,
        parsedCommand,
        user,
        chatId,
        parsedCommand.nextArg() ?? '',
      );

      expect(mockHandler).toHaveBeenCalledWith(parsedCommand, user, chatId);

      const nextCommand = new CommandV2('12345');

      const parsedNextCommand = parseCommandWithState(nextCommand, user.id);
      handleCommand(
        busFeature,
        parsedNextCommand,
        user,
        chatId,
        parsedNextCommand.nextArg() ?? '',
      );

      expect(mockHandler).toHaveBeenCalledWith(parsedNextCommand, user, chatId);
      //TODO: This test does not check if the mockHandler is called with the correct arg
    });
  });
});
