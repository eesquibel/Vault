import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AddComponent } from './credentials/add/add.component';
import { CredentialsComponent } from './credentials/credentials.component';
import { CredentialsListItemComponent } from './credentials/list/item/item.component';
import { CredentialsListComponent } from './credentials/list/list.component';
import { SecretComponent } from './credentials/list/secret/secret.component';
import { LoginGuard } from './login.guard';
import { LoginComponent } from './login/login.component';
import { SetupComponent } from './setup/setup.component';

const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'login/redirect', component: LoginComponent, data: { redirect: true } },
  { path: 'setup', component: SetupComponent },
  {
    path: 'credential',
    component: CredentialsComponent,
    canActivate: [LoginGuard],
    canActivateChild: [LoginGuard],
    children: [
      { path: '', component: CredentialsListComponent },
      { path: 'add', component: AddComponent }
    ]
  },
  { path: '', component : AppComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CredentialsListComponent,
    CredentialsComponent,
    SetupComponent,
    CredentialsListItemComponent,
    SecretComponent,
    AddComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    RouterModule.forRoot(
      appRoutes, {
        onSameUrlNavigation: 'reload'
      }
    ),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule.enablePersistence(),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [LoginGuard],
  bootstrap: [AppComponent]
})
export class AppModule {
}
