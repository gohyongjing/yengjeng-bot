import {
  MockHTTPResponse,
  MockLogger,
  MockUrlFetchApp,
} from '@core/googleAppsScript';
import { TelegramService } from './telegram.service';
import { Builder } from '@core/util/builder';
import { User } from './telegram.type';

describe('TelegramService', () => {
  describe('getMe', () => {
    let underTest: TelegramService;

    beforeAll(() => {
      global.Logger = MockLogger;
      global.UrlFetchApp = new Builder(MockUrlFetchApp)
        .with({
          fetch: jest.fn(
            (
              url: string,
              _params?: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions,
            ) => {
              const response = new Builder(MockHTTPResponse)
                .with({
                  getContentText: jest.fn(() => {
                    if (url.endsWith('getMe')) {
                      const user: User = {
                        id: 123,
                        is_bot: false,
                        first_name: 'John Doe',
                      };
                      return JSON.stringify(user);
                    }
                    return '';
                  }),
                })
                .build();

              return response;
            },
          ),
        })
        .build();
    });

    beforeEach(() => {
      underTest = new TelegramService();
    });

    it('should return the value of the variable called %s', () => {
      const actual = underTest.getMe();
      expect(Object.keys(actual).includes('id')).toBeTruthy();
      expect(Object.keys(actual).includes('is_bot')).toBeTruthy();
      expect(Object.keys(actual).includes('first_name')).toBeTruthy();
    });
  });
});
