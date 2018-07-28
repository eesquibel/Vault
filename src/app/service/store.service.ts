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

  public Save<T>(collection: string, key: string, item: T): Promise<void> {
    return this.Get<T>(collection).doc(key).set(item);
  }
}
