import { MockLogger } from '@core/googleAppsScript';
import {
  canParseMarkdownV2,
  sendMessage,
  MockUser,
} from '@core/telegram/telegram.mock';
import { CommandV2 } from '@features/command/types/command';
import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';
import { getPreviousBusStopArrivalTimings } from './service';
import { constants } from '../../../bus.constants';
import { MockBusFeatureUrlFetchApp } from '../../../bus.mock';

describe('getPreviousBusStopArrivalTimings', () => {
  beforeAll(() => {
    global.Logger = MockLogger;
    global.UrlFetchApp = MockBusFeatureUrlFetchApp;
  });

  beforeEach(() => {
    global.SpreadsheetApp = createMockSpreadsheetApp();
    jest.clearAllMocks();
  });

  it('should get bus arrivals for default bus stop', () => {
    const command = new CommandV2('bus prev');
    const chatId = 123456;

    getPreviousBusStopArrivalTimings(command, MockUser, chatId);

    expect(sendMessage).toHaveBeenCalledTimes(1);
    const options = sendMessage.mock.calls[0][1];
    expect(options).toBeDefined();
    if (!options) throw new Error('Options should be defined');
    const payload = JSON.parse(options.payload?.toString() ?? '');
    const text = payload.text;

    expect(text).toContain(constants.DEFAULT_BUS_STOP_ID);
    expect(payload.reply_markup).toHaveProperty('inline_keyboard');
    expect(JSON.stringify(payload.reply_markup)).toContain('Refresh');
    expect(canParseMarkdownV2).toHaveBeenCalledTimes(1);
  });
});
