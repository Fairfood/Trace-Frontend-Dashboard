import { enableProdMode } from '@angular/core';
import * as Sentry from '@sentry/angular-ivy';

import { environment } from './environments/environment';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

if (environment.production) {
  enableProdMode();

  Sentry.init({
    environment: environment.sentryEnv,
    dsn: environment.sentryDsn,
  });
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err: Error) => console.error(err));
