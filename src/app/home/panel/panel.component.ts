import { Component, OnInit, Input, HostBinding, HostListener } from '@angular/core';
import { map } from 'rxjs/operators';

@Component({
  selector: 'panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss']
})
export class PanelComponent implements OnInit {

  @Input() @HostBinding('class.active') active: boolean = false;
  @Input() post: any = null;

  constructor() { }

  ngOnInit() {
  }

  @HostListener('click', ['$event']) blockClick(event: any) {
    event.stopPropagation();
  }

}
