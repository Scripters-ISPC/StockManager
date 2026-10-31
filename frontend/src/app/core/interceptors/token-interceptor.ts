import {
  HttpBackend,
  HttpClient,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import {
  Observable,
  catchError,
  finalize,
  map,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

import { API_BASE_URL } from '../config/api.config';

interface RefreshResponse {
  access: string;
}

let refreshRequest$: Observable<string> | null = null;

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const httpBackend = inject(HttpBackend);
  const isApiRequest = req.url.startsWith(API_BASE_URL);
  const isAuthRequest = req.url.includes('/usuarios/login/');

  if (!isApiRequest) {
    return next(req);
  }

  const accessToken = localStorage.getItem('access_token');
  const authorizedRequest = accessToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authorizedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isAuthRequest) {
        return throwError(() => error);
      }

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        clearSessionAndRedirect(router);
        return throwError(() => error);
      }

      return refreshAccessToken(refreshToken, httpBackend).pipe(
        switchMap((newAccessToken) =>
          next(req.clone({
            setHeaders: { Authorization: `Bearer ${newAccessToken}` },
          })),
        ),
        catchError((refreshError) => {
          clearSessionAndRedirect(router);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};

function refreshAccessToken(
  refreshToken: string,
  httpBackend: HttpBackend,
): Observable<string> {
  if (refreshRequest$) {
    return refreshRequest$;
  }

  const refreshClient = new HttpClient(httpBackend);
  const refreshUrl = `${API_BASE_URL}/usuarios/login/refresh/`;

  refreshRequest$ = refreshClient.post<RefreshResponse>(refreshUrl, {
    refresh: refreshToken,
  }).pipe(
    map((response) => response.access),
    map((accessToken) => {
      if (!accessToken) {
        throw new Error('La respuesta de refresh no contiene un access token.');
      }
      return accessToken;
    }),
    tap((accessToken) => localStorage.setItem('access_token', accessToken)),
    // shareReplay permite que varias peticiones 401 compartan un único refresh.
    finalize(() => {
      refreshRequest$ = null;
    }),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  return refreshRequest$;
}
function clearSessionAndRedirect(router: Router) {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('usuario');
  void router.navigate(['/login']);
}
