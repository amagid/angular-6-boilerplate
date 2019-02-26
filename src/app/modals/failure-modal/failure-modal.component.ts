import { Component, OnInit, Input, HostBinding, HostListener } from '@angular/core';
import { map } from 'rxjs/operators';

@Component({
  selector: 'failure-modal',
  templateUrl: './failure-modal.component.html',
  styleUrls: ['./failure-modal.component.scss']
})
export class FailureModalComponent implements OnInit {

  @Input() @HostBinding('class.active') active: boolean = false;
  @Input() data: any = null;

  constructor() { }

  ngOnInit() {
  }

  @HostListener('click', ['$event']) blockClick(event: any) {
    event.stopPropagation();
  }

}
