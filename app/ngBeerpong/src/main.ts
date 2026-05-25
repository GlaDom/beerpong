import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppComponent } from './app/app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAuth0 } from '@auth0/auth0-angular';
import { ENVIRONMENT } from './app/services/env/environment.service';
import { environment } from './environments/environment';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import { routes } from './app.routes';
import { authHeaderInterceptor } from './app/services/interceptors/auth-header.interceptor';

const SKBeerpongPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#f0ffe0',
      100: '#e0ffb0',
      200: '#cafe82',
      300: '#b2f55e',
      400: '#a4f047',
      500: '#9EF53C',
      600: '#7ACC28',
      700: '#5a9e15',
      800: '#407510',
      900: '#2c530b',
      950: '#1a3306',
    },
    colorScheme: {
      light: {
        primary: {
          color:        '#7ACC28',
          contrastColor: '#0C0E0B',
          hoverColor:   '#5a9e15',
          activeColor:  '#407510',
        },
        highlight: {
          background:      'rgba(158, 245, 60, 0.15)',
          focusBackground: 'rgba(158, 245, 60, 0.25)',
          color:           '#5a9e15',
          focusColor:      '#407510',
        },
        surface: {
          0:   '#F4F6F0',
          50:  '#FFFFFF',
          100: '#ECEEED',
          200: '#E2E5DF',
          300: '#d0d5cc',
          400: '#b8c0b4',
          500: '#a0ab9c',
          600: '#889684',
          700: '#4E5A4B',
          800: '#2e3a2b',
          900: '#1a2318',
          950: '#0C0E0B',
        }
      },
      dark: {
        primary: {
          color:        '#a4f047',
          contrastColor: '#0C0E0B',
          hoverColor:   '#b2f55e',
          activeColor:  '#cafe82',
        },
        highlight: {
          background:      'rgba(158, 245, 60, 0.15)',
          focusBackground: 'rgba(158, 245, 60, 0.25)',
          color:           '#a4f047',
          focusColor:      '#b2f55e',
        },
        surface: {
          0:   '#0C0E0B',
          50:  '#161A15',
          100: '#1E231C',
          200: '#252C23',
          300: '#2e372b',
          400: '#3a4537',
          500: '#475443',
          600: '#8A9688',
          700: '#a8b4a4',
          800: '#c8d0c5',
          900: '#e0e5dc',
          950: '#F0F5EC',
        }
      }
    }
  }
});

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserAnimationsModule),
    importProvidersFrom(BrowserModule),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authHeaderInterceptor])
    ),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: SKBeerpongPreset,
        options: {
          darkModeSelector: '.my-app-dark'
        }
      }
    }),
    provideAuth0({
      domain: 'dev-nduro5lf8x5ddjgj.eu.auth0.com',
      clientId: 'f5We2HLhj4JInznJZHZYY6eXDz6I3AEz',
      authorizationParams: {
        redirect_uri: 'https://skbeerpong.com:4200/callback',
        audience: 'https://skbeerpongtst.com/api',
      }
    }),
    {
      provide: ENVIRONMENT,
      useValue: environment
    }
  ]
}).catch(err => console.error(err));
