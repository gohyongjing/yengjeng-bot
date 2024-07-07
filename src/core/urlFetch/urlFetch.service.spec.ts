import { Builder } from '@core/util/builder';
import { UrlFetchService } from './urlFetch.service';
import { MockHTTPResponse, MockUrlFetchApp } from '@core/googleAppsScript';
import { hasKey } from '@core/util/predicates';

describe('UrlFetchService', () => {
  beforeAll(() => {
    global.UrlFetchApp = new Builder(MockUrlFetchApp)
      .with({
        fetch: (url) => {
          if (url.includes('200')) {
            return new Builder(MockHTTPResponse)
              .with({
                getResponseCode: () => 200,
              })
              .build();
          } else {
            return new Builder(MockHTTPResponse)
              .with({
                getResponseCode: () => 500,
              })
              .build();
          }
        },
      })
      .build();
  });

  describe('fetch', () => {
    describe('response code 200', () => {
      it('should return ok result', () => {
        const actual = UrlFetchService.fetch('http://www.200.com');
        expect(hasKey(actual, 'Ok')).toBeTruthy();
      });
    });

    describe('response code 500', () => {
      it('should return err result', () => {
        const actual = UrlFetchService.fetch('http://www.500.com');
        expect(hasKey(actual, 'Err')).toBeTruthy();
      });
    });
  });
});
