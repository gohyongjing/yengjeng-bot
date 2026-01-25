import { MockLogger } from '@core/googleAppsScript';
import {
  canParseMarkdownV2,
  sendMessage,
  MockUser,
} from '@core/telegram/telegram.mock';
import { CommandV2 } from '@features/command/types/command';
import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';
import { handleCommand } from '@features/command/command.service';
import { busFeature } from './index';
import { MockBusFeatureUrlFetchApp } from '../bus.mock';

describe('Bus Feature Integration', () => {
  beforeAll(() => {
    global.Logger = MockLogger;
    global.UrlFetchApp = MockBusFeatureUrlFetchApp;
  });

  beforeEach(() => {
    global.SpreadsheetApp = createMockSpreadsheetApp();
    jest.clearAllMocks();
  });

  it('should use previously queried bus stop when getting previous bus stop arrivals', () => {
    const chatId = 123456;
    const firstCommand = new CommandV2('bus_stop 83139');
    const secondCommand = new CommandV2('prev');

    handleCommand(busFeature, firstCommand, MockUser, chatId);
    handleCommand(busFeature, secondCommand, MockUser, chatId);

    expect(sendMessage).toHaveBeenCalledTimes(3);

    const firstCallOptions = sendMessage.mock.calls[0][1];
    expect(firstCallOptions).toBeDefined();
    if (!firstCallOptions) throw new Error('Options should be defined');
    const firstPayload = JSON.parse(firstCallOptions.payload?.toString() ?? '');
    expect(firstPayload.text).toContain(
      'Gimme a sec\\, getting the bus timings',
    );

    const secondCallOptions = sendMessage.mock.calls[1][1];
    expect(secondCallOptions).toBeDefined();
    if (!secondCallOptions) throw new Error('Options should be defined');
    const secondPayload = JSON.parse(
      secondCallOptions.payload?.toString() ?? '',
    );
    expect(secondPayload.text).toContain('83139');
    expect(secondPayload.text).toContain('15');
    expect(secondPayload.text).toContain('150');
    expect(secondPayload.text).toContain('155');

    const thirdCallOptions = sendMessage.mock.calls[2][1];
    expect(thirdCallOptions).toBeDefined();
    if (!thirdCallOptions) throw new Error('Options should be defined');
    const thirdPayload = JSON.parse(thirdCallOptions.payload?.toString() ?? '');
    expect(thirdPayload.text).toContain('83139');
    expect(thirdPayload.text).toContain('15');
    expect(thirdPayload.text).toContain('150');
    expect(thirdPayload.text).toContain('155');
    expect(canParseMarkdownV2).toHaveBeenCalledTimes(3);
  });
});
