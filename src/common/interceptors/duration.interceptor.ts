import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';

@Injectable()
export class DurationInterceptor implements NestInterceptor {
    private readonly logger = new Logger(DurationInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.url;
        this.logger.warn(`[${method}] ${url} - Request received, starting duration timer (WARN_LEVEL).`);

        const now = Date.now();

        return next
            .handle()
            .pipe(
                tap(() => {
                    const response = context.switchToHttp().getResponse();
                    const statusCode = response.statusCode;
                    this.logger.log(
                        `[${method}] ${url} - Status: ${statusCode} - Duration: ${Date.now() - now}ms (logged in tap)`,
                    );
                }),
                finalize(() => {
                    this.logger.warn(
                        `[${method}] ${url} - Request finalized. Total time since interceptor start: ${Date.now() - now}ms (logged in finalize - WARN_LEVEL)`,
                    );
                }),
            );
    }
}
