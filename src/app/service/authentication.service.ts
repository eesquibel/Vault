import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { User } from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  public get user(): Observable<User> {
    return this.fireAuth.authState;
  }

  public get isLoggedIn(): boolean {
    return this.details !== null;
  }

  public details: User = null;

  constructor(private fireAuth: AngularFireAuth) {
    this.user.subscribe(user => {
      if (user) {
        this.details = user;
        console.log(user);
      } else {
        this.details = null;
      }
    });
  }

  public signin(): void {
    this.fireAuth.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
  }

  public signout(): Promise<void> {
    return this.fireAuth.auth.signOut().then(res => {
      console.log(res);
      this.details = null;
    });
  }

}
