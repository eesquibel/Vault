import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  constructor(private fireStore: AngularFirestore) {

  }

  public Get<T>(collection: string): AngularFirestoreCollection<T> {
    return this.fireStore.collection<T>(collection);
  }
}
