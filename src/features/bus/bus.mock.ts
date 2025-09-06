import { MockHTTPResponse, MockUrlFetchApp } from '@core/googleAppsScript';
import { Builder } from '@core/util/builder';
import { MockTelegramUrlFetchApp } from '@core/telegram/telegram.mock';
import {
  BusArrivalResponse,
  BusDetails,
  BusServiceDetails,
  ResponseBody,
} from './bus.type';

export const MockEmptyBusDetials: BusDetails = {
  OriginCode: '',
  DestinationCode: '',
  EstimatedArrival: '',
  Latitude: '',
  Longitude: '',
  VisitNumber: '',
  Load: '',
  Feature: '',
  Type: '',
};

export const MockBusDetails: BusDetails = {
  OriginCode: '34567',
  DestinationCode: '76543',
  EstimatedArrival: '2024-06-29T10:43:41+08:00',
  Latitude: '1.23',
  Longitude: '2.34',
  VisitNumber: '1',
  Load: 'SEA',
  Feature: 'WAB',
  Type: 'DD',
};

export const MockBusServiceDetails: BusServiceDetails = {
  ServiceNo: '1A',
  Operator: 'GAS',
  NextBus: MockBusDetails,
  NextBus2: MockEmptyBusDetials,
  NextBus3: MockEmptyBusDetials,
};

export const MockBusArrivalResponseBody: ResponseBody<BusArrivalResponse> = {
  'odata.metadata':
    'https://datamall2.mytransport.sg/ltaodataservice/$metadata#BusArrivalv2/@Element',
  BusStopCode: '12345',
  Services: [MockBusServiceDetails],
};

function getBusStopCode(url: string): string | null {
  const param = 'BusStopCode=';
  if (url.includes(param)) {
    const startIndex = url.indexOf(param) + param.length;
    const busStopCodeLength = 5;
    const busStopCode = url.slice(startIndex, startIndex + busStopCodeLength);
    return busStopCode;
  }
  return null;
}

function getBusArrivals(busStopCode: string): string {
  if (busStopCode === '83139') {
    return '{"odata.metadata":"http://datamall2.mytransport.sg/ltaodataservice/$metadata#BusArrivalv2/@Element","BusStopCode":"83139","Services":[{"ServiceNo":"15","Operator":"GAS","NextBus":{"OriginCode":"77009","DestinationCode":"77009","EstimatedArrival":"2024-06-23T16:25:56+08:00","Latitude":"1.3287541666666667","Longitude":"103.90549116666666","VisitNumber":"1","Load":"SEA","Feature":"WAB","Type":"SD"},"NextBus2":{"OriginCode":"77009","DestinationCode":"77009","EstimatedArrival":"2024-06-23T16:44:17+08:00","Latitude":"1.3465785","Longitude":"103.942834","VisitNumber":"1","Load":"SEA","Feature":"WAB","Type":"SD"},"NextBus3":{"OriginCode":"77009","DestinationCode":"77009","EstimatedArrival":"2024-06-23T16:52:45+08:00","Latitude":"1.3567688333333334","Longitude":"103.9455665","VisitNumber":"1","Load":"SEA","Feature":"WAB","Type":"SD"}},{"ServiceNo":"150","Operator":"SBST","NextBus":{"OriginCode":"82009","DestinationCode":"82009","EstimatedArrival":"2024-06-23T16:23:59+08:00","Latitude":"1.3186245","Longitude":"103.9003315","VisitNumber":"1","Load":"SEA","Feature":"WAB","Type":"SD"},"NextBus2":{"OriginCode":"82009","DestinationCode":"82009","EstimatedArrival":"2024-06-23T16:39:51+08:00","Latitude":"0.0","Longitude":"0.0","VisitNumber":"1","Load":"SEA","Feature":"WAB","Type":"SD"},"NextBus3":{"OriginCode":"82009","DestinationCode":"82009","EstimatedArrival":"2024-06-23T16:53:51+08:00","Latitude":"0.0","Longitude":"0.0","VisitNumber":"1","Load":"SEA","Feature":"WAB","Type":"SD"}},{"ServiceNo":"155","Operator":"SBST","NextBus":{"OriginCode":"52009","DestinationCode":"84009","EstimatedArrival":"2024-06-23T16:46:50+08:00","Latitude":"1.327981","Longitude":"103.88547233333334","VisitNumber":"1","Load":"SEA","Feature":"WAB","Type":"SD"},"NextBus2":{"OriginCode":"52009","DestinationCode":"84009","EstimatedArrival":"2024-06-23T17:01:37+08:00","Latitude":"1.3436333333333332","Longitude":"103.85999966666667","VisitNumber":"1","Load":"SDA","Feature":"WAB","Type":"SD"},"NextBus3":{"OriginCode":"","DestinationCode":"","EstimatedArrival":"","Latitude":"","Longitude":"","VisitNumber":"","Load":"","Feature":"","Type":""}}]}';
  } else if (busStopCode === 'ABC') {
    return `{"odata.metadata":"http://datamall2.mytransport.sg/ltaodataservice/$metadata#BusArrivalv2/@Element","BusStopCode":"${busStopCode}"}`;
  }
  return `{"odata.metadata":"http://datamall2.mytransport.sg/ltaodataservice/$metadata#BusArrivalv2/@Element","BusStopCode":"${busStopCode}","Services":[]}`;
}

export const MockLTAUrlFetchApp = new Builder(MockUrlFetchApp)
  .with({
    fetch: jest.fn(
      (
        url: string,
        _params?: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions,
      ) => {
        const busStopNo = getBusStopCode(url);
        const response = new Builder(MockHTTPResponse)
          .with({
            getResponseCode: () => {
              if (busStopNo && /^\d+$/.test(busStopNo)) {
                return 200;
              }
              return 500;
            },
            getContentText: jest.fn(() => {
              if (busStopNo) {
                return getBusArrivals(busStopNo);
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

export const MockBusFeatureUrlFetchApp = new Builder(MockUrlFetchApp)
  .with({
    fetch: (url) => {
      if (url.includes('datamall2.mytransport.sg')) {
        return MockLTAUrlFetchApp.fetch(url);
      } else if (url.includes('api.telegram.org/bot')) {
        return MockTelegramUrlFetchApp.fetch(url);
      }
      return MockUrlFetchApp.fetch(url);
    },
  })
  .build();
