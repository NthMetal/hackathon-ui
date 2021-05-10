import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as tweetdataImport from 'src/app/tweetdata2.json';
let tweetdata = tweetdataImport['default'];

@Injectable({
  providedIn: 'root'
})
export class TweetdataService {
  private cachedTweetData = tweetdata;

  private filteredTweetDataSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(this.cachedTweetData);
  private filteredTweetData = [];

  private filteredByLastHours = 0;

  private newTweetSubject: Subject<any[]> = new Subject<any[]>();

  simulationInterval = 5000;
  intervalRef;

  constructor() {
    this.filteredTweetData = this.cachedTweetData;
    this.filteredTweetDataSubject.next(this.cachedTweetData);

    // Simulate getting a new tweet every 5 seconds
    this.intervalRef = setInterval(() => {
      this.simulateNewData();
    }, this.simulationInterval);
  }

  getCurrentTweetData() {
    return this.filteredTweetData;
  }

  getTweetDataSubject() {
    return this.filteredTweetDataSubject;
  }

  filterDataByLastHours(hours: number) {
    this.filteredByLastHours = hours;
    if (!hours) {
      this.filteredTweetData = this.cachedTweetData;
      this.filteredTweetDataSubject.next(this.cachedTweetData);
      return;
    }
    const now = new Date();
    const milliseconds = hours * 60 * 60 * 1000;
    this.filteredTweetData = this.cachedTweetData.filter(tweet => {
      const tweetDate = new Date(tweet['tweet_date']);
      const difference = now.getTime() - tweetDate.getTime();
      return difference <= milliseconds
    });
    this.filteredTweetDataSubject.next(this.filteredTweetData);
  }

  setCachedTweetData(json: any) {
    this.cachedTweetData = json;
    this.filteredTweetData = this.cachedTweetData;
    if (this.filteredByLastHours) {
      this.filterDataByLastHours(this.filteredByLastHours);
    } else {
      this.filteredTweetDataSubject.next(this.cachedTweetData);
    }
  }

  resetCachedTweetData() {
    this.cachedTweetData = tweetdata;
    this.filteredTweetData = tweetdata;
    if (this.filteredByLastHours) {
      this.filterDataByLastHours(this.filteredByLastHours);
    } else {
      this.filteredTweetDataSubject.next(this.cachedTweetData);
    }
  }

  getNewTweetObservable() {
    return this.newTweetSubject.asObservable();
  }

  addNewTweets(tweets) {
    tweetdata.push(...tweets);
    this.cachedTweetData.push(...tweets);
    this.filteredTweetData.push(...tweets);
    this.newTweetSubject.next(tweets);
  }

  simulateNewData() {
    const randomTweet = this.cachedTweetData[Math.floor(Math.random() * this.cachedTweetData.length)]
    // const testcityname = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c0'][Math.floor(Math.random() * 10)]
    // randomTweet['tweet_cityname'] = testcityname;
    randomTweet['tweet_date'] = new Date();
    randomTweet['preds_label'] = [['c1', 'c2', 'c3'], ['c1', 'c2', 'c6'], ['c1', 'c6', 'c9', 'c0']][Math.floor(Math.random() * 3)];
    this.addNewTweets([randomTweet]);
    console.log('adding new tweet', randomTweet);
  }

  setSimulationInterval(newSimulationInterval) {
    this.simulationInterval = newSimulationInterval;
    console.log('new interval: ', this.simulationInterval);
    clearInterval(this.intervalRef);
    this.intervalRef = setInterval(() => {
      this.simulateNewData();
    }, this.simulationInterval);
  }
  
}
