export const constants = {
  // Error messages
  MSG_INVALID_BUS_CODE: 'Invalid bus stop code',
  MSG_NO_BUSES: 'No buses found for bus stop',

  // Default values
  DEFAULT_BUS_STOP_ID: '04167',
  DEFAULT_USER_NAME: 'Unknown',

  // Feature descriptions and UI text
  FEATURE_COMMAND_WORD: 'bus',
  FEATURE_DESCRIPTION: 'Get bus arrival timings',
  FEATURE_BUTTON_TEXT: '🚌 Bus Timings',
  FEATURE_BUTTON_CALLBACK: '/bus',
  FEATURE_HELP: 'Get bus arrival timings of any Singapore bus stop',

  // Sub-feature descriptions
  BUS_STOP_COMMAND_WORD: 'bus_stop',
  BUS_STOP_DESCRIPTION: 'Get bus arrival timings of a specific bus stop',
  BUS_STOP_BUTTON_TEXT: '🚏 Bus Stop',
  BUS_STOP_BUTTON_CALLBACK: '/bus bus_stop',
  BUS_STOP_HELP: 'Get bus arrival timings of a specific bus stop',

  PREV_COMMAND_WORD: 'prev',
  PREV_DESCRIPTION:
    'Get bus arrival timings of the previously requested bus stop',
  PREV_BUTTON_TEXT: '🔄 Refresh Previous Bus Stop',
  PREV_BUTTON_CALLBACK: '/bus prev',
  PREV_HELP: 'Get bus arrival timings of the previously requested bus stop',

  // Parameter messages
  PARAM_BUS_STOP_ID_HELP:
    'Enter the bus stop ID to get the bus arrival timings for:',

  // Loading and UI messages
  LOADING_MESSAGE: 'Gimme a sec, getting the bus timings',
  REFRESH_BUTTON_TEXT: '🔄 Refresh',
  REFRESH_BUTTON_CALLBACK: '/bus prev',

  // Table headers
  TABLE_HEADER_BUS_NO: 'Bus No',
  TABLE_HEADER_NEXT_BUS: 'Next Bus',
  TABLE_HEADER_2ND_BUS: '2nd Bus',
  TABLE_HEADER_3RD_BUS: '3rd Bus',
  TABLE_HEADER_MINS: '(mins)',

  // Table formatting
  TABLE_COLUMN_WIDTH: 8,

  // Display formatting
  BUS_STOP_PREFIX: '🚍 BUS STOP',
  EMPTY_WAITING_TIME: '\\-',

  // Spreadsheet configuration
  SHEET_NAME: 'bus_service',
  SHEET_COLUMN_USER_ID: 'User Id',
  SHEET_COLUMN_USER_FIRST_NAME: 'User First Name',
  SHEET_COLUMN_LAST_QUERIED_BUS_STOP: 'Last Queried Bus Stop',
  SHEET_COLUMN_UPDATED_AT: 'Updated At',

  // API configuration
  API_BASE_URL:
    'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival',
  API_HEADER_ACCOUNT_KEY: 'AccountKey',
};
