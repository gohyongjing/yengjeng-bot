import { LoggerService } from '@core/logger/logger.service';
import { hasKey } from '@core/util/predicates';

export class ErrorService {
  private logger: LoggerService;

  constructor() {
    this.logger = new LoggerService();
  }

  handleError(error: unknown) {
    this.logger.error(
      `Error: ${error} \n
      Message: ${hasKey(error, 'message') ? error.message : ''} \n
      Stack: ${hasKey(error, 'stack') ? error.stack : ''}`,
    );
  }

  withErrorHandling(func: () => void) {
    try {
      func();
    } catch (error) {
      this.handleError(error);
    }
  }
}
