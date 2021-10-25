import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {User} from "./_models/user";
import {AccountService} from "./_services/account.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'The Dating App';
  users: any; // users variable with no type specified

  constructor(private http: HttpClient, private accountService: AccountService) {
  }

  ngOnInit(){
    this.setCurrentUser();
  }

  setCurrentUser(){
    // appena avviata l'app vedo se nel localstorage c'è già salvato l'utente (ovvero se l'utente non ha fatto il logout); se così lo inserisco nell'observable
    // @ts-ignore
    const user: User = JSON.parse(localStorage.getItem("user"));
    this.accountService.setCurrentUser(user);
  }
}
