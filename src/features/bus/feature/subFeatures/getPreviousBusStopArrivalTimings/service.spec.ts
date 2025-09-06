import { MockLogger } from '@core/googleAppsScript';
import {
  canParseMarkdownV2,
  sendMessage,
  MockUser,
} from '@core/telegram/telegram.mock';
import { CommandV2 } from '@core/util/commandV2';
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
    expect(sendMessage.mock.calls[0][0]).toContain(
      constants.DEFAULT_BUS_STOP_ID,
    );
    expect(sendMessage.mock.calls[0][0]).toContain('Refresh');
    expect(sendMessage.mock.calls[0][0]).toContain('inline_keyboard');
    expect(canParseMarkdownV2).toHaveBeenCalledTimes(1);
  });
});
