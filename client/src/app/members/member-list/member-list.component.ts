import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {AccountService} from "../../_services/account.service";
import {trigger, state, style, animate, transition} from "@angular/animations";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MembersService} from "../../_services/members.service";
import {Member} from "../../_models/member";
import {Observable} from "rxjs";

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
  members$: Observable<Member[]>;

  constructor(private memberService: MembersService) { }

  ngOnInit(): void {
    this.members$ = this.memberService.getMembers();
  }

}
