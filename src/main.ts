import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from '@app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from '@app/app.routes';
import { loaderInterceptor } from '@shared/interceptors/loader.interceptor';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/styled';
import Lara from '@primeng/themes/lara';

const NominaTheme = definePreset(Lara, {
  semantic: {
    primary: {
      50: '#edf5ff',
      100: '#d7e8ff',
      200: '#b0d3ff',
      300: '#7db8ff',
      400: '#569fff',
      500: '#1e7bff',
      600: '#165fe6',
      700: '#154cc0',
      800: '#153f9a',
      900: '#15367d'
    }
  }
});

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([loaderInterceptor])
    ),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: NominaTheme,
        options: {
          darkModeSelector: 'body[data-theme="dark"]',
          cssLayer: {
            name: 'primeng'
          }
        }
      }
    })
  ]
})
.catch(err => console.error(err));
