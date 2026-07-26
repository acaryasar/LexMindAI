import * as Sentry from '@sentry/node';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class SentryService implements OnModuleInit {
  onModuleInit() {
    if (process.env.SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: 1.0,
        profilesSampleRate: 1.0,
        beforeSend(event, hint) {
          // Filter out sensitive data
          if (event.request) {
            delete event.request.cookies;
            delete event.request.headers?.authorization;
            delete event.request.headers?.cookie;
          }
          return event;
        },
      });
    }
  }

  captureException(exception: any, context?: string) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setTag('context', context);
      }
      Sentry.captureException(exception);
    });
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: string) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setTag('context', context);
      }
      Sentry.captureMessage(message, level);
    });
  }

  setUser(user: { id: string; email: string; role?: string }) {
    Sentry.setUser(user);
  }

  clearUser() {
    Sentry.setUser(null);
  }
}
