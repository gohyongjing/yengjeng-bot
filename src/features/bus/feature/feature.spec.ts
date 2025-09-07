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
    expect(sendMessage.mock.calls[0][0]).toContain(
      encodeURIComponent('Gimme a sec\\, getting the bus timings'),
    );
    expect(sendMessage.mock.calls[1][0]).toContain('83139');
    expect(sendMessage.mock.calls[1][0]).toContain('15');
    expect(sendMessage.mock.calls[1][0]).toContain('150');
    expect(sendMessage.mock.calls[1][0]).toContain('155');
    expect(sendMessage.mock.calls[2][0]).toContain('83139');
    expect(sendMessage.mock.calls[2][0]).toContain('15');
    expect(sendMessage.mock.calls[2][0]).toContain('150');
    expect(sendMessage.mock.calls[2][0]).toContain('155');
    expect(canParseMarkdownV2).toHaveBeenCalledTimes(3);
  });
});
