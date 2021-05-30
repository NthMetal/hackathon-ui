import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

const FIND_ALL = gql`
query{
  networks{
    idstr
    datetime
    text
    username
    userlocation
    preds
  }
}
`;

const FIND_INTENTS = gql`
query{
  intents{
    Syncons
    Topics
    Knowledge
    Lemma
    Phrase
    EmotionalTraits
    IPTCMediaTopics
  }
}
`;
// namedentities
// categories


@Injectable({
  providedIn: 'root'
})
export class TweetdataService {
  private cachedTweetData = [];

  private filteredTweetDataSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(this.cachedTweetData);
  private filteredTweetData = [];

  private filteredByLastHours = 0;

  private newTweetSubject: Subject<any[]> = new Subject<any[]>();

  simulationInterval = 30000; // 50 sec
  intervalRef;

  loadedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient,
    private apollo: Apollo) {
    this.getFullData().subscribe(allTweets => {
      console.log('got all tweetData', allTweets);
      this.cachedTweetData = allTweets;
      this.filteredTweetData = this.cachedTweetData;
      this.filteredTweetDataSubject.next(this.cachedTweetData);

      this.loadedSubject.next(true);

      // Simulate getting a new tweet every 5 seconds
      // this.intervalRef = setInterval(() => {
      //   this.get1minData().subscribe(newTweets => {
      //     this.addNewTweets(newTweets);
      //     // console.log('new tweets: ', newTweets);
      //   });
      // }, this.simulationInterval);
    });
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
      const tweetDate = new Date(tweet['@timestamp']);
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
    this.filteredTweetData = this.cachedTweetData;
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
    const unique = tweets.filter(tweet => 
      !this.cachedTweetData.find(existingTweet => existingTweet.id_str === tweet.id_str));
    this.cachedTweetData.push(...unique);
    this.filteredTweetData.push(...unique);
    this.newTweetSubject.next(unique);
  }

  getFullData(): Observable<any> {
    return new Observable(subscribe => {
        this.apollo
      .watchQuery({
        query: FIND_ALL,
      })
      .valueChanges.subscribe(({ data, loading }) => {
        subscribe.next((data as any).networks);
        subscribe.complete();
      });
    });
    // return this.http.post('http://3.238.229.207:5001/get_fulldata', {}, {
    //   headers: {
    //     'Access-Control-Allow-Origin': '*'
    //   }
    // })
  }

  getIntents(): Observable<any> {
    return new Observable(subscribe => {
      this.apollo
    .watchQuery({
      query: FIND_INTENTS,
    })
    .valueChanges.subscribe(({ data, loading }) => {
      subscribe.next((data as any).intents);
      subscribe.complete();
    });
  });
  }

  get1minData(): Observable<any> {
    return this.http.post('http://3.238.229.207:5001/get_last1mindata', {}, {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
  }

  semanticSearch(search): Observable<any> {
    const formData = new FormData();
    formData.append('userquery', search);
    return this.http.post('http://3.238.229.207:5001/semantic_search', formData, {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
  
}
