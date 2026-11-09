import { ApplicationConfig, inject, InjectionToken, provideBrowserGlobalErrorListeners, provideExperimentalWebMcpTools } from '@angular/core';
import { HttpInterceptorFn, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideClientHydration, withEventReplay, withIncrementalHydration } from '@angular/platform-browser';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { routes } from './app.routes';
import { DATA_TOOLS } from './core/webmcp/data-tools';
import { STORE_TOOLS } from './core/webmcp/store-tools';

/** Absolute API origin, provided only on the server; the browser uses same-origin /api (proxied). */
export const API_ORIGIN = new InjectionToken<string>('API_ORIGIN', { factory: () => '' });

const apiOrigin: HttpInterceptorFn = (req, next) => {
  const origin = inject(API_ORIGIN);
  return next(origin && req.url.startsWith('/api/') ? req.clone({ url: origin + req.url }) : req);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // index.html loads Material Symbols, not the legacy Material Icons font.
    { provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-symbols-outlined' } },
    provideHttpClient(withFetch(), withInterceptors([apiOrigin])),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
    provideExperimentalWebMcpTools([...STORE_TOOLS, ...DATA_TOOLS]),
  ],
};
