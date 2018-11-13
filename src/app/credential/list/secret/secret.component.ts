import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  OnInit,
  SimpleChange,
  TemplateRef,
  ViewChild,
  ViewRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Encrypted } from '../../../model/encrypted';
import { CryptoService } from '../../../service/crypto.service';

@Component({
  selector: 'app-secret',
  templateUrl: './secret.component.html',
  styleUrls: ['./secret.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SecretComponent),
      multi: true
    }
  ]
})
export class SecretComponent implements OnInit, AfterViewInit, ControlValueAccessor {

  @Input('value')
  protected value: Encrypted;

  @ViewChild('input')
  protected input: ElementRef;

  @ViewChild('blank')
  protected blank: TemplateRef<ViewRef>;

  @ViewChild('view')
  protected view: TemplateRef<ViewRef>;

  @ViewChild('container', { read: NgTemplateOutlet })
  protected container: NgTemplateOutlet;

  @ViewChild('edit')
  protected edit: TemplateRef<ViewRef>;

  public get template(): TemplateRef<ViewRef> {
    return this[this.mode];
  }

  private _mode: 'blank' | 'view' | 'edit';

  @Input('mode')
  protected set mode(value: 'blank' | 'view' | 'edit') {
    this.container.ngTemplateOutletContext = { $implicit: null };
    this._mode = value;

    if (value !== 'blank') {
      this.writeValue(this.value);
    }
  }

  protected get mode(): 'blank' | 'view' | 'edit' {
    return this._mode;
  }

  private changed: boolean;
  private changing: boolean;

  public get Changed(): boolean {
    return this.changed;
  }

  public onChange: any = () => { };
  public onTouched: any = () => { };

  constructor(
    private crypto: CryptoService,
    private ref: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.changed = false;
  }

  ngAfterViewInit(): void {
  }

  writeValue(value: any): void {
    this.value = value;

    if (value) {
      if (this.mode !== 'blank') {
        this.crypto.Decrypt(value).then(result => {
            this.container.ngTemplateOutletContext = {
              $implicit: String.fromCharCode.apply(null, new Uint8Array(result))
            };

            this.container.ngOnChanges({ngTemplateOutletContext: new SimpleChange(null, this.container.ngTemplateOutletContext, false)});
        });
      }
    } else {
      this.input.nativeElement.value = null;
    }
  }

  registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.input.nativeElement.disabled = isDisabled;
  }

  @HostListener('input', ['$event.target.value'])
  protected onInput(value) {
    if (!this.changing) {
      this.onChange(null);
      this.changing = true;
    }
  }

  protected onBlur(value) {
    this.onTouched();

    this.crypto.Encrypt(value).then(data => {
      this.changed = true;
      this.value = data;
      this.changing = false;
      this.onChange(data);
    });
  }

  protected clipboard(btn: HTMLButtonElement) {
    btn.disabled = true;

    this.crypto.Decrypt(this.value).then(result => {
      const value = String.fromCharCode.apply(null, new Uint8Array(result));

      return navigator['clipboard'].writeText(value);
    }).then(_ => {
      btn.disabled = false;
    }, e => {
      btn.disabled = false;
      console.warn(e);
    });
  }

}
