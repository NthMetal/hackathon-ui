import { Injectable } from '@angular/core';
import * as tweetdataImport from 'src/app/tweetdata.json';
let tweetdata = tweetdataImport['default'];

@Injectable({
  providedIn: 'root'
})
export class TweetdataService {

  constructor() { }

  getTweetData() {
    return tweetdata;
  }
}
