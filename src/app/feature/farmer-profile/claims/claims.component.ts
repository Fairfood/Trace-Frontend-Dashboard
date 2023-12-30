import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-claims',
  templateUrl: './claims.component.html',
  styleUrls: ['./claims.component.scss'],
})
export class ClaimsComponent implements OnInit {
  ngOnInit(): void {
    console.log('ClaimsComponent');
  }
}
