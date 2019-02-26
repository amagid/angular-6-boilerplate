import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'error-box',
  templateUrl: './error-box.component.html',
  styleUrls: ['./error-box.component.scss']
})
export class ErrorBoxComponent implements OnInit {

  @Input() content: string | Array<string>
  @Input() active: boolean

  constructor() { }

  ngOnInit() {
  }

  formatContent(content: string | Array<string>) {
    if (typeof content === 'string') {
      return content;
    } else if (Array.isArray(content)) {
      return content.join('\n');
    } else {
      return "Error";
    }
  }

}
