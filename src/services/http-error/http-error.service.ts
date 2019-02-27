import { Router } from '@angular/router';
import { Injectable, OnDestroy } from '@angular/core';
import { first } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ModalService } from '@services/modal/modal.service';

/**
 * Provides standard implementations for gracefully handling different types of
 * errors. Operation-specific error handling should be completed before invoking
 * any of the HttpErrorService error processing methods.
 */
@Injectable()
export class HttpErrorService implements OnDestroy {

  constructor(private modalService: ModalService, private router: Router) { }

  ngOnDestroy() { }

  /**
   * Processes an HTTP Service error in a default manner. Operation-specific
   * error handling should be done before calling this method, as it covers
   * all potential HTTP status codes. All errors here will redirect the user
   * to their Dashboard after notifying them of the error.
   * @param error The raw error object returned by the HTTP Service
   */
  standard(error: any, redirect: string = '/dashboard') {
    if (!error || error.status === 500) {
      this.modalService.unknownError()
        .pipe(first()).subscribe(() => {
          this.router.navigate([redirect]);
        });
    } else if (error.status > 500) {
      this.modalService.failure({ message: 'Unable To Contact Server. Check your internet connection.' }, { timeout: 3000 })
        .pipe(first()).subscribe(() => {
          this.router.navigate([redirect]);
        });
    } else if (!error.error || !error.error.message) {
      this.modalService.unknownError()
        .pipe(first()).subscribe(() => {
          this.router.navigate([redirect]);
        });
    } else {
      this.modalService.failure({ message: error.error.message }, { timeout: 3000 })
        .pipe(first()).subscribe(() => {
          this.router.navigate([redirect]);
        });
    }
  }
}
