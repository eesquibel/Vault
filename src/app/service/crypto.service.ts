import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { wrappedError } from '@angular/core/src/error_handler';
import { Encrypted } from '../model/encrypted';

const subtle: SubtleCrypto = window.crypto.subtle;
const TextEncoder = window['TextEncoder'];

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  private db: IDBDatabase;
  private salt: ArrayBuffer;
  private enc = new TextEncoder();

  private masterPassword = 'akane9120';

  private _master: CryptoKey = null;
  private _wrapper: CryptoKey = null;
  private _unwrapped: CryptoKey = null;

  constructor(private auth: AuthenticationService) {
    const open = indexedDB.open('Vault', 1);
    open.onupgradeneeded = e => {
      this.db = open.result;
      const store = this.db.createObjectStore('Keys');
    };

    open.onsuccess = e => {
      this.db = open.result;
    };

    auth.user.subscribe(user => {
      if (user) {
        this.salt = this.enc.encode(this.auth.details.uid).slice(0, 16);
      }
    });

    if (this.masterPassword) {
      this.GetKey().then(unwrapped => {
        this._unwrapped = unwrapped;
      });
    }
  }

  private Add(type: string, key: any): Observable<Event> {
    return Observable.create((observer) => {
      const store = this.db.transaction(['Keys'], 'readwrite').objectStore('Keys');
      const request = store.add(key, type);
      request.onsuccess = e => {
        observer.next(e);
        observer.complete();
      };
      request.onerror = e => {
        observer.error(e);
      };
    });
  }

  private Get<T>(key: string): Observable<T> {
    return Observable.create((observer) => {
      const store = this.db.transaction(['Keys'], 'readonly').objectStore('Keys');
      const request = store.get(key);
      request.onsuccess = e => {
        observer.next(request.result);
        observer.complete();
      };
      request.onerror = e => {
        observer.error(e);
      };
    });
  }

  public Encrypt(data: ArrayBuffer): PromiseLike<Encrypted> {
    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    const algorithm: any = { name: 'AES-CBC', iv: iv};
    return subtle.encrypt(algorithm, this._unwrapped, data).then(result => {
      return {
        Data: result,
        IV: iv
      };
    });
  }

  public Decrypt(raw: Encrypted): PromiseLike<ArrayBuffer> {
    const algorithm: any = { name: 'AES-CBC', iv: raw.IV};
    return subtle.decrypt(algorithm, this._unwrapped, raw.Data);
  }

  private MasterKey(master: ArrayBuffer): PromiseLike<CryptoKey> {
    return subtle.importKey('raw', master, {name: 'PBKDF2'}, false, ['deriveBits', 'deriveKey']).then(masterKey => {
      console.log(masterKey);
      return subtle.deriveKey(
        { name: 'PBKDF2', hash: 'SHA-256', salt: this.salt, iterations: 128 },
        masterKey,
        { name: 'AES-CBC', length: 256 },
        false,
        ['wrapKey', 'unwrapKey']
      );
    });
  }

  private Unwrap(key: BufferSource, wrapper: CryptoKey, iv: ArrayBuffer): PromiseLike<CryptoKey> {
    const algorithm: any = { name: 'AES-CBC', iv: iv};
    return subtle.unwrapKey('raw', key, wrapper, algorithm, { name: 'AES-CBC' }, false, ['encrypt', 'decrypt']);
  }

  private async GetKey(): Promise<CryptoKey> {
    const p = this.Get<ArrayBuffer>('Private');
    const i = this.Get<ArrayBuffer>('IV');

    const privateKey = await p;
    const iv = await i;
    const buffer = this.enc.encode(this.masterPassword);
    return this.MasterKey(buffer).then(wrapper => {
      return this.Unwrap(<any>privateKey, wrapper, <any>iv);
    });
  }

  public GenerateKey(master: ArrayBuffer) {

    const generate = subtle.generateKey({ name: 'AES-CBC', length: 256}, true, ['encrypt', 'decrypt']);

    this.MasterKey(master).then(async wrapper =>  {
      console.log(wrapper);

      const key = await generate;
      console.log(key);

      subtle.exportKey('jwk', key).then(result => {
        const blob = new Blob([JSON.stringify(result)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      });

      const iv = window.crypto.getRandomValues(new Uint8Array(16));
      const algorithm: any = { name: 'AES-CBC', iv: iv};
      this.Add('IV', iv);

      return subtle.wrapKey('raw', key, wrapper, algorithm);
    }).then(wrapped => {
      console.log(wrapped);
      this.Add('Private', new Uint8Array(wrapped));
    });
  }
}
