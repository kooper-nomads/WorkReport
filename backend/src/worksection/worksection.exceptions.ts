import { HttpException, HttpStatus } from '@nestjs/common';

export class WorksectionApiException extends HttpException {
  constructor(action: string, reason: string) {
    super(`Worksection API request "${action}" failed: ${reason}`, HttpStatus.BAD_GATEWAY);
  }
}
