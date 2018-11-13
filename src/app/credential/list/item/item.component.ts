import { AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { StoreService } from './../../../service/store.service';
import { Credential } from './../../../model/credential';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

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

  protected mode: 'blank' | 'view' | 'edit';

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
