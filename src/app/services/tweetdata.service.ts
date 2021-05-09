import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as tweetdataImport from 'src/app/tweetdata.json';
let tweetdata = tweetdataImport['default'];

@Injectable({
  providedIn: 'root'
})
export class TweetdataService {
  cachedTweetData = tweetdata;

  filteredTweetDataSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(this.cachedTweetData);
  filteredTweetData = [];

  filteredByLastHours = 0;

  constructor() {
    this.filteredTweetData = this.cachedTweetData;
    this.filteredTweetDataSubject.next(this.cachedTweetData);
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
  
}
