import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {AccountService} from "../../_services/account.service";
import {trigger, state, style, animate, transition} from "@angular/animations";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MembersService} from "../../_services/members.service";
import {Member} from "../../_models/member";
import {Observable} from "rxjs";
import {Pagination} from "../../_models/pagination";
import {UserParams} from "../../_models/userParams";
import {take} from "rxjs/operators";
import {User} from "../../_models/user";

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateY(100%)'}),
        animate('1s ease-in', style({transform: 'translateY(0%)'}))
      ]),
      transition(':leave', [
        animate('1s ease-in', style({transform: 'translateY(-100%)'}))
      ])
    ])
  ]
})
export class MemberListComponent implements OnInit {
  // @ts-ignore
  members: Member[];
  pagination: Pagination;
  userParams: UserParams;
  user: User;
  genderList = [{value: 'male', display: 'Males'}, {value: 'female', display: 'Females'}];

  constructor(private memberService: MembersService) {
    this.userParams = this.memberService.getUserParams();
  }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.setUserParams(this.userParams);
    this.memberService.getMembers(this.userParams).subscribe(response => {
      this.members = response.result;
      this.pagination = response.pagination;
    })
  }

  resetFilters() {
    this.userParams = this.memberService.resetUserParams();
    this.loadMembers();
  }

  pageChanged(event: any) {
    this.userParams.pageNumber = event.page; // quando clicco il numero di un altra pagina, faccio una nuova richiesta passando quel numero
    this.memberService.setUserParams(this.userParams);
    this.loadMembers();
  }

}
