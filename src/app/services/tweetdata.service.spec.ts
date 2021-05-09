import { TestBed } from '@angular/core/testing';

import { TweetdataService } from './tweetdata.service';

describe('TweetdataService', () => {
  let service: TweetdataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TweetdataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
