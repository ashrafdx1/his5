import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const exceptionResponse: any =
      exception instanceof HttpException ? exception.getResponse() : null;

    const errorDetails =
      exceptionResponse && typeof exceptionResponse === 'object'
        ? exceptionResponse.message || exceptionResponse.error
        : null;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: Array.isArray(errorDetails) ? errorDetails[0] : message,
      details: Array.isArray(errorDetails) ? errorDetails : [errorDetails].filter(Boolean),
    };

    // Log errors for tracking
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} failed with status code ${status}. Error: ${exception.stack || exception}`,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} rejected with status code ${status}. Message: ${message}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
