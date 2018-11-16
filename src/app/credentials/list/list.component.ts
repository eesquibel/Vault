import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AngularFirestoreCollection } from 'angularfire2/firestore';
import { map } from 'rxjs/operators';

import { Credential } from '../../model/credential';
import { StoreService } from '../../service/store.service';
import { AuthenticationService } from './../../service/authentication.service';
import { CryptoService } from './../../service/crypto.service';

@Component({
  selector: 'app-credentials-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class CredentialsListComponent implements OnInit, AfterViewInit {

  protected list: AngularFirestoreCollection<Credential>;

  public List: Credential[];

  constructor(private auth: AuthenticationService, private store: StoreService, private crypto: CryptoService) {
  }

  ngOnInit() {
    this.auth.user.subscribe(user => {
      if (user) {
        this.list = this.store.Get<Credential>(user.uid);
        this.list.snapshotChanges().pipe(map(actions => {
          return actions.map(action => {
            return new Credential(this.crypto, action.payload.doc.data(), action.payload.doc.id);
          });
        })).subscribe(values => {
          this.List = new Array<Credential>();
          for (const value of values) {
            this.List.push(value);
          }
        });
      }
    });
  }

  ngAfterViewInit(): void {
  }

}
