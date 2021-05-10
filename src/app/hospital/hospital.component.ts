import { Component, OnInit } from '@angular/core';
import { TweetdataService } from '../services/tweetdata.service';

@Component({
  selector: 'app-hospital',
  templateUrl: './hospital.component.html',
  styleUrls: ['./hospital.component.less']
})
export class HospitalComponent implements OnInit {

  exampleTweet = {
    "": 0,
    "_id": "6097e336337cfe568d9cbb0f",
    "tweet_id": 1391384261748461600,
    "tweet_date": "2021-05-09T16:06:18.543Z",
    "tweet_text": "3hr old tweet",
    "user_name": "DrBharatbhushan",
    "user_location": "Palghar",
    "user_followers": 126,
    "retweets": 0,
    "tweet_cityname": "Mumbai",
    "tweet_countryname": "India",
    "preds_label": "['cat']"
  }
  newJson;
  jsonParseResult;
  simulationInterval = 5000;

  constructor(private tweetDataService: TweetdataService) { }

  ngOnInit(): void {
  }

  applyChanges() {
    if (this.newJson) {
      try {
        const parsedJSON = JSON.parse(this.newJson);
        this.tweetDataService.setCachedTweetData(parsedJSON);
        this.jsonParseResult = 'New Data Applied Successfully';
      } catch(error) {
        this.jsonParseResult = error;
      }
    }
  }

  resetChanges() {
    this.tweetDataService.resetCachedTweetData();
    this.jsonParseResult = 'Data Has Been Reset';
  }

  setSimulationInterval() {
    this.tweetDataService.setSimulationInterval(this.simulationInterval);
  }

}
