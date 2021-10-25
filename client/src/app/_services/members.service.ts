import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable, of} from "rxjs";
import {Member} from "../_models/member";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl;
  // invece di fare ogni volta una nuova richiesta, quando richiedo tutti gli utenti li salvo su questo array, ed utilizzo questo per andare a fare altre operazioni (come ad esempio cercare uno specifico utente)
  members: Member[] = [];

  constructor(private http: HttpClient) { }

  getMembers() {
    if (this.members.length > 0) return of(this.members); // se l'array è gia popolato vuoldire che ho già richiesto tutti gli utenti, perciò invece di fare una nuova richiesta ritorno direttamente l'array
    return this.http.get<Member[]>(this.baseUrl + 'users').pipe(
      map(members => {
        this.members = members; // se l'array non era popolato allora faccio la get e il risultato lo metto nell'array per le prossime richieste/operazioni
        return members;
      })
    )
  }

  getMember(username: string) {
    const member = this.members.find(x => x.username === username);
    if (member !== undefined) return of(member); // se trovo l'utente nell'array lo ritorno direttamente dall'array (uso la funzione of perchè è un observable e perciò posso farci il subscribe allo stesso modo)
    return this.http.get<Member>(this.baseUrl + 'users/' + username); // altrimenti faccio la richiesta http.get
  }

  updateMember(member: Member) {
    // oltre ad inserire i cambiamenti nel database, aggiorno anche l'array, così è aggiornato e lo posso utilizzare per le richieste/operazioni future
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    )
  }

  setMainPhoto(photoId: number) {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId, {});
  }

}
