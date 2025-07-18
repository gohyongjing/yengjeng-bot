import { LoggerService } from './logger.service';
import { MockLogger } from '@core/googleAppsScript';
import { createMockSpreadsheetApp } from '@core/spreadsheet/spreadsheet.mock';

describe('LoggerService', () => {
  let underTest: LoggerService;

  beforeAll(() => {
    global.Logger = MockLogger;
    global.SpreadsheetApp = createMockSpreadsheetApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    underTest = new LoggerService();
  });

  describe('all logging methods', () => {
    const loggingMethods = ['debug', 'info', 'warn', 'error', 'fatal'] as const;
    const testInputs = [
      'string message',
      123,
      { key: 'value' },
      ['array', 'of', 'items'],
      null,
      undefined,
      '',
      '   ',
      'message with "quotes"',
      'message with \n newlines',
      'message with \t tabs',
      'message with unicode: 🚀',
      new Error('test error'),
      new Date(),
      true,
      false,
    ];

    it('should handle all input types with all logging methods without throwing errors', () => {
      loggingMethods.forEach((method) => {
        testInputs.forEach((input) => {
          expect(() => {
            underTest[method](input);
          }).not.toThrow();
        });
      });
    });

    it('should handle rapid successive calls with all methods', () => {
      expect(() => {
        for (let i = 0; i < 5; i++) {
          loggingMethods.forEach((method) => {
            underTest[method](`${method} message ${i}`);
          });
        }
      }).not.toThrow();
    });
  });

  describe('edge cases', () => {
    const loggingMethods = ['debug', 'info', 'warn', 'error', 'fatal'] as const;

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(10000);

      loggingMethods.forEach((method) => {
        expect(() => {
          underTest[method](longMessage);
        }).not.toThrow();
      });
    });

    it('should handle complex nested objects', () => {
      const complexObject = {
        nested: {
          array: [1, 2, 3],
          string: 'test',
          number: 42,
          boolean: true,
          null: null,
          nestedAgain: {
            deep: 'value',
          },
        },
        function: () => 'test',
        date: new Date(),
        regex: /test/,
        symbol: Symbol('test'),
      };

      loggingMethods.forEach((method) => {
        expect(() => {
          underTest[method](complexObject);
        }).not.toThrow();
      });
    });

    it('should handle special characters and encoding', () => {
      const specialInputs = [
        'message with émojis 🎉',
        'message with 中文',
        'message with русский',
        'message with العربية',
        'message with 🚀🚁🚂🚃🚄🚅',
        'message with \x00\x01\x02',
        'message with \u0000\u0001\u0002',
      ];

      loggingMethods.forEach((method) => {
        specialInputs.forEach((input) => {
          expect(() => {
            underTest[method](input);
          }).not.toThrow();
        });
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple log calls in sequence', () => {
      expect(() => {
        underTest.debug('debug message');
        underTest.info('info message');
        underTest.warn('warning message');
        underTest.error('error message');
        underTest.fatal('fatal message');
      }).not.toThrow();
    });

    it('should handle mixed data types in sequence', () => {
      expect(() => {
        underTest.debug('string message');
        underTest.info(123);
        underTest.warn({ key: 'value' });
        underTest.error(['array', 'items']);
        underTest.fatal(null);
      }).not.toThrow();
    });

    it('should handle high volume logging', () => {
      expect(() => {
        for (let i = 0; i < 100; i++) {
          underTest.info(`message ${i}`);
        }
      }).not.toThrow();
    });

    it('should handle concurrent-like usage patterns', () => {
      expect(() => {
        // Simulate rapid switching between log levels
        for (let i = 0; i < 20; i++) {
          if (i % 5 === 0) underTest.debug(`debug ${i}`);
          if (i % 5 === 1) underTest.info(`info ${i}`);
          if (i % 5 === 2) underTest.warn(`warn ${i}`);
          if (i % 5 === 3) underTest.error(`error ${i}`);
          if (i % 5 === 4) underTest.fatal(`fatal ${i}`);
        }
      }).not.toThrow();
    });
  });
});
