import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from '../service/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public redirect = false;

  constructor(
    public auth: AuthenticationService,
    protected router: Router,
    protected route: ActivatedRoute) {
  }

  public ngOnInit(): void {
    this.route.data.subscribe(data => {
      if ('redirect' in data && data.redirect)
      {
        this.redirect = true;

        this.auth.user.subscribe(user => {
          if (user == null) {
            this.auth.signin();
          }
        });
      }
    });
  }

  public reload() {
    this.router.navigate(['']);
  }

}
