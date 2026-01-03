// src/app/interceptors/auth.interceptor.ts

import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    // 1. Skip adding JWT to login request
    if (req.url.includes('/api/auth/login')) {
      return next.handle(req);
    }

    // 2. Get JWT from localStorage
    const token = localStorage.getItem('token');

    // 3. If token exists, clone request and add Authorization header
    if (token) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(authReq);
    }

    // 4. No token → proceed without header
    return next.handle(req);
  }
}