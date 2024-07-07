/**
 * Based on the response body described in https://datamall.lta.gov.sg/content/dam/datamall/datasets/LTA_DataMall_API_User_Guide.pdf
 */

export type ResponseBody<T> = {
  'odata.metadata': string;
} & T;

export type BusArrivalResponse = {
  BusStopCode: string;
  Services?: BusServiceDetails[];
};

export type BusServiceDetails = {
  ServiceNo: string;
  Operator: string;
  NextBus: BusDetails;
  NextBus2: BusDetails;
  NextBus3: BusDetails;
};

export type BusDetails = {
  OriginCode: string;
  DestinationCode: string;
  EstimatedArrival: string;
  Latitude: string;
  Longitude: string;
  VisitNumber: string;
  Load: string;
  Feature: string;
  Type: string;
};
