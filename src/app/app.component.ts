import { Component, OnInit } from '@angular/core';
import { TweetdataService } from './services/tweetdata.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {

  constructor(private tweetDataService: TweetdataService) {}


  filterSelectionChanged(event) {
    this.tweetDataService.filterDataByLastHours(+event.value);
  }

}
