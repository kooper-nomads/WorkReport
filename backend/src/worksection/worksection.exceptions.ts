import { HttpException, HttpStatus } from '@nestjs/common';

export class WorksectionApiException extends HttpException {
  readonly retryable: boolean;

  constructor(action: string, reason: string, retryable = false) {
    super(`Worksection API request "${action}" failed: ${reason}`, HttpStatus.BAD_GATEWAY);
    this.retryable = retryable;
  }
}
