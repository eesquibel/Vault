import { CryptoService } from '../service/crypto.service';
import { Encrypted } from './encrypted';
import { Tag } from './tag';

export class Credential {
  public Domain: string = null;
  public Tags: Set<Tag> = null;
  public Created: Date = null;
  public Updated: Date = null;
  public Data: {[key: string]: Encrypted} = null;

  private _reader: {[key: string]: any} = undefined;

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

  public Save(): PromiseLike<Credential> {
    return new Promise<Credential>((resolve, reject) => {

      const tasks = Array<PromiseLike<any>>();

      this.Updated = new Date();

      const raw = {
        Domain: this.Domain,
        Tags: [ ],
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

      this.Tags.forEach(tag => {
        tasks.push(this.crypto.Encrypt(tag).then(result => {
          const data = {
            Data: Array.from(result.Data),
            IV: Array.from(result.IV)
          };

          raw.Tags.push(data);

          return data;
        }));
      });

      Promise.all(tasks).then((results) => {
        resolve(<any>raw);
      }, e => {
        reject(e);
      });

    });
  }

  constructor(private crypto: CryptoService, source: any, public Id?: string) {

    this.Tags = new Set<Tag>();

    for (const key in this) {
      if (key in source) {
        switch (key) {
          case 'Tags':
            const tags = <Array<any>>source.Tags;
            for (const item of tags) {
              const data: Encrypted = {
                Data: new Uint8Array(item.Data),
                IV: new Uint8Array(item.IV)
              };

              this.crypto.Decrypt(data).then(value => {
                this.Tags.add(String.fromCharCode.apply(null, new Uint8Array(value)));
              });
            }
          break;
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
