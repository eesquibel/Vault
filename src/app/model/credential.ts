import { CryptoService } from '../service/crypto.service';

export class Credential {
  public Domain: string = undefined;
  public Created: Date = undefined;
  public Updated: Date = undefined;
  public Data: {[key: string]: any} = undefined;

  private _reader: {[key: string]: any} = undefined;

  public get Reader(): {[key: string]: any} {
    if (this._reader === undefined) {
      this._reader = {
        __noSuchMethod__ : (id, args) => {
          console.log(id);
        }
      };

      for (const key in this.Data) {
        if (this.Data.hasOwnProperty(key)) {
          Object.defineProperty(this._reader, key, {
            get: async () => await this.crypto.Decrypt(this.Data[key]),
            set: value => this.crypto.Encrypt(value).then(result => this.Data[key] = result)
          });
        }
      }
    }

    return this._reader;
  }

  constructor(private crypto: CryptoService, source: any) {
    for (const key in this) {
      if (key in source) {
        this[key] = source[key];
      }
    }

    if (this.Data === undefined) {
      this.Data = {
        Username: null,
        Password: null
      };
    }
  }
}
