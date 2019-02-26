import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';

/**
 * Prefixes all requests with `environment.serverUrl`.
 */
@Injectable()
export class ApiPrefixInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    //ALLOWING EXTERNAL REQUESTS FOR BOILERPLATE
    console.error("===== ALLOWING EXTERNAL REQUESTS FOR BOILERPLATE IN api-prefix.interceptor.ts LINE 17-19 =====");
    if (request.url.substr(0, 4) !== 'http') {
      request = request.clone({ url: environment.serverUrl + request.url });
    } 
    return next.handle(request);
  }

}
