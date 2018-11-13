import { Router } from '@angular/router';
import { Component, AfterViewInit } from '@angular/core';
import { setTheme } from 'ngx-bootstrap/utils';
import { CryptoService } from './service/crypto.service';
import { AuthenticationService } from './service/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'app';

  constructor(private crypto: CryptoService, private auth: AuthenticationService, private route: Router) {
    setTheme('bs4');
  }

  ngAfterViewInit(): void {
    this.auth.user.subscribe(user => {
      if (user) {
        this.crypto.ready.then(ready => {
          if (ready) {
            this.route.navigate(['credential']);
          } else {
            this.route.navigate(['setup']);
          }
        });
      } else {
        this.route.navigate(['login']);
      }
    });
  }
}
