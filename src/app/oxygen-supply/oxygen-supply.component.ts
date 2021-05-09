import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TweetdataService } from '../services/tweetdata.service';

@Component({
  selector: 'app-oxygen-supply',
  templateUrl: './oxygen-supply.component.html',
  styleUrls: ['./oxygen-supply.component.less']
})
export class OxygenSupplyComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource = new MatTableDataSource([])
  displayedColumns = [ 'date', 'text', 'username', 'location', 'followers', 'link' ]

  constructor(private tweetDataService: TweetdataService) { }

  ngOnInit(): void {
    const tweetdata = this.tweetDataService.getTweetData();
    this.dataSource = new MatTableDataSource(tweetdata.map(tweet => ({
      date: new Date(tweet['tweet_date']),
      text: tweet['tweet_text'],
      username: tweet['user_name'],
      location: tweet['tweet_cityname'] + ', ' + tweet['tweet_countryname'],
      link: `http://twitter.com/${tweet['user_name']}/status/${tweet['tweet_id']}`,
      followers: +tweet['user_followers']
    })));
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
