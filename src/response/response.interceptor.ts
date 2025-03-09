import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export type Response<T> = {
  status: boolean;
  statusCode: number;
  //path: string;
  message: string | object;
};

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((res: unknown) => this.responseHandler(res, context)),
      catchError((err: HttpException) =>
        throwError(() => this.errorHandler(err, context)),
      ),
    );
  }

  errorHandler(exception: HttpException, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Handle validation errors
    let message: string | object = exception.message;
    if (exception instanceof BadRequestException) {
      const responseMessage = exception.getResponse();
      if (typeof responseMessage === 'object' && responseMessage['message']) {
        message = responseMessage['message']; // Extract validation errors
      }
    }

    response.status(status).json({
      status: false,
      statusCode: status,
      //path: request.url,
      message,
    });
  }

  responseHandler(res: any, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const statusCode = response.statusCode;

    return {
      status: true,
      statusCode,
      //path: request.url,
      message: '',
      data: res,
    };
  }
}
