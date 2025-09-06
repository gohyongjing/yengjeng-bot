import { Parameter } from '@core/util/commandHandler/types';
import { constants } from '@features/bus/bus.constants';

export const busStopIdParameter: Parameter<string> = {
  name: 'busStopId',
  helpMessage: 'Enter the bus stop ID to get the bus arrival timings for:', //TODO: Move to constants
  processor: (value) => {
    const isValidBusStopId = /^\d+$/.test(value);
    if (!isValidBusStopId) {
      return { isSuccess: false, errorMessage: constants.MSG_INVALID_BUS_CODE };
    }
    return { isSuccess: true, value: value };
  },
};
