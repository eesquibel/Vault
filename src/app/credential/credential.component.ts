import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-credential',
  templateUrl: './credential.component.html',
  styleUrls: ['./credential.component.css']
})
export class CredentialComponent implements OnInit {

  constructor(private route: Router) {
    if (!localStorage.getItem('private-key')) {
      route.navigate(['setup']);
    }
  }

  ngOnInit() {
  }

}
