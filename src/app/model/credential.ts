import { Encrypted } from './encrypted';
import { CryptoService } from '../service/crypto.service';
import { FormControl, Validators } from '@angular/forms';
import { DocumentData } from 'angularfire2/firestore';

export class Credential {
  public Domain: string = null;
  public Created: Date = null;
  public Updated: Date = null;
  public Data: {[key: string]: Encrypted} = null;

  private _reader: {[key: string]: any} = undefined;
  private _controls: {[key: string]: FormControl} = undefined;

  public get Reader(): {[key: string]: any} {
    if (this._reader === undefined) {
      this._reader = { };

      for (const key in this.Data) {
        if (this.Data.hasOwnProperty(key)) {
          Object.defineProperty(this._reader, key, {
            get: () => this.crypto.Decrypt(this.Data[key]),
          });
        }
      }
    }

    return this._reader;
  }

  public get Controls(): {[key: string]: FormControl} {
    if (this._controls === undefined) {
      this._controls = { };
      for (const key in this.Data) {
        if (this.Data.hasOwnProperty(key)) {
          this._controls[key] = new FormControl(this.Data[key], []);
        }
      }
    }

    return this._controls;
  }

  public Save(): Credential {
    this.Updated = new Date();

    const raw = {
      Domain: this.Domain,
      Created: this.Created,
      Updated: this.Updated,
      Data: { }
    };

    for (const key in this.Data) {
      if (this.Data.hasOwnProperty(key)) {
        const data = {
          Data: Array.from(this.Data[key].Data),
          IV: Array.from(this.Data[key].IV)
        };

        raw.Data[key] = data;
      }
    }

    return <any>raw;
  }

  constructor(private crypto: CryptoService, source: any, public Id?: string) {
    for (const key in this) {
      if (key in source) {
        switch (key) {
          case 'Data':
          this.Data = { };

            for (const id in source.Data) {
              if (source.Data.hasOwnProperty(id)) {
                const data: Encrypted = {
                  Data: new Uint8Array(source.Data[id].Data),
                  IV: new Uint8Array(source.Data[id].IV)
                };

                this.Data[id] = data;
              }
            }
          break;
          default:
            this[key] = source[key];
        }
      }
    }

    if (this.Data === null) {
      this.Data = {
        Username: null,
        Password: null
      };
    }
  }
}
