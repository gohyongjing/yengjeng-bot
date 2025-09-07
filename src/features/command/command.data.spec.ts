import { CommandData } from './command.data';
import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';

describe('CommandData', () => {
  let underTest: CommandData;

  beforeEach(() => {
    jest.clearAllMocks();
    global.SpreadsheetApp = createMockSpreadsheetApp({
      TEST_SPREADSHEET_ID: {
        command_service: [
          ['User Id', 'Command'],
          ['12345', '/bus stop 12345'],
          ['11111', '/help'],
          ['22222', '/bus stop 54321'],
        ],
      },
    });

    underTest = new CommandData();
  });

  describe('updateCommand', () => {
    it('should update command for user', () => {
      const userId = 12345;
      const newCommand = '/bus stop 12345';
      const expectedData = [userId, newCommand];

      const result = underTest.updateCommand(userId, newCommand);

      expect(result).toEqual(expectedData);
    });

    it('should handle empty command string', () => {
      const userId = 12345;
      const emptyCommand = '';
      const expectedData = [userId, emptyCommand];

      const result = underTest.updateCommand(userId, emptyCommand);

      expect(result).toEqual(expectedData);
    });

    it('should handle commands with special characters', () => {
      const userId = 12345;
      const specialCommand = '/cmd "arg with spaces" & symbols';
      const expectedData = [userId, specialCommand];

      const result = underTest.updateCommand(userId, specialCommand);

      expect(result).toEqual(expectedData);
    });

    it('should handle very long commands', () => {
      const userId = 12345;
      const longCommand = '/cmd ' + 'arg '.repeat(1000);
      const expectedData = [userId, longCommand];

      const result = underTest.updateCommand(userId, longCommand);

      expect(result).toEqual(expectedData);
    });
  });

  describe('readCommand', () => {
    it('should return command string when user exists', () => {
      const userId = 12345;
      const command = '/bus stop 12345';

      const result = underTest.readCommand(userId);

      expect(result).toBe(command);
    });

    it('should return null when user does not exist', () => {
      const userId = 99999;

      const result = underTest.readCommand(userId);

      expect(result).toBeNull();
    });

    it('should return empty string when command is empty', () => {
      const userId = 12345;
      underTest.updateCommand(userId, '');

      const result = underTest.readCommand(userId);

      expect(result).toBe('');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete command lifecycle', () => {
      const userId = 12345;
      const command1 = '/bus';
      const command2 = '/bus stop';
      const command3 = '/bus stop 12345';

      expect(underTest.readCommand(userId)).toBe('/bus stop 12345');

      underTest.updateCommand(userId, command1);
      expect(underTest.readCommand(userId)).toBe(command1);

      underTest.updateCommand(userId, command2);
      expect(underTest.readCommand(userId)).toBe(command2);

      underTest.updateCommand(userId, command3);
      expect(underTest.readCommand(userId)).toBe(command3);
    });

    it('should handle multiple users simultaneously', () => {
      const user1 = 11111;
      const user2 = 22222;
      const command1 = '/bus stop 12345';
      const command2 = '/help';

      expect(underTest.readCommand(user1)).toBe('/help');
      underTest.updateCommand(user1, command1);
      expect(underTest.readCommand(user1)).toBe(command1);

      expect(underTest.readCommand(user2)).toBe('/bus stop 54321');
      underTest.updateCommand(user2, command2);
      expect(underTest.readCommand(user2)).toBe(command2);

      expect(underTest.readCommand(user1)).toBe(command1);
      expect(underTest.readCommand(user2)).toBe(command2);
    });
  });
});
