import { Component, OnInit } from '@angular/core';
import { AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs';

import { Credential } from '../../model/credential';
import { StoreService } from '../../service/store.service';
import { AuthenticationService } from './../../service/authentication.service';
import { CryptoService } from './../../service/crypto.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  private list: AngularFirestoreCollection<Credential>;

  public List: Credential[]; // IterableIterator<Credential>;

  constructor(private auth: AuthenticationService, private store: StoreService, private crypto: CryptoService) {
    this.auth.user.subscribe(user => {
      if (user) {
        this.list = this.store.Get<Credential>(user.uid);
        this.list.valueChanges().subscribe(values => {
          this.List = new Array<Credential>();
          for (const value of values) {
            this.List.push(new Credential(this.crypto, value));
          }
        });
      }
    });
  }

  private* convert(values: Credential[]) {
    for (const value of values) {
      const credential = new Credential(this.crypto, value);
      yield credential;
    }
  }

  ngOnInit() {
  }

  public Save(item: Credential) {

  }
}
