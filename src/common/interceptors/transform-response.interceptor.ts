import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { SuccessResponse } from '@/shared';
import { Reflector } from '@nestjs/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<SuccessResponse<T>> {
    return next.handle().pipe(
      map((data: any) => {
        const message =
          this.reflector.get<string>('response_message', _context.getHandler()) || 'success';
        const meta = data?.meta;
        const payload = data?.data !== undefined ? data.data : data;

        const response: SuccessResponse<T> = {
          status: 'success',
          message,
          data: payload,
        };

        if (meta) {
          response.meta = meta;
        }

        return response;
      }),
    );
  }
}
