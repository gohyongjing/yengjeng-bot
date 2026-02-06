import {
  canParseMarkdownV2,
  sendMessage,
  MockUser,
  MockTelegramUrlFetchApp,
} from '@core/telegram/telegram.mock';
import { CommandV2 } from '@features/command/types/command';
import { getVersion } from './service';

describe('getVersion', () => {
  beforeAll(() => {
    global.UrlFetchApp = MockTelegramUrlFetchApp;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send version message with version number', () => {
    const command = new CommandV2('/version');
    const chatId = 123456;

    getVersion(command, MockUser, chatId);

    expect(sendMessage).toHaveBeenCalledTimes(1);
    const options = sendMessage.mock.calls[0][1];
    expect(options).toBeDefined();
    if (!options) throw new Error('Options should be defined');
    const payload = JSON.parse(options.payload?.toString() ?? '');
    const text = payload.text;

    expect(text).toContain('Yeng Jeng Bot');
    expect(text).toMatch(/v\d+.*\d+.*\d+/);
    expect(
      canParseMarkdownV2.mock.results.every((result) => result.value === true),
    ).toBeTruthy();
  });
});
