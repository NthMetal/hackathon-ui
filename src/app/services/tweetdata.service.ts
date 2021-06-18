import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

// const FIND_ALL = gql`
// query{
//   networks{
//     idstr
//     datetime
//     text
//     username
//     userlocation
//     preds
//   }
// }
// `;

// const FIND_INTENTS = gql`
// query{
//   intents{
//     Syncons
//     Topics
//     Knowledge
//     Lemma
//     Phrase
//     EmotionalTraits
//     IPTCMediaTopics
//   }
// }
// `;
// namedentities
// categories


@Injectable({
  providedIn: 'root'
})
export class TweetdataService {
  private cachedTweetData = [];
  private twitterIntents = [];

  private filteredTweetDataSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(this.cachedTweetData);
  private filteredTweetData = [];

  private filteredByLastHours = 0;

  private newTweetSubject: Subject<any[]> = new Subject<any[]>();

  simulationInterval = 30000; // 50 sec
  intervalRef;

  loadedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  intentsSubject: Subject<any[]> = new Subject<any[]>();

  constructor(private http: HttpClient, private apollo: Apollo) {
    this.updateTwitterIntents();
    this.getFullData().subscribe(allTweets => {
      console.log('got all tweetData', allTweets);
      this.cachedTweetData = allTweets;
      this.filteredTweetData = this.cachedTweetData;
      this.filteredTweetDataSubject.next(this.cachedTweetData);

      this.loadedSubject.next(true);

      this.newTweetSubject.next(allTweets);

      // Simulate getting a new tweet every 5 seconds
      this.intervalRef = setInterval(() => {
        this.get1minData().subscribe(newTweets => {
          this.addNewTweets(newTweets);
          // console.log('new tweets: ', newTweets);
        });
        this.updateTwitterIntents();
      }, this.simulationInterval);
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

  resetData() {
    this.cachedTweetData = [];
    this.filteredTweetData = [];
    this.filteredTweetDataSubject.next([]);
    this.newTweetSubject.next([]);
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
    // const unique = tweets.filter(tweet => 
    //   !this.cachedTweetData.find(existingTweet => existingTweet.tweet_id === tweet.tweet_id));
    // this.cachedTweetData.push(...unique);
    // this.filteredTweetData.push(...unique);
    // this.newTweetSubject.next(unique);
    this.cachedTweetData = tweets;
    this.filteredTweetData = tweets;
    this.newTweetSubject.next(tweets);
  }

  getFullData(): Observable<any> {
    return this.http.post('http://3.238.229.207:5001/get_fullmongodata/', {}, {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  get1minData(): Observable<any> {
    return this.http.post('http://3.238.229.207:5001/get_fullmongodata/', {});
  }

  getTwitterIntents(): Observable<any> {
    return this.http.post('http://3.238.229.207:5001/get_twitterintents/', {});
  }

  getTwitterIntentsSubject(): Observable<any> {
    return this.intentsSubject.asObservable();
  }

  updateTwitterIntents() {
    this.getTwitterIntents().subscribe(newIntents => {
      this.twitterIntents = newIntents;
      this.intentsSubject.next(newIntents);
    });
  }

  semanticSearch(search): Observable<any> {
    const formData = new FormData();
    formData.append('userquery', search);
    return this.http.post('http://3.238.229.207:5001/semantic_search/', formData);
  }

  mongoSearch(search: string): Observable<boolean> {
    const formData = new FormData();
    formData.append('keyword', search);
    console.log('searching..')
    return new Observable(sub => {
      console.log('searching..')
      const saveSub = this.http.post('http://3.238.229.207:5001/savedatainmongo/', formData).subscribe();
      setTimeout(() => {
        saveSub.unsubscribe();
        sub.next(true);
        sub.complete();
      }, 5000);
    });
  }

}
