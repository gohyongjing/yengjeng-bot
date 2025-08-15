import { ErrorService } from './error.service';
import { LoggerService } from '@core/logger/logger.service';

jest.mock('@core/logger/logger.service');

describe('ErrorService', () => {
  let underTest: ErrorService;
  let loggerErrorMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    loggerErrorMock = jest.fn();
    (LoggerService as jest.Mock).mockImplementation(() => ({
      error: loggerErrorMock,
    }));
    underTest = new ErrorService();
  });

  describe('handleError', () => {
    it('should log error with message and stack if present', () => {
      const error = { message: 'fail', stack: 'trace' };
      underTest.handleError(error);
      expect(loggerErrorMock).toHaveBeenCalledWith(
        expect.stringContaining('Error: [object Object]'),
      );
      expect(loggerErrorMock).toHaveBeenCalledWith(
        expect.stringContaining('Message: fail'),
      );
      expect(loggerErrorMock).toHaveBeenCalledWith(
        expect.stringContaining('Stack: trace'),
      );
    });

    it('should log error with empty message and stack if not present', () => {
      const error = { foo: 'bar' };
      underTest.handleError(error);
      expect(loggerErrorMock).toHaveBeenCalledWith(
        expect.stringContaining('Message: '),
      );
      expect(loggerErrorMock).toHaveBeenCalledWith(
        expect.stringContaining('Stack: '),
      );
    });

    it('should handle primitive errors', () => {
      underTest.handleError('string error');
      expect(loggerErrorMock).toHaveBeenCalledWith(
        expect.stringContaining('Error: string error'),
      );
    });
  });

  describe('withErrorHandling', () => {
    it('should call the function without error', () => {
      const fn = jest.fn();
      underTest.withErrorHandling(fn);
      expect(fn).toHaveBeenCalled();
      expect(loggerErrorMock).not.toHaveBeenCalled();
    });

    it('should handle and log errors thrown by the function', () => {
      const fn = jest.fn(() => {
        throw { message: 'fail', stack: 'trace' };
      });
      underTest.withErrorHandling(fn);
      expect(loggerErrorMock).toHaveBeenCalledWith(
        expect.stringContaining('Message: fail'),
      );
    });
  });
});
