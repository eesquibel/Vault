import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from '../service/authentication.service';
import { CryptoService } from './../service/crypto.service';

const TextEncoder = window['TextEncoder'];

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css']
})
export class SetupComponent implements OnInit {

  @ViewChild('masterPassword')
  public masterPassword: ElementRef;

  public hasKeys = true;
  public loggedIn = false;

  constructor(private route: Router, private crypto: CryptoService, private auth: AuthenticationService) { }

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
    this.crypto.SetMaster(this.masterPassword.nativeElement.value).then(() => {
      this.route.navigate(['credential']);
    });
  }

}
