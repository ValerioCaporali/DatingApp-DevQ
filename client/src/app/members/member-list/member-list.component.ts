import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {AccountService} from "../../_services/account.service";
import {trigger, state, style, animate, transition} from "@angular/animations";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MembersService} from "../../_services/members.service";
import {Member} from "../../_models/member";
import {Observable} from "rxjs";
import {Pagination} from "../../_models/pagination";

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
  pageNumber = 1;
  pageSize = 5;

  constructor(private memberService: MembersService) { }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.getMembers(this.pageNumber, this.pageSize).subscribe(response => {
      this.members = response.result;
      this.pagination = response.pagination;
    })
  }

  pageChanged(event: any) {
    this.pageNumber = event.page; // quando clicco il numero di un altra pagina, faccio una nuova richiesta passando quel numero
    this.loadMembers();
  }

}
