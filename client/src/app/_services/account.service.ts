import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";
import {User} from "../_models/user";
import {HttpClientModule} from "@angular/common/http";
import {Observable, ReplaySubject} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;

  // creo un observable per contenere l'utente
  private currentUserSource = new ReplaySubject<User>(1) // 1 indica il numero di valori che l'obsevable deve memorizzare
  currentUser$ = this.currentUserSource.asObservable()
  username = '';

  constructor(private http: HttpClient) {
  }

  // funzione per la richiesta http del login
  login(model: any) {
    return this.http.post<User>(this.baseUrl + 'account/login', model).pipe( // model rappresenta il body, contiene username e password inseriti nel form di login
      map((response: User) => {
        const user = response;
        this.username = user.username;
        if (user) {
          this.setCurrentUser(user);
        }
      })
    )
  }

  //funzione per la richiesta http della registrazione
  register(model: any) {
    return this.http.post<User>(this.baseUrl + 'account/register', model).pipe( // model rappresenta il body, contiene username e password inseriti nel form di registrazione
      map((response: User) => {
        const user = response;
        this.username = user.username;
        if (user) {
          this.setCurrentUser(user);
        }
      })
    )
  }

  // funzione per settare l'utente
  setCurrentUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  // funzione per rimuovere l'utente corrente
  logout() {
    localStorage.removeItem('user');
    // @ts-ignore
    this.currentUserSource.next(null);
  }
}
