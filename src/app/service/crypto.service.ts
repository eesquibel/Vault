import { Injectable } from '@angular/core';

import { Encrypted } from '../model/encrypted';
import { AuthenticationService } from './authentication.service';

const subtle: SubtleCrypto = window.crypto.subtle;
const TextEncoder = window['TextEncoder'];

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  private db: IDBDatabase;
  private salt: ArrayBuffer;
  private enc = new TextEncoder();

  private masterPassword = null;

  private _master: CryptoKey = null;
  private _wrapper: CryptoKey = null;
  private _unwrapped: CryptoKey = null;

  public ready: Promise<boolean> = undefined;

  constructor(private auth: AuthenticationService) {
    const open = indexedDB.open('Vault', 1);

    this.ready = new Promise((resolve, reject) => {
      auth.user.subscribe(user => {
        if (user) {
          this.salt = this.enc.encode(this.auth.details.uid).slice(0, 16);

          if (this.masterPassword) {
            this.GetKey().then(unwrapped => {
              this._unwrapped = unwrapped;
            });
          }
        }
      });

      open.onupgradeneeded = e => {
        this.db = open.result;
        const store = this.db.createObjectStore('Keys');
      };

      open.onsuccess = e => {
        this.db = open.result;
        resolve(typeof(this.masterPassword) === 'string' && this.masterPassword !== '');
      };

      open.onerror = e => {
        reject(e);
      };
    });
  }

  private Add(type: string, key: any): Promise<Event> {
    return new Promise((resolve, reject) => {
      const store = this.db.transaction(['Keys'], 'readwrite').objectStore('Keys');
      const request = store.put(key, type);
      request.onsuccess = e => {
        resolve(e);
      };
      request.onerror = e => {
        reject(e);
      };
    });
  }

  private Get<T>(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const store = this.db.transaction(['Keys'], 'readonly').objectStore('Keys');
      const request = store.get(key);
      request.onsuccess = e => {
        resolve(request.result);
      };
      request.onerror = e => {
        reject(e);
      };
    });
  }
  public Encrypt(input: ArrayBuffer | string): PromiseLike<Encrypted> {
    let buffer: ArrayBuffer;

    if (input instanceof ArrayBuffer) {
      buffer = input;
    } else if (typeof(input) === 'string') {
      buffer = this.enc.encode(input);
    }

    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    const algorithm: any = { name: 'AES-CBC', iv: iv};
    return subtle.encrypt(algorithm, this._unwrapped, buffer).then(result => {
      return {
        Data: new Uint8Array(result),
        IV: iv
      };
    });
  }

  public Decrypt(raw: Encrypted): PromiseLike<ArrayBuffer> {
    if (raw === undefined || raw === null) {
      return null;
    }

    const algorithm: any = { name: 'AES-CBC', iv: raw.IV};
    return subtle.decrypt(algorithm, this._unwrapped, raw.Data);
  }

  private MasterKey(master: ArrayBuffer): PromiseLike<CryptoKey> {
    return subtle.importKey('raw', master, 'PBKDF2', false, ['deriveBits', 'deriveKey']).then(masterKey => {
      console.log(masterKey);
      return subtle.deriveKey(
        { name: 'PBKDF2', hash: 'SHA-256', salt: this.salt, iterations: 128 },
        masterKey,
        { name: 'AES-CBC', length: 256 },
        false,
        ['wrapKey', 'unwrapKey']
      );
    }, e => {
      console.error(e);
      return null;
    });
  }

  private Unwrap(key: ArrayBuffer, wrapper: CryptoKey, iv: ArrayBuffer): PromiseLike<CryptoKey> {
    const algorithm: any = { name: 'AES-CBC', iv: iv};
    return subtle.unwrapKey('raw', key, wrapper, algorithm, { name: 'AES-CBC' }, false, ['encrypt', 'decrypt']);
  }

  private async GetKey(): Promise<CryptoKey> {
    const p = this.Get<ArrayBuffer>('Private');
    const i = this.Get<ArrayBuffer>('IV');

    const privateKey = await p;
    const iv = await i;

    if (!privateKey || !iv) {
      return null;
    }

    const buffer = this.enc.encode(this.masterPassword);
    return this.MasterKey(buffer).then(wrapper => {
      return this.Unwrap(privateKey, wrapper, iv);
    }, e => {
      console.error(e);
      return null;
    });
  }

  public SetMaster(master: string): Promise<boolean> {
    this.masterPassword = master;

    return this.ready = new Promise((resolve, reject) => {
      this.GetKey().then(unwrapped => {
        this._unwrapped = unwrapped;
        resolve(true);
      }, e => {
        console.error(e);
        reject(e);
      });
    });
  }

  public async HasKeys(): Promise<boolean> {
    const p = this.Get<ArrayBuffer>('Private');
    const i = this.Get<ArrayBuffer>('IV');

    const privateKey = await p;
    const iv = await i;

    if (!privateKey || !iv) {
      return false;
    }

    return true;
  }

  public ImportKey(master: ArrayBuffer, key: JsonWebKey): Promise<boolean> {
    return this.ready = new Promise((resolve, reject) => {
      subtle.importKey('jwk', key, { name: 'AES-CBC', length: 256}, true, ['encrypt', 'decrypt']).then(key => {
        console.log(key);

        this._unwrapped = key;

        this.MasterKey(master).then(wrapper =>  {
          console.log(wrapper);

          const iv = window.crypto.getRandomValues(new Uint8Array(16));
          const algorithm: any = { name: 'AES-CBC', iv: iv};
          this.Add('IV', iv);

          return subtle.wrapKey('raw', key, wrapper, algorithm);
        }, e => {
          console.error(e);
          reject(e);
          return null;
        }).then(wrapped => {
          console.log(wrapped);
          this.Add('Private', new Uint8Array(wrapped));
          resolve(true);
        }, e => {
          console.error(e);
          reject(e);
        });
      });
    });
  }

  public GenerateKey(master: ArrayBuffer): Promise<boolean> {
    return this.ready = new Promise((resolve, reject) => {
      subtle.generateKey({ name: 'AES-CBC', length: 256}, true, ['encrypt', 'decrypt']).then(key => {
        console.log(key);

        this.MasterKey(master).then(wrapper =>  {
          console.log(wrapper);

          subtle.exportKey('jwk', key).then(result => {
            const blob = new Blob([JSON.stringify(result)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            window.open(url);
          });

          const iv = window.crypto.getRandomValues(new Uint8Array(16));
          const algorithm: any = { name: 'AES-CBC', iv: iv};
          this.Add('IV', iv);

          return subtle.wrapKey('raw', key, wrapper, algorithm);
        }, e => {
          console.error(e);
          reject(e);
          return null;
        }).then(wrapped => {
          console.log(wrapped);
          this.Add('Private', new Uint8Array(wrapped));
          resolve(true);
        }, e => {
          console.error(e);
          reject(e);
        });
      });
    });
  }

}
