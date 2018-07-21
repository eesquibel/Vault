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

  constructor(private route: Router, private crypto: CryptoService) { }

  ngOnInit() {
  }

  public Generate() {
    const enc = new TextEncoder();
    const password = this.masterPassword.nativeElement.value;
    const masterBytes = enc.encode(password);

    this.crypto.GenerateKey(masterBytes);
  }

}
