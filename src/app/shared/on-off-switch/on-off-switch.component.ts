import { Component, OnInit, Input, HostListener } from '@angular/core';

@Component({
  selector: 'on-off-switch',
  templateUrl: './on-off-switch.component.html',
  styleUrls: ['./on-off-switch.component.scss']
})
export class OnOffSwitchComponent implements OnInit {

  @Input() onLabel: string = "ON";
  @Input() offLabel: string = "OFF";
  @Input() switchLabel: string = '';
  @Input() onToggle: (state: boolean, revert: ()=>void)=>any;
  _state: boolean = true;

  constructor() { }

  ngOnInit() {
  }

  @HostListener('click')
  toggle() {
    this._state = !this.state;
    this.onToggle(this.state, () => { this.state = !this.state; });
  }

  @Input()
  set state(state: boolean) {
    this._state = !!state;
  }

  get state() {
    return this._state;
  }

}
