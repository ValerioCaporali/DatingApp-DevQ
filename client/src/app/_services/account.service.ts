import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";
import {User} from "../_models/user";
import {HttpClientModule} from "@angular/common/http";
import {Observable, ReplaySubject} from "rxjs";
import {environment} from "../../environments/environment";
import {PresenceService} from "./presence.service";

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;

  // creo un observable per contenere l'utente
  private currentUserSource = new ReplaySubject<User>(1) // 1 indica il numero di valori che l'obsevable deve memorizzare
  currentUser$ = this.currentUserSource.asObservable()
  username = '';

  constructor(private http: HttpClient, private presence: PresenceService) {
  }

  // funzione per la richiesta http del login
  login(model: any) {
    return this.http.post<User>(this.baseUrl + 'account/login', model).pipe( // model rappresenta il body, contiene username e password inseriti nel form di login
      map((response: User) => {
        const user = response;
        this.username = user.username;
        if (user) {
          this.setCurrentUser(user);
          this.presence.createHubConnection(user);
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
          this.presence.createHubConnection(user);
        }
      })
    )
  }

  // funzione per settare l'utente
  setCurrentUser(user: User) {
    user.roles = [];
    const roles = this.getDecodedToken(user.token).role; // prendo i ruoli dal token
    Array.isArray(roles) ? user.roles = roles : user.roles.push(roles);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  // funzione per rimuovere l'utente corrente
  logout() {
    localStorage.removeItem('user');
    // @ts-ignore
    this.currentUserSource.next(null);
    this.presence.stopHubConnection();
  }

  // @ts-ignore
  getDecodedToken(token) {
    return JSON.parse(atob(token.split('.')[1]));
  }
}
