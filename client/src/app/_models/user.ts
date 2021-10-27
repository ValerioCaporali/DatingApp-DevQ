import { bufferToggle } from "rxjs/operators";

export interface User {
  username: string;
  token: string;
  photoUrl: string;
  knownAs: string;
  gender: string;
}
