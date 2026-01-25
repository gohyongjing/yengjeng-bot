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
    const options = sendMessage.mock.calls[0][1];
    expect(options).toBeDefined();
    if (!options) throw new Error('Options should be defined');
    const payload = JSON.parse(options.payload?.toString() ?? '');
    const text = payload.text;
    const inlineKeyboard = payload.reply_markup?.inline_keyboard;

    expect(text).toContain('Hello');
    expect(text).toContain(MockUser.first_name);
    expect(text).toContain('This is Yeng Jeng Bot');
    expect(inlineKeyboard).toBeDefined();
    expect(JSON.stringify(inlineKeyboard)).toContain('Bus');
    expect(JSON.stringify(inlineKeyboard)).toContain('Scrabble');
    expect(JSON.stringify(inlineKeyboard)).toContain('Help');
    expect(JSON.stringify(inlineKeyboard)).toContain('Version');
    expect(
      canParseMarkdownV2.mock.results.every((result) => result.value === true),
    ).toBeTruthy();
  });
});
