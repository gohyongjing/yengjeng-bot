import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let underTest: LoggerService;

  beforeEach(() => {
    jest.clearAllMocks();
    underTest = new LoggerService();
  });

  it('should call all log methods without throwing errors', () => {
    expect(() => {
      underTest.debug('debug message');
      underTest.info('info message');
      underTest.warn('warn message');
      underTest.error('error message');
      underTest.fatal('fatal message');
    }).not.toThrow();
  });
});
