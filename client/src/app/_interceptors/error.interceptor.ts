import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {NavigationExtras, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {catchError} from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router, private toastr: ToastrService) {
  } // uso il router perchè per alcuni tipi di errori indirizzerò l'utente ad una pagina di errore

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError(error => {
        if (error) {
          switch (error.status) {
            case 400:
              if (error.error.errors) {
                const modalStateErrors = [];
                for (const key in error.error.errors) {
                  if (error.error.errors[key]) {
                    modalStateErrors.push(error.error.errors[key]);
                  }
                }
                throw modalStateErrors.flat();
              } else if (typeof(error.error) === 'object'){
                this.toastr.error(error.error.title, error.status);
              } else {
                this.toastr.error(error.error, error.status);
              }
              break;

            case 401:
              this.toastr.error(error.error, error.status);
              break;

            case 404:
              this.toastr.error(error.error.status, error.error.title);
              this.router.navigateByUrl('/not-found');
              break;

            case 500:
              const navigationExtras: NavigationExtras = {state: {error: error.error}};
              this.router.navigateByUrl('/server-error', navigationExtras);
              break;

            default:
              this.toastr.error("Something unexpected went wrong");
              console.log(error); // se non è nessuno degli errori sopra stampo in console l'errore per vedere cosa è
              break;
          }
        }
        return throwError(error);
      })
    )
  }
}
