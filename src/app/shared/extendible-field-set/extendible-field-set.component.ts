import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { KeyValue } from '@datatypes';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'extendible-field-set',
  templateUrl: './extendible-field-set.component.html',
  styleUrls: ['./extendible-field-set.component.scss']
})
export class ExtendibleFieldSetComponent implements OnInit, OnDestroy {

  notifyOnDestroy: Subject<null> = new Subject<null>()
  @Input() keyPlaceholder: string
  @Input() valuePlaceholder: string
  @Input() label: string
  @Input() dictionary: boolean
  @Input() initialValue: any
  @Output() value = new EventEmitter()
  @Input() resetField: Observable<null>
  values: KeyValue[] = []
  errorState: boolean = false
  errors: Array<string> = []

  constructor() { }

  ngOnInit() {
    if (this.resetField) {
      this.resetField.pipe(takeUntil(this.notifyOnDestroy)).subscribe(() => {
        this.clearErrorState();
        this.clear();
      });
    }

    if (!this.values.length) {
      this.addField();
    }
  }

  ngOnDestroy() {
    this.notifyOnDestroy.next();
    this.notifyOnDestroy.complete();
  }

  getValues() {
    if (!this.values.length) {
      this.generateKeyValues();
    }
    return this.values;
  }

  generateKeyValues() {    
    this.values = [];
    if (this.initialValue) {
      this.values = this.initialValue;
    } else {
      this.values.push({ key: '', value: '' });
    }

    return this.values;
  }

  getValue() {
    this.validate();
    const output = { error: this.errorState, value: this.values };
    this.value.emit(output);
    return output;
  }

  validate() {
    this.errors = [];
    this.errorState = false;
    for (let i = 0; i < this.values.length; i++) {
      if (this.dictionary && !this.values[i].key && this.values[i].value) {
        this.errors.push(`Fieldset Key #${i} Cannot Be Empty!`);
      }
      if (!this.values[i].value && this.dictionary && this.values[i].key) {
        this.errors.push(`Fieldset Value #${i} Cannot Be Empty!`);
      }
      if (!this.values[i].value && !this.values[i].key) {
        this.values.splice(i, 1);
        i--;
      }
    }
  }

  clearErrorState() {
    this.errorState = false;
    this.errors = [];
  }

  clear() {
    this.values.splice(0, this.values.length);
  }

  addField() {
    this.values.push({ key: '', value: '' });
  }

  removeField() {
    if (this.values.length === 1) {
      return;
    }
    this.values.splice(this.values.length - 1, 1);
  }

}
