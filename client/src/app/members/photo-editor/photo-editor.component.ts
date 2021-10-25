import {Component, Input, OnInit} from '@angular/core';
import {Member} from "../../_models/member";
import {FileUploader} from "ng2-file-upload";
import {environment} from "../../../environments/environment";
import {User} from "../../_models/user";
import {AccountService} from "../../_services/account.service";
import {take} from "rxjs/operators";
import {MembersService} from "../../_services/members.service";
import {Photo} from "../../_models/photo";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  // @ts-ignore
  @Input() member: Member;

  // @ts-ignore
  uploader: FileUploader;
  hasBaseDropzoneOver = false;
  baseUrl = environment.apiUrl;
  // @ts-ignore
  user: User;

  constructor(private accountService: AccountService, private memberService: MembersService, private toastr: ToastrService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => this.user = user);
  }

  ngOnInit(): void {
    this.initializeUploader();

  }

  fileOverBase(e: any) {
    this.hasBaseDropzoneOver = e;
  }

  setMainPhoto(photo: Photo) { // prendo la foto, faccio la richiesta http per renderla la main, poi aggiorno la variabile user di tipo User e la setto/aggiorno nell'observable con il metodo setCurrentUser
    this.memberService.setMainPhoto(photo.id).subscribe(() => {
      this.user.photoUrl = photo.url;
      this.accountService.setCurrentUser(this.user);
      this.member.photoUrl = photo.url; // aggiorno anche l'immagine main nella variabile locale member, per poter visualizzare nell'interfaccia quale foto è quella main
      this.member.photos.forEach(p => {
        if (p.isMain) p.isMain = false;
        if (p.id === photo.id) p.isMain = true;
      })
      this.toastr.success("Main photo successfully set");
    })
  }

  deletePhoto(photo: Photo) {
    this.memberService.deletePhoto(photo.id).subscribe(() => {
      this.member.photos = this.member.photos.filter(x => x.id !== photo.id)
      this.toastr.success("Photo successfully deleted");
    })
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: this.baseUrl + 'users/add-photo',
      authToken: 'Bearer ' + this.user.token,
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024 // 10MB
    });

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    }

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        const photo: Photo = JSON.parse(response);
        this.member.photos.push(photo);
        if (photo.isMain) {
          this.user.photoUrl = photo.url;
          this.member.photoUrl = photo.url;
          this.accountService.setCurrentUser(this.user);
        }
      }
    }

  }

}
