import { Parameter } from './parameter';

describe('Parameter', () => {
  describe('string parameter processor', () => {
    const stringParam: Parameter<string> = {
      name: 'stopId',
      helpMessage: 'Please enter a bus stop ID',
      processor: (value: string) => {
        if (!value || value.trim() === '') {
          return { isSuccess: false, errorMessage: 'Stop ID cannot be empty' };
        }
        return { isSuccess: true, value: value.trim() };
      },
    };

    it('should process valid string values', () => {
      const result = stringParam.processor('12345');

      expect(result.isSuccess).toBe(true);
      if (!result.isSuccess) {
        throw new Error('Expected success');
      }
      expect(result.value).toBe('12345');
    });

    it('should trim whitespace from string values', () => {
      const result = stringParam.processor('  12345  ');

      expect(result.isSuccess).toBe(true);
      if (!result.isSuccess) {
        throw new Error('Expected success');
      }
      expect(result.value).toBe('12345');
    });

    it('should reject empty strings', () => {
      const result = stringParam.processor('');

      expect(result.isSuccess).toBe(false);
      if (result.isSuccess) {
        throw new Error('Expected failure');
      }
      expect(result.errorMessage).toBe('Stop ID cannot be empty');
    });

    it('should reject whitespace-only strings', () => {
      const result = stringParam.processor('   ');

      expect(result.isSuccess).toBe(false);
      if (result.isSuccess) {
        throw new Error('Expected failure');
      }
      expect(result.errorMessage).toBe('Stop ID cannot be empty');
    });

    it('should handle special characters in strings', () => {
      const specialValue = 'stop-123_ABC@#$';
      const result = stringParam.processor(specialValue);

      expect(result.isSuccess).toBe(true);
      if (!result.isSuccess) {
        throw new Error('Expected success');
      }
      expect(result.value).toBe(specialValue);
    });
  });

  describe('number parameter processor', () => {
    const numberParam: Parameter<number> = {
      name: 'count',
      helpMessage: 'Please enter a number between 1 and 10',
      processor: (value: string) => {
        const num = parseInt(value, 10);
        if (isNaN(num)) {
          return {
            isSuccess: false,
            errorMessage: 'Please enter a valid number',
          };
        }
        if (num < 1 || num > 10) {
          return {
            isSuccess: false,
            errorMessage: 'Number must be between 1 and 10',
          };
        }
        return { isSuccess: true, value: num };
      },
    };

    it('should process valid numbers', () => {
      const result = numberParam.processor('5');

      expect(result.isSuccess).toBe(true);
      if (!result.isSuccess) {
        throw new Error('Expected success');
      }
      expect(result.value).toBe(5);
    });

    it('should process boundary values', () => {
      const result1 = numberParam.processor('1');
      const result2 = numberParam.processor('10');

      expect(result1.isSuccess).toBe(true);
      expect(result2.isSuccess).toBe(true);
      if (!result1.isSuccess || !result2.isSuccess) {
        throw new Error('Expected success');
      }
      expect(result1.value).toBe(1);
      expect(result2.value).toBe(10);
    });

    it('should reject non-numeric strings', () => {
      const result = numberParam.processor('abc');

      expect(result.isSuccess).toBe(false);
      if (result.isSuccess) {
        throw new Error('Expected failure');
      }
      expect(result.errorMessage).toBe('Please enter a valid number');
    });

    it('should reject numbers outside range', () => {
      const result1 = numberParam.processor('0');
      const result2 = numberParam.processor('11');

      expect(result1.isSuccess).toBe(false);
      expect(result2.isSuccess).toBe(false);
      if (result1.isSuccess || result2.isSuccess) {
        throw new Error('Expected failure');
      }
      expect(result1.errorMessage).toBe('Number must be between 1 and 10');
      expect(result2.errorMessage).toBe('Number must be between 1 and 10');
    });

    it('should reject decimal numbers', () => {
      const result = numberParam.processor('5.5');

      expect(result.isSuccess).toBe(true);
      if (!result.isSuccess) {
        throw new Error('Expected success');
      }
      expect(result.value).toBe(5);
    });
  });

  describe('boolean parameter processor', () => {
    const booleanParam: Parameter<boolean> = {
      name: 'enabled',
      helpMessage: 'Please enter true or false',
      processor: (value: string) => {
        const lowerValue = value.toLowerCase();
        if (
          lowerValue === 'true' ||
          lowerValue === '1' ||
          lowerValue === 'yes'
        ) {
          return { isSuccess: true, value: true };
        }
        if (
          lowerValue === 'false' ||
          lowerValue === '0' ||
          lowerValue === 'no'
        ) {
          return { isSuccess: true, value: false };
        }
        return {
          isSuccess: false,
          errorMessage: 'Please enter true/false, yes/no, or 1/0',
        };
      },
    };

    it('should process true values', () => {
      const trueValues = ['true', 'TRUE', 'True', '1', 'yes', 'YES', 'Yes'];

      trueValues.forEach((value) => {
        const result = booleanParam.processor(value);
        expect(result.isSuccess).toBe(true);
        if (!result.isSuccess) {
          throw new Error('Expected success');
        }
        expect(result.value).toBe(true);
      });
    });

    it('should process false values', () => {
      const falseValues = ['false', 'FALSE', 'False', '0', 'no', 'NO', 'No'];

      falseValues.forEach((value) => {
        const result = booleanParam.processor(value);
        expect(result.isSuccess).toBe(true);
        if (!result.isSuccess) {
          throw new Error('Expected success');
        }
        expect(result.value).toBe(false);
      });
    });

    it('should reject invalid boolean values', () => {
      const invalidValues = ['maybe', '2', 'abc', '', 'null', 'undefined'];

      invalidValues.forEach((value) => {
        const result = booleanParam.processor(value);
        expect(result.isSuccess).toBe(false);
        if (result.isSuccess) {
          throw new Error('Expected failure');
        }
        expect(result.errorMessage).toBe(
          'Please enter true/false, yes/no, or 1/0',
        );
      });
    });
  });

  describe('enum parameter processor', () => {
    const enumParam: Parameter<string> = {
      name: 'direction',
      helpMessage: 'Please enter north, south, east, or west',
      processor: (value: string) => {
        const validDirections = ['north', 'south', 'east', 'west'];
        const lowerValue = value.toLowerCase();

        if (validDirections.includes(lowerValue)) {
          return { isSuccess: true, value: lowerValue };
        }

        return {
          isSuccess: false,
          errorMessage: `Invalid direction. Please enter one of: ${validDirections.join(', ')}`,
        };
      },
    };

    it('should process valid enum values', () => {
      const validValues = ['north', 'NORTH', 'North', 'south', 'east', 'west'];

      validValues.forEach((value) => {
        const result = enumParam.processor(value);
        expect(result.isSuccess).toBe(true);
        if (!result.isSuccess) {
          throw new Error('Expected success');
        }
        expect(result.value).toBe(value.toLowerCase());
      });
    });

    it('should reject invalid enum values', () => {
      const invalidValues = [
        'northeast',
        'up',
        'down',
        'left',
        'right',
        'center',
      ];

      invalidValues.forEach((value) => {
        const result = enumParam.processor(value);
        expect(result.isSuccess).toBe(false);
        if (result.isSuccess) {
          throw new Error('Expected failure');
        }
        expect(result.errorMessage).toContain('Invalid direction');
        expect(result.errorMessage).toContain('north, south, east, west');
      });
    });
  });

  describe('complex validation parameter processor', () => {
    const complexParam: Parameter<string> = {
      name: 'email',
      helpMessage: 'Please enter a valid email address',
      processor: (value: string) => {
        const trimmed = value.trim();

        if (!trimmed) {
          return { isSuccess: false, errorMessage: 'Email cannot be empty' };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) {
          return {
            isSuccess: false,
            errorMessage: 'Please enter a valid email address',
          };
        }

        if (trimmed.length > 254) {
          return {
            isSuccess: false,
            errorMessage: 'Email address is too long',
          };
        }

        return { isSuccess: true, value: trimmed };
      },
    };

    it('should process valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
      ];

      validEmails.forEach((email) => {
        const result = complexParam.processor(email);
        expect(result.isSuccess).toBe(true);
        if (!result.isSuccess) {
          throw new Error('Expected success');
        }
        expect(result.value).toBe(email);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user@.com',
        'user@example.',
        'user space@example.com',
        'user@@example.com',
      ];

      invalidEmails.forEach((email) => {
        const result = complexParam.processor(email);
        expect(result.isSuccess).toBe(false);
        if (result.isSuccess) {
          throw new Error('Expected failure');
        }
        expect(result.errorMessage).toBe('Please enter a valid email address');
      });
    });

    it('should reject emails that are too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = complexParam.processor(longEmail);

      expect(result.isSuccess).toBe(false);
      if (result.isSuccess) {
        throw new Error('Expected failure');
      }
      expect(result.errorMessage).toBe('Email address is too long');
    });
  });

  describe('parameter type safety', () => {
    it('should maintain type safety for success results', () => {
      const stringParam: Parameter<string> = {
        name: 'test',
        helpMessage: 'test',
        processor: (_value: string) => ({ isSuccess: true, value: 'test' }),
      };

      const result = stringParam.processor('input');

      if (!result.isSuccess) {
        throw new Error('Expected success');
      }
      // TypeScript should know this is a string
      expect(typeof result.value).toBe('string');
      expect(result.value.length).toBeDefined();
    });

    it('should maintain type safety for error results', () => {
      const stringParam: Parameter<string> = {
        name: 'test',
        helpMessage: 'test',
        processor: (_value: string) => ({
          isSuccess: false,
          errorMessage: 'error',
        }),
      };

      const result = stringParam.processor('input');

      if (result.isSuccess) {
        throw new Error('Expected failure');
      }
      // TypeScript should know this is an error message
      expect(typeof result.errorMessage).toBe('string');
      expect(result.errorMessage.length).toBeDefined();
    });
  });

  describe('parameter metadata', () => {
    it('should have correct name and help message', () => {
      const param: Parameter<number> = {
        name: 'userId',
        helpMessage: 'Please enter your user ID',
        processor: (value: string) => ({
          isSuccess: true,
          value: parseInt(value),
        }),
      };

      expect(param.name).toBe('userId');
      expect(param.helpMessage).toBe('Please enter your user ID');
    });

    it('should allow different parameter names', () => {
      const params = [
        { name: 'stopId', helpMessage: 'Enter stop ID' },
        { name: 'routeNumber', helpMessage: 'Enter route number' },
        { name: 'direction', helpMessage: 'Enter direction' },
      ];

      params.forEach((param) => {
        expect(param.name).toBeDefined();
        expect(param.helpMessage).toBeDefined();
        expect(typeof param.name).toBe('string');
        expect(typeof param.helpMessage).toBe('string');
      });
    });
  });
});
