import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TweetdataService } from '../services/tweetdata.service';

const NO_LABELS = 'No Labels';

@Component({
  selector: 'app-hospital',
  templateUrl: './hospital.component.html',
  styleUrls: ['./hospital.component.less'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class HospitalComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource = new MatTableDataSource([]);
  displayedColumns = ['date', 'text'];
  expandedElement: any | null;
  searchTerm = '';

  constructor(private tweetDataService: TweetdataService) { }

  ngOnInit(): void {
  }

  search() {
    this.tweetDataService.semanticSearch(this.searchTerm).subscribe(result => {
      const mappedTweets = this.mapTweets(result);
      console.log(mappedTweets);
      this.setDataSource(mappedTweets);
    });
  }

  mapTweets(tweetdata) {
    return tweetdata.map(tweet => ({
      date: new Date(tweet.created_at),
      text: tweet.Text,
      username: tweet.screen_name,
      link: `http://twitter.com/${tweet.screen_name}/status/${tweet.id_str}`,
      score: tweet.Score
    }));
  }

  setDataSource(data) {
    this.dataSource = new MatTableDataSource([]);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = (_data, filter) => {
      if (filter === '[]') return true;
      const parsedFilters = JSON.parse(filter);
      if (parsedFilters.includes(NO_LABELS) && _data.labels.length === 0) {
        return true;
      } else {
        return parsedFilters.some(filter => _data.labels.includes(filter));
      }
    }
    this.dataSource.data = data;
  }

}
