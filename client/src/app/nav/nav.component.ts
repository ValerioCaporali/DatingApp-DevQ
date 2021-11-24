import {Component, OnInit} from '@angular/core';
import {AccountService} from "../_services/account.service";
import {Observable} from "rxjs";
import {User} from "../_models/user";
import {Router} from "@angular/router";
import {Toast, ToastrService} from "ngx-toastr";
import {take} from "rxjs/operators";
import {MessageService} from "../_services/message.service";
import {Message} from "../_models/message";
import {Pagination} from "../_models/pagination";
import {PresenceService} from "../_services/presence.service";

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  model: any = {}
  user: User;
  messages: Message[] = [];
  pagination: Pagination;
  container = 'Unread';
  pageNumber = 1;
  pageSize = 5;
  totalUnreadMessages: number;
  onlineUsers: number;

  // @ts-ignore
  constructor(public accountService: AccountService, private router: Router, private toastr: ToastrService, private messageService: MessageService, public presence: PresenceService) { }

  ngOnInit(): void {
    /*this.messageService.unreadMessages$.subscribe(res => {
      console.log(this.messageService.unreadMessages$);
      this.totalUnreadMessages = res.length;
      console.log(this.totalUnreadMessages);
    })*/
  }

  login() {
    this.accountService.login(this.model).subscribe(response => {
      this.router.navigate(['/members'], {queryParams: {login: true}}); // quando mi loggo voglio visualizzare la pagina members
      this.toastr.success("Login effettuato con successo, Benvenuto " + this.accountService.username.charAt(0).toUpperCase() + this.accountService.username.slice(1));
      this.accountService.currentUser$.pipe(take(1)).subscribe(user => this.user = user);
      if (!this.user.photoUrl) this.toastr.info("Non hai ancora una immagine di profilo");
    }, error => {
      console.log(error);
      // this.toastr.error(error.error); // uso un toast per mostrare l'errore che arriva dal server API
    })
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl("/"); // quando faccio il logout voglio ritornare alla homepage
    this.toastr.info("Logout effettuato con successo");
  }
}
