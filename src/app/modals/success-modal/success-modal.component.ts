import { Component, OnInit, Input, HostBinding, HostListener } from '@angular/core';
import { map } from 'rxjs/operators';

@Component({
  selector: 'success-modal',
  templateUrl: './success-modal.component.html',
  styleUrls: ['./success-modal.component.scss']
})
export class SuccessModalComponent implements OnInit {

  @Input() @HostBinding('class.active') active: boolean = false;
  @Input() data: any = null;

  constructor() { }

  ngOnInit() {
  }

  @HostListener('click', ['$event']) blockClick(event: any) {
    event.stopPropagation();
  }

}
