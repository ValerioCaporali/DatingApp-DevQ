import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable, of} from "rxjs";
import {Member} from "../_models/member";
import {map, take} from "rxjs/operators";
import {PaginatedResult} from "../_models/pagination";
import {UserParams} from "../_models/userParams";
import {AccountService} from "./account.service";
import {User} from "../_models/user";
import {getPaginatedResult, getPaginationHeaders} from "./paginationHelper";

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl;
  // invece di fare ogni volta una nuova richiesta, quando richiedo tutti gli utenti li salvo su questo array, ed utilizzo questo per andare a fare altre operazioni (come ad esempio cercare uno specifico utente)
  members: Member[] = [];
  // qui salvo sia i parametri richiesti che il risultato, quando l'utente fa una richiesta controllo se i parametri che invia sono presenti qui, se lo sono il risultato lo ritorno direttamente da qui
  memberCache = new Map();

  user:User;
  userParams: UserParams;

  constructor(private http: HttpClient, private accountService:AccountService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
      this.user = user;
      this.userParams = new UserParams(user);
    })
  }

  getUserParams() {
    return this.userParams;
  }

  setUserParams(params: UserParams) {
    this.userParams = params;
  }

  resetUserParams() {
    this.userParams = new UserParams(this.user);
    return this.userParams;
  }

  getMembers(userParams: UserParams) {

    var response = this.memberCache.get(Object.values(userParams).join('-'));
    if (response) {
      return of(response);
    }

    let params = getPaginationHeaders(userParams.pageNumber, userParams.pageSize);

    params = params.append('minAge', userParams.minAge.toString());
    params = params.append('maxAge', userParams.maxAge.toString());
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);

    return getPaginatedResult<Member[]>(this.baseUrl + 'users', params, this.http).pipe(
    map(response => {
      this.memberCache.set(Object.values(userParams).join('-'), response);
      return response;
    })
    )
  }

  getMember(username: string) {
    const member = [...this.memberCache.values()]
      .reduce((arr, elem) => arr.concat(elem.result), [])
      .find((member: Member) => member.username === username);

    if (member) {
      return of(member);
    }

    // const member = this.members.find(x => x.username === username);
    // if (member !== undefined) return of(member); // se trovo l'utente nell'array lo ritorno direttamente dall'array (uso la funzione of perch?? ?? un observable e perci?? posso farci il subscribe allo stesso modo)
    return this.http.get<Member>(this.baseUrl + 'users/' + username); // altrimenti faccio la richiesta http.get
  }

  updateMember(member: Member) {
    // oltre ad inserire i cambiamenti nel database, aggiorno anche l'array, cos?? ?? aggiornato e lo posso utilizzare per le richieste/operazioni future
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

  addLike(username: string) {
    return this.http.post(this.baseUrl + 'likes/' + username, {})
  }

  // @ts-ignore
  getLikes(predicate: string, pageNumber, pageSize) {
    let params = getPaginationHeaders(pageNumber, pageSize);
    params = params.append('predicate', predicate);
    return getPaginatedResult<Partial<Member[]>>(this.baseUrl + 'likes', params, this.http);
  }

}
