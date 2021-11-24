import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {getPaginatedResult, getPaginationHeaders} from "./paginationHelper";
import {Message} from "../_models/message";
import {HubConnection, HubConnectionBuilder} from "@aspnet/signalr";
import {User} from "../_models/user";
import {BehaviorSubject, Observable} from "rxjs";
import {take} from "rxjs/operators";
import {Group} from "../_models/group";

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = environment.apiUrl;
  hubUrl = environment.hubUrl;
  private hubConnection: HubConnection;
  private messageThreadSource = new BehaviorSubject<Message[]>([]);
  messageThread$ = this.messageThreadSource.asObservable();
  // cachedUnreadMessages: any[] = [];
  private unreadMessagesSource = new BehaviorSubject<Message[]>([]);
  unreadMessages$ = this.unreadMessagesSource.asObservable();
  unreadMessagesNumber: number;

  constructor(private http: HttpClient) {
  }

  createHubConnection(user: User, otherUsername: string) {
    this.hubConnection = new HubConnectionBuilder().withUrl(this.hubUrl + 'message?user=' + otherUsername, {
      accessTokenFactory: () => user.token
    })
      // .withAutomaticReconnect()
      .build()

    this.hubConnection.start().catch(error => console.log(error));

    this.hubConnection.on('ReceiveMessageThread', message => {
      this.messageThreadSource.next(message);
    })

    this.hubConnection.on('NewMessage', message => {
      this.messageThread$.pipe(take(1)).subscribe(messages => {
        this.messageThreadSource.next([...messages, message])
      })
    })

    this.hubConnection.on('ReadMessage', number => {
      console.log(number);
      this.unreadMessagesNumber = 1000;
      console.log(this.unreadMessagesNumber);
    })

    this.hubConnection.on('UpdatedGroup', (group: Group) => {
      if (group.connections.some(x => x.username === otherUsername)) {
        this.messageThread$.pipe(take(1)).subscribe(messages => {
          messages.forEach(message => {
            if (!message.dateRead) {
              message.dateRead = new Date(Date.now())
            }
          })
          this.messageThreadSource.next([...messages]);
        })
      }
    })

    this.hubConnection.on('UnreadMessagesNumber', (res) => {
      console.log(res);
    })
  }

  stopHubConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

  // @ts-ignore
  getMessages(pageNumber, pageSize, container) {
    let params = getPaginationHeaders(pageNumber, pageSize);
    params = params.append('Container', container);
    return getPaginatedResult<Message[]>(this.baseUrl + 'messages', params, this.http);
  }

  // @ts-ignore
  getUnreadMessages(pageNumber, pageSize) {
    let params = getPaginationHeaders(pageNumber, pageSize);
    params = params.append('Container', 'Unread');
    return getPaginatedResult<Message[]>(this.baseUrl + 'messages', params, this.http).subscribe(res => {
      // @ts-ignore
      console.log(res.result);
      this.unreadMessagesNumber = res.result.length;
      console.log(this.unreadMessagesNumber);
    })
  }

  getMessageThread(username: string) {
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + username);
  }

  async sendMessage(username: string, content: string) {
    return this.hubConnection.invoke('SendMessage', {recipientUsername: username, content})
      .catch(error => console.log(error));
  }

  deleteMessage(id: number) {
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }
}
