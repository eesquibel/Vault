import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { CredentialComponent } from './credential/credential.component';
import { ListItemComponent } from './credential/list/item/item.component';
import { ListComponent } from './credential/list/list.component';
import { LoginComponent } from './login/login.component';
import { SetupComponent } from './setup/setup.component';
import { SecretComponent } from './credential/list/secret/secret.component';
import { LoginGuard } from './login.guard';
import { AddComponent } from './credential/add/add.component';

const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'setup', component: SetupComponent },
  {
    path: 'credential',
    component: CredentialComponent,
    canActivate: [LoginGuard],
    canActivateChild: [LoginGuard],
    children: [
      { path: '', component: ListComponent },
      { path: 'add', component: AddComponent }
    ]
  },
  { path: '', component : AppComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ListComponent,
    CredentialComponent,
    SetupComponent,
    ListItemComponent,
    SecretComponent,
    AddComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      appRoutes, {
        onSameUrlNavigation: 'reload'
      }
    ),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule.enablePersistence(),
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [LoginGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
