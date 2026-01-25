import { MockLogger } from '@core/googleAppsScript';
import {
  canParseMarkdownV2,
  sendMessage,
  MockUser,
} from '@core/telegram/telegram.mock';
import { CommandV2 } from '@features/command/types/command';
import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';
import { getBusStopArrivalTimings } from './service';
import { constants } from '../../../bus.constants';
import { MockBusFeatureUrlFetchApp } from '../../../bus.mock';

describe('getBusStopArrivalTimings', () => {
  beforeAll(() => {
    global.Logger = MockLogger;
    global.UrlFetchApp = MockBusFeatureUrlFetchApp;
  });

  beforeEach(() => {
    global.SpreadsheetApp = createMockSpreadsheetApp();
    jest.clearAllMocks();
  });

  it('should send loading message and get bus arrivals when valid bus stop ID provided', () => {
    const command = new CommandV2('83139');
    const chatId = 123456;

    getBusStopArrivalTimings(command, MockUser, chatId);

    expect(sendMessage).toHaveBeenCalledTimes(2);
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
    expect(JSON.stringify(secondPayload.reply_markup)).toContain('Refresh');
    expect(secondPayload.reply_markup).toHaveProperty('inline_keyboard');
    expect(canParseMarkdownV2).toHaveBeenCalledTimes(2);
  });

  it('should return invalid bus code message for invalid bus stop ID', () => {
    const command = new CommandV2('abc');
    const chatId = 123456;

    getBusStopArrivalTimings(command, MockUser, chatId);

    expect(sendMessage).toHaveBeenCalledTimes(1);
    const options = sendMessage.mock.calls[0][1];
    expect(options).toBeDefined();
    if (!options) throw new Error('Options should be defined');
    const payload = JSON.parse(options.payload?.toString() ?? '');
    expect(payload.text).toContain(constants.MSG_INVALID_BUS_CODE);
  });

  it('should return no buses found message for empty bus stop', () => {
    const command = new CommandV2('123');
    const chatId = 123456;

    getBusStopArrivalTimings(command, MockUser, chatId);

    expect(sendMessage).toHaveBeenCalledTimes(2);
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
    expect(secondPayload.text).toContain(constants.MSG_NO_BUSES);
  });
});
