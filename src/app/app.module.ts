import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AddComponent } from './credential/add/add.component';
import { CredentialComponent } from './credential/credential.component';
import { ListItemComponent } from './credential/list/item/item.component';
import { ListComponent } from './credential/list/list.component';
import { SecretComponent } from './credential/list/secret/secret.component';
import { LoginGuard } from './login.guard';
import { LoginComponent } from './login/login.component';
import { SetupComponent } from './setup/setup.component';

const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'login/redirect', component: LoginComponent, data: { redirect: true } },
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
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [LoginGuard],
  bootstrap: [AppComponent]
})
export class AppModule {
}
