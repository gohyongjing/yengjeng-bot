import {
  canParseMarkdownV2,
  sendMessage,
  MockUser,
  MockTelegramUrlFetchApp,
} from '@core/telegram/telegram.mock';
import { CommandV2 } from '@features/command/types/command';
import { getHelp } from './service';

describe('getHelp', () => {
  beforeAll(() => {
    global.UrlFetchApp = MockTelegramUrlFetchApp;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send help message with services and features', () => {
    const command = new CommandV2('/help');
    const chatId = 123456;

    getHelp(command, MockUser, chatId);

    expect(sendMessage).toHaveBeenCalledTimes(1);
    const options = sendMessage.mock.calls[0][1];
    expect(options).toBeDefined();
    if (!options) throw new Error('Options should be defined');
    const payload = JSON.parse(options.payload?.toString() ?? '');
    const text = payload.text;

    expect(text).toContain('help');
    expect(text).toContain('Provides instructions');
    expect(
      canParseMarkdownV2.mock.results.every((result) => result.value === true),
    ).toBeTruthy();
  });
});
