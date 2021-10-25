import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AccountService} from "../_services/account.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  registerMode = false;

  constructor(public accountService: AccountService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void { }

  registerToggle(){
    this.registerMode = !this.registerMode;
  }

  cancelRegisterMode(event: boolean){
    this.registerMode = event;
  }

}
