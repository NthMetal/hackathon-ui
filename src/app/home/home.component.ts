import { Component, OnInit } from '@angular/core';
import { SeriesPackedbubbleOptions, SeriesWordcloudOptions } from 'highcharts';
import { TweetdataService } from '../services/tweetdata.service';
import { Chart } from 'angular-highcharts';
import * as d3 from 'd3';
import { Apollo, gql } from 'apollo-angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {

  constructor(private tweetDataService: TweetdataService) { }

  searchTerm = '';
  isLoaded = false;

  intents = [];
  tweets = [];

  ngOnInit() {
    this.tweetDataService.loadedSubject.subscribe(loaded => {
      this.isLoaded = loaded;
    });
    this.tweetDataService.getTweetDataSubject().subscribe(filteredTweetData => {
      console.log('got starting tweets', filteredTweetData);
    });
    this.tweetDataService.getNewTweetObservable().subscribe(newTweets => {
      this.tweets = newTweets;
    });
    this.tweetDataService.getTwitterIntentsSubject().subscribe(newIntents => {
      this.intents = newIntents;
    });
  }

  search() {
    this.tweetDataService.mongoSearch(this.searchTerm).subscribe(success => {
      console.log(success);
      this.intents = [];
      this.tweets = [];
      this.tweetDataService.resetData();
      this.tweetDataService.get1minData().subscribe(newTweets => {
        this.tweetDataService.addNewTweets(newTweets);
      });
      this.tweetDataService.updateTwitterIntents();
    });
  }

}
