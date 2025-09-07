import { MockLogger } from '@core/googleAppsScript';
import {
  canParseMarkdownV2,
  sendMessage,
  MockUser,
} from '@core/telegram/telegram.mock';
import { CommandV2 } from '@core/util/commandV2';
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
    expect(sendMessage.mock.calls[0][0]).toContain(
      encodeURIComponent('Gimme a sec\\, getting the bus timings'),
    );
    expect(sendMessage.mock.calls[1][0]).toContain('83139');
    expect(sendMessage.mock.calls[1][0]).toContain('15');
    expect(sendMessage.mock.calls[1][0]).toContain('150');
    expect(sendMessage.mock.calls[1][0]).toContain('155');
    expect(sendMessage.mock.calls[1][0]).toContain('Refresh');
    expect(sendMessage.mock.calls[1][0]).toContain('inline_keyboard');
    expect(canParseMarkdownV2).toHaveBeenCalledTimes(2);
  });

  it('should return invalid bus code message for invalid bus stop ID', () => {
    const command = new CommandV2('abc');
    const chatId = 123456;

    getBusStopArrivalTimings(command, MockUser, chatId);

    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage.mock.calls[0][0]).toContain(
      encodeURIComponent(constants.MSG_INVALID_BUS_CODE),
    );
  });

  it('should return no buses found message for empty bus stop', () => {
    const command = new CommandV2('123');
    const chatId = 123456;

    getBusStopArrivalTimings(command, MockUser, chatId);

    expect(sendMessage).toHaveBeenCalledTimes(2);
    expect(sendMessage.mock.calls[0][0]).toContain(
      encodeURIComponent('Gimme a sec\\, getting the bus timings'),
    );
    expect(sendMessage.mock.calls[1][0]).toContain(
      encodeURIComponent(constants.MSG_NO_BUSES),
    );
  });
});
