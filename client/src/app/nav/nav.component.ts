import {Component, OnInit} from '@angular/core';
import {AccountService} from "../_services/account.service";
import {Observable} from "rxjs";
import {User} from "../_models/user";
import {Router} from "@angular/router";
import {Toast, ToastrService} from "ngx-toastr";
import {take} from "rxjs/operators";

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  model: any = {}
  user: User;

  // @ts-ignore
  constructor(public accountService: AccountService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void { }

  login() {
    this.accountService.login(this.model).subscribe(response => {
      this.router.navigate(['/members'], {queryParams: {login: true}}); // quando mi loggo voglio visualizzare la pagina members
      this.toastr.success("Login effettuato con successo, Benvenuto " + this.accountService.username.charAt(0).toUpperCase() + this.accountService.username.slice(1));
      this.accountService.currentUser$.pipe(take(1)).subscribe(user => this.user = user);
      if (!this.user.photoUrl) this.toastr.info("Non hai ancora una immagine di profilo");
    }, error => {
      console.log(error);
      this.toastr.error(error.error); // uso un toast per mostrare l'errore che arriva dal server API
    })
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl("/"); // quando faccio il logout voglio ritornare alla homepage
    this.toastr.info("Logout effettuato con successo");
  }
}
