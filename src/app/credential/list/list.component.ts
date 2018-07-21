import { CryptoService } from './../../service/crypto.service';
import { AuthenticationService } from './../../service/authentication.service';
import { Component, OnInit } from '@angular/core';
import { StoreService } from '../../service/store.service';
import { Observable } from 'rxjs';
import { Credential } from '../../model/credential';
import { AngularFirestoreCollection } from 'angularfire2/firestore';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  private list: AngularFirestoreCollection<Credential>;

  public List: Observable<Credential[]>;

  constructor(private auth: AuthenticationService, private store: StoreService, private crypto: CryptoService) {
    this.auth.user.subscribe(user => {
      if (user) {
        this.list = this.store.Get<Credential>(user.uid);
        this.List = this.list.valueChanges();
      }
    });
  }

  ngOnInit() {
  }

  public Save(item: Credential) {

  }
}
