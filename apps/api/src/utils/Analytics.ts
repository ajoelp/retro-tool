import {Express} from "express";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import {User} from "@prisma/client";

export class Analytics {

  constructor(private app: Express) {
    this.enableSentry()
  }

  static init(app: Express) {
    return new Analytics(app)
  }

  private enableSentry() {
    if(!process.env.SENTRY_DSN) return
    console.log('[Analytics] Enabling sentry')
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Tracing.Integrations.Express({ app: this.app })
      ],
      tracesSampleRate: 0.50
    })

    this.app.use(Sentry.Handlers.requestHandler());
    this.app.use(Sentry.Handlers.tracingHandler());
  }

  static sentryErrors(app: Express) {
    if(!process.env.SENTRY_DSN) return
    app.use(Sentry.Handlers.errorHandler())
  }

  static handleSentryError(error: any) {
    if(!process.env.SENTRY_DSN) return
    Sentry.captureException(error);
  }

  static attachContext(user: User) {
    this.attachSentryContext(user);
  }

  private static attachSentryContext(user: User) {
    if(!process.env.SENTRY_DSN) return
    Sentry.setUser(user)
  }
}
