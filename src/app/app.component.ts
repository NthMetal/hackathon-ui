import { Component, OnInit } from '@angular/core';
import { TweetdataService } from './services/tweetdata.service';
import * as Highcharts from 'highcharts';
import more from 'highcharts/highcharts-more';
import wordcloud from 'highcharts/modules/wordcloud';
import darkunica from 'highcharts/themes/dark-unica';
import treemap from 'highcharts/modules/treemap';

more(Highcharts);
wordcloud(Highcharts);
darkunica(Highcharts);
treemap(Highcharts);


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {

  refresh = true;

  constructor(private tweetDataService: TweetdataService) {}


  filterSelectionChanged(event) {
    this.tweetDataService.filterDataByLastHours(+event.value);
  }

  refreshPage() {
    this.refresh = false;
    setTimeout(() => {
      this.refresh = true;
    });
  }

}
