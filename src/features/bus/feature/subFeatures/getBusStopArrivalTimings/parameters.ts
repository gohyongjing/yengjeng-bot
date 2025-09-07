import { Parameter } from '@core/util/commandHandler/types';
import { constants } from '@features/bus/bus.constants';

export const busStopIdParameter: Parameter<string> = {
  name: 'busStopId',
  helpMessage: constants.PARAM_BUS_STOP_ID_HELP,
  processor: (value) => {
    const isValidBusStopId = /^\d+$/.test(value);
    if (!isValidBusStopId) {
      return { isSuccess: false, errorMessage: constants.MSG_INVALID_BUS_CODE };
    }
    return { isSuccess: true, value: value };
  },
};
