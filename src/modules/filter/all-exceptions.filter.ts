import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { ErrorResponseDto } from './errorResponse.dto';
import { FieldErrorDto } from './fieldError.dto';

interface SequelizeError {
  name: string;
  message: string;
  errors: Array<{ path: string; message: string }>;
  stack?: string;
}

interface ValidationError {
  name: string;
  message: string;
  stack?: string;
}

type ExceptionResponse = {
  message: string | string[];
  errors?: unknown;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<ExpressResponse>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (
      this.isSequelizeError(exception) ||
      this.isValidationError(exception) ||
      this.hasValidationMessage(exception)
    ) {
      status = HttpStatus.BAD_REQUEST;
    }

    // Log the error with appropriate level
    const message = this.getExceptionMessage(exception);
    const isServerError = status >= 500 && status < 600;
    if (isServerError) {
      this.logger.error(message, this.getStack(exception));
    } else {
      this.logger.warn(`Exception: ${message}`);
    }

    const responseBody = this.formatResponseBody(status, exception);

    response.status(status).json(responseBody);
  }

  private getExceptionMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (
        typeof response === 'object' &&
        response !== null &&
        'message' in response
      ) {
        const exceptionResponse = response as ExceptionResponse;
        return Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message.join(', ')
          : String(exceptionResponse.message);
      }
      return exception.message;
    }

    if (this.hasMessage(exception)) {
      return exception.message || 'Internal server error';
    }

    return 'Internal server error';
  }

  private formatResponseBody(
    status: number,
    exception: unknown
  ): ErrorResponseDto {
    this.logger.error(String(status));

    if (this.isSequelizeError(exception)) {
      const fieldErrors: FieldErrorDto[] = exception.errors.map((err) => ({
        field: err.path,
        message: err.message
      }));

      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation error',
        errors: fieldErrors
      };
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'object' && response !== null) {
        const exceptionResponse = response as ExceptionResponse;

        if (exceptionResponse && Array.isArray(exceptionResponse.message)) {
          return {
            statusCode: status,
            message: 'Validation error',
            errors: exceptionResponse.message as unknown as FieldErrorDto[]
          };
        }

        if (exceptionResponse && 'errors' in exceptionResponse) {
          return {
            statusCode: status,
            message:
              typeof exceptionResponse.message === 'string'
                ? exceptionResponse.message
                : 'Validation error',
            errors: exceptionResponse.errors as FieldErrorDto[]
          };
        }
      }

      return {
        statusCode: status,
        message: this.getExceptionMessage(exception)
      };
    }

    if (
      this.isValidationError(exception) ||
      this.hasValidationMessage(exception)
    ) {
      const message = this.hasMessage(exception)
        ? exception.message
        : 'Validation failed';

      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        errors: message as unknown as FieldErrorDto[]
      };
    }

    return {
      statusCode: status,
      message: this.getExceptionMessage(exception)
    };
  }

  private isSequelizeError(exception: unknown): exception is SequelizeError {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'name' in exception &&
      (exception.name === 'SequelizeValidationError' ||
        exception.name === 'SequelizeUniqueConstraintError') &&
      'errors' in exception &&
      Array.isArray((exception as SequelizeError).errors)
    );
  }

  private isValidationError(exception: unknown): exception is ValidationError {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'name' in exception &&
      exception.name === 'ValidationError'
    );
  }

  private hasValidationMessage(exception: unknown): boolean {
    return (
      this.hasMessage(exception) &&
      typeof exception.message === 'string' &&
      exception.message.toLowerCase().includes('validation')
    );
  }

  private hasMessage(exception: unknown): exception is { message: string } {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'message' in exception &&
      typeof (exception as { message: unknown }).message === 'string'
    );
  }

  private getStack(exception: unknown): string | undefined {
    return typeof exception === 'object' &&
      exception !== null &&
      'stack' in exception
      ? String((exception as { stack: unknown }).stack)
      : undefined;
  }
}
