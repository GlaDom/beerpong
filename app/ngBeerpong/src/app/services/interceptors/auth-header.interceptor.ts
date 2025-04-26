import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { inject } from '@angular/core';

export const authHeaderInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).authToken;
  console.log('auth header interceptor hit');
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(req);
};
