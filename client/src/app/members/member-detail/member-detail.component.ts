import { Component, OnInit } from '@angular/core';
import {MembersService} from "../../_services/members.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Member} from "../../_models/member";
import {NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions} from "@kolkov/ngx-gallery";

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
  // @ts-ignore
  member: Member;
  // @ts-ignore
  galleryOptions: NgxGalleryOptions[];
  // @ts-ignore
  galleryImages: NgxGalleryImage[];

  constructor(private memberService: MembersService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.loadMember();

    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
      }
    ]
  }

  getImages(): NgxGalleryImage[]{
    const imageUrls = [];
    for (const photo of this.member.photos) {
      imageUrls.push({
        small: photo?.url,
        medium: photo?.url,
        big: photo?.url
      })
    }
    return imageUrls;
  }

  loadMember() {
    // @ts-ignore
    this.memberService.getMember(this.route.snapshot.paramMap.get('username')).subscribe(member => { // al metodo getMember passo una stringa (lo username che è come parametro nell'url .../members/lisa)
      this.member = member;
      this.galleryImages = this.getImages();
    })
  }

}
