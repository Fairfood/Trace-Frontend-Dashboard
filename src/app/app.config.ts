import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
} from '@angular/core';
import { JwtModule } from '@auth0/angular-jwt';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AuthService } from './feature/authentication/auth.service';
import { AppRoutes } from './app-routing.module';
import { ErrorInterceptorService } from './shared/service/error.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHttpClient(),
    provideRouter(AppRoutes),
    importProvidersFrom([
      JwtModule.forRoot({
        config: {
          tokenGetter: () => localStorage.getItem('id_token'),
        },
      }),
    ]),
    {
      provide: APP_INITIALIZER,
      useFactory: initializerFactory,
      multi: true,
      deps: [AuthService],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptorService,
      multi: true,
    },
  ],
};

export function initializerFactory(authService: AuthService) {
  return () => authService.refreshToken();
}
