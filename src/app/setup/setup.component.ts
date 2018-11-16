import { Component, ElementRef, OnInit, ViewChild, TemplateRef, ContentChild } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from '../service/authentication.service';
import { CryptoService } from './../service/crypto.service';
import { Template } from '@angular/compiler/src/render3/r3_ast';

const TextEncoder = window['TextEncoder'];

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css']
})
export class SetupComponent implements OnInit {

  @ViewChild('masterPassword')
  public masterPassword: ElementRef;

  @ViewChild('file')
  public file: ElementRef;

  @ViewChild('upload')
  public upload: TemplateRef<any>;

  @ViewChild('key')
  public keyTpl: TemplateRef<any>;

  public get existingKeyTemplate(): TemplateRef<any> {
    if (this.hasKeys && this.Key) {
      return this.keyTpl;
    } else if (this.hasKeys) {
      return null;
    } else {
      return this.upload;
    }
  }

  public get KeyJson(): string {
    if (this.Key) {
      const key = Object.assign({}, this.Key);

      if (key && 'k' in key) {
        key.k = key.k.substr(0, 8) + '********';
      }

      return JSON.stringify(key);
    }
  }

  public hasKeys = true;
  public loggedIn = false;

  private Key: JsonWebKey;

  constructor(
    private route: Router,
    private crypto: CryptoService,
    private auth: AuthenticationService) {
  }

  async ngOnInit() {
    this.crypto.ready.then(async ready => {
     this.hasKeys = await this.crypto.HasKeys();
    });

    this.auth.user.subscribe(user => {
      this.loggedIn = this.auth.isLoggedIn;
    });
  }

  public Generate() {
    const enc = new TextEncoder();
    const password = this.masterPassword.nativeElement.value;
    const masterBytes = enc.encode(password);

    this.crypto.GenerateKey(masterBytes).then(() => {
      this.route.navigate(['credential']);
    });
  }

  public Login() {
    if (this.Key) {
      const enc = new TextEncoder();
      const password = this.masterPassword.nativeElement.value;
      const masterBytes = enc.encode(password);
      this.crypto.ImportKey(masterBytes, this.Key).then(() => {
        this.route.navigate(['credential']);
      });
    } else {
      this.crypto.SetMaster(this.masterPassword.nativeElement.value).then(() => {
        this.route.navigate(['credential']);
      });
    }
  }

  public onFileChange(event: Event): void {
    const upload: HTMLInputElement = this.file.nativeElement;
    const files: Array<File> = Array.from(upload.files);

    for (let file of files) {
      let reader = new FileReader();

      reader.onload = e => {
        const result = <string>(<FileReader>e.target).result;

        try {
          this.hasKeys = true;
          this.Key = JSON.parse(result);
        } catch (e) {
          this.hasKeys = false;
          this.Key = null;
        }
      };

      reader.readAsText(file);
    }
  }

}
