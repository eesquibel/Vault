import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CryptoService } from '../service/crypto.service';

@Component({
  selector: 'app-credential',
  templateUrl: './credential.component.html',
  styleUrls: ['./credential.component.css']
})
export class CredentialComponent implements OnInit {

  constructor(private crypto: CryptoService, private route: Router) {
    crypto.ready.then(ready => {
      if (ready === false) {
        route.navigate(['setup']);
      }
    });
  }

  ngOnInit() {
  }

}
