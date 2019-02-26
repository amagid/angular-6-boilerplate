import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FieldValidator } from '@datatypes';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'input-field',
  templateUrl: './input-field.component.html',
  styleUrls: ['./input-field.component.scss']
})
export class InputFieldComponent implements OnInit, OnDestroy {

  notifyOnDestroy: Subject<null> = new Subject<null>()
  @Input() validators: Array<FieldValidator>
  @Input() overrideMessage: string
  @Output() overrideMessageChange = new EventEmitter()
  @Input() placeholder: string
  @Input() type: string
  @Input() rows: number
  @Input() label: string
  @Output() value = new EventEmitter()
  @Input() resetField: Observable<null>
  errorState: boolean = false
  inputValue: string = ''
  errors: Array<string> = []
  _initialValue: string = ''

  @Input()
  set initialValue(initialValue: string) {
    this.inputValue = initialValue;
    this._initialValue = initialValue;
  }
  get initialValue() {
    return this._initialValue;
  }

  constructor() { }

  ngOnInit() {
    if (this.resetField) {
      this.resetField.pipe(takeUntil(this.notifyOnDestroy)).subscribe(() => {
        this.clearErrorState();
        this.clear();
        this.inputValue = this.initialValue;
      });
    }
  }

  ngOnDestroy() {
    this.notifyOnDestroy.next();
    this.notifyOnDestroy.complete();
  }

  change() {
    this.value.emit({ error: null, value: this.inputValue });
  }

  getValue() {
    this.validate();
    const output = { error: this.errorState, value: this.inputValue };
    this.value.emit(output);
    return output;
  }

  validate() {
    this.errors = [];
    this.errorState = false;
    for (let validator of this.validators) {
      if (!validator.regex.test(this.inputValue || "")) {
        this.errors.push(validator.message);
        this.errorState = true;
      }
    }
  }

  clearErrorState() {
    this.errorState = false;
    this.errors = [];
    this.overrideMessageChange.emit("");
  }

  clear() {
    this.inputValue = '';
  }

}
