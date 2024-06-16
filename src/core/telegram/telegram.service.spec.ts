import {
  MockHTTPResponse,
  MockLogger,
  MockUrlFetchApp,
} from '@core/googleAppsScript';
import { TelegramService } from './telegram.service';
import { Builder } from '@core/util/builder';
import { ResponseBody, User } from './telegram.type';

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
                      const responseBody: ResponseBody<User> = {
                        ok: true,
                        result: {
                          id: 123,
                          is_bot: false,
                          first_name: 'John Doe',
                        },
                      };
                      return JSON.stringify(responseBody);
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
      if (!actual.ok) {
        throw "Response body contains '{ok: false}'";
      }
      const resultKeys = Object.keys(actual.result);
      expect(resultKeys.includes('id')).toBeTruthy();
      expect(resultKeys.includes('is_bot')).toBeTruthy();
      expect(resultKeys.includes('first_name')).toBeTruthy();
    });
  });
});
