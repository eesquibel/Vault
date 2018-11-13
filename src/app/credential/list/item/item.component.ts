import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AngularFirestoreDocument } from 'angularfire2/firestore';

import { Credential } from './../../../model/credential';
import { StoreService } from './../../../service/store.service';

@Component({
  selector: 'app-list-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ListItemComponent implements OnInit {

  @Input('credential')
  public credential: Credential;

  @Input('doc')
  protected doc: AngularFirestoreDocument<Credential>;

  public mode: 'blank' | 'view' | 'edit';

  public form: FormGroup;

  constructor(private store: StoreService) {
  }

  ngOnInit() {
    this.form = new FormGroup(this.credential.Controls);
    this.mode = 'blank';
  }

  protected Save() {
    this.credential.Data = this.form.value;
    this.doc.set(this.credential.Save()).then(_ => {
      this.form.reset(this.credential.Data);
      this.mode = 'blank';
    });
  }

}
