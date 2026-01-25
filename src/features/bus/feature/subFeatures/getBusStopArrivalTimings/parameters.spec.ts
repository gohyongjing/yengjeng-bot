import { constants } from '@features/bus/bus.constants';
import { busStopIdParameter } from './parameters';

describe('busStopIdParameter', () => {
  describe('processor', () => {
    it('should return success for valid numeric bus stop ID', () => {
      const result = busStopIdParameter.processor('83139');

      expect(result.isSuccess).toBe(true);
      if (!result.isSuccess) {
        throw new Error('Expected success');
      }
      expect(result.value).toBe('83139');
    });

    it('should return failure for non-numeric bus stop ID', () => {
      const result = busStopIdParameter.processor('ABC');

      expect(result.isSuccess).toBe(false);
      if (result.isSuccess) {
        throw new Error('Expected failure');
      }
      expect(result.errorMessage).toBe(constants.MSG_INVALID_BUS_CODE);
    });

    it('should return failure for alphanumeric bus stop ID', () => {
      const result = busStopIdParameter.processor('123ABC');

      expect(result.isSuccess).toBe(false);
      if (result.isSuccess) {
        throw new Error('Expected failure');
      }
      expect(result.errorMessage).toBe(constants.MSG_INVALID_BUS_CODE);
    });

    it('should return failure for bus stop ID with special characters', () => {
      const result = busStopIdParameter.processor('123-456');

      expect(result.isSuccess).toBe(false);
      if (result.isSuccess) {
        throw new Error('Expected failure');
      }
      expect(result.errorMessage).toBe(constants.MSG_INVALID_BUS_CODE);
    });

    it('should return failure for empty string', () => {
      const result = busStopIdParameter.processor('');

      expect(result.isSuccess).toBe(false);
      if (result.isSuccess) {
        throw new Error('Expected failure');
      }
      expect(result.errorMessage).toBe(constants.MSG_INVALID_BUS_CODE);
    });

    it('should return failure for bus stop ID with spaces', () => {
      const result = busStopIdParameter.processor('123 456');

      expect(result.isSuccess).toBe(false);
      if (result.isSuccess) {
        throw new Error('Expected failure');
      }
      expect(result.errorMessage).toBe(constants.MSG_INVALID_BUS_CODE);
    });
  });
});
