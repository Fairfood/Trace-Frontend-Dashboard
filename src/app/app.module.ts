import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HttpClientModule,
  HttpClient,
  HttpClientJsonpModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppRoutingModule } from './app-routing.module';
// components
import { AppComponent } from './app.component';
import { SnackBarComponent } from './shared/components/snack-bar/snack-bar.component';
// import ngx-translate and the http loader
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ErrorInterceptorService } from './shared/service/error.interceptor';
import { JwtModule } from '@auth0/angular-jwt';
import { AuthService } from './feature/authentication/auth.service';
import {
  MAT_RIPPLE_GLOBAL_OPTIONS,
  RippleGlobalOptions,
} from '@angular/material/core';

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}

export function initializerFactory(authService: AuthService) {
  return () => authService.refreshToken();
}

const globalRippleConfig: RippleGlobalOptions = {
  disabled: true,
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    MatSnackBarModule,
    HttpClientJsonpModule,
    SnackBarComponent,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    JwtModule.forRoot({
      config: {
        tokenGetter: () => localStorage.getItem('id_token'),
      },
    }),
  ],
  providers: [
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
    { provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: globalRippleConfig },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
