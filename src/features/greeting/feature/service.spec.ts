import {
  canParseMarkdownV2,
  sendMessage,
  MockUser,
  MockTelegramUrlFetchApp,
} from '@core/telegram/telegram.mock';
import { CommandV2 } from '@features/command/types/command';
import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';
import { greetUser } from './service';

jest.mock('@features/user', () => ({
  UserService: jest.fn().mockImplementation(() => ({
    updateProfile: jest.fn(),
  })),
}));

describe('greetUser', () => {
  beforeAll(() => {
    global.UrlFetchApp = MockTelegramUrlFetchApp;
  });

  beforeEach(() => {
    global.SpreadsheetApp = createMockSpreadsheetApp();
    jest.clearAllMocks();
  });

  it('should greet user with first name and show inline keyboard', () => {
    const command = new CommandV2('start');
    const chatId = 123456;

    greetUser(command, MockUser, chatId);

    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage.mock.calls[0][0]).toContain('Hello');
    expect(sendMessage.mock.calls[0][0]).toContain(
      encodeURIComponent(MockUser.first_name),
    );
    expect(sendMessage.mock.calls[0][0]).toContain(
      encodeURIComponent('This is Yeng Jeng Bot'),
    );
    expect(sendMessage.mock.calls[0][0]).toContain('Bus');
    expect(sendMessage.mock.calls[0][0]).toContain('Scrabble');
    expect(sendMessage.mock.calls[0][0]).toContain('Help');
    expect(sendMessage.mock.calls[0][0]).toContain('Version');
    expect(sendMessage.mock.calls[0][0]).toContain('inline_keyboard');
    expect(
      canParseMarkdownV2.mock.results.every((result) => result.value === true),
    ).toBeTruthy();
  });
});
