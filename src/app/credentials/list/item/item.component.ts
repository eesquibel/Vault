import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { AngularFirestoreDocument } from 'angularfire2/firestore';

import { Credential } from './../../../model/credential';
import { StoreService } from './../../../service/store.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

type modes = 'blank' | 'view' | 'edit';

@Component({
  selector: 'app-credentials-list-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class CredentialsListItemComponent implements OnInit {

  @Input('credential')
  public credential: Credential;

  @Input('doc')
  protected doc: AngularFirestoreDocument<Credential>;

  public mode: modes;

  public form: FormGroup;

  constructor(private store: StoreService, private modal: NgbModal) {
  }

  ngOnInit() {
    console.log(this.credential);
    this.form = new FormGroup(this.Controls());
    this.mode = 'blank';
  }

  public open(mode: modes, content: TemplateRef<any>) {
    this.mode = mode;
    this.modal.open(content);
  }


  private Controls(): {[key: string]: FormControl} {
    const controls = {};

    for (const key in this.credential.Data) {
      if (this.credential.Data.hasOwnProperty(key)) {
        controls[key] = new FormControl(this.credential.Data[key], []);
      }
    }

    return controls;
  }

  protected Save() {
    this.credential.Data = this.form.value;

    this.credential.Save().then(raw => {
      return this.doc.set(raw);
    }).then(() => {
      this.form.reset(this.credential.Data);
      this.mode = 'blank';
    });
  }

}
