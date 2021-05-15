import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TweetdataService } from '../services/tweetdata.service';

import { Chart } from 'angular-highcharts';
import { SeriesTreemapOptions, getOptions } from 'highcharts';
import { DomSanitizer } from '@angular/platform-browser';

const NO_LABELS = 'No Labels';

@Component({
  selector: 'app-oxygen-supply',
  templateUrl: './oxygen-supply.component.html',
  styleUrls: ['./oxygen-supply.component.less'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class OxygenSupplyComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource = new MatTableDataSource([])
  displayedColumns = ['date', 'text']
  expandedElement: any | null;
  now = new Date();
  chart: Chart;
  treeFilters = [];
  treeData = [];

  isLoaded = false;

  constructor(private tweetDataService: TweetdataService,
    private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.tweetDataService.loadedSubject.subscribe(loaded => {
      this.isLoaded = loaded;
    });
    this.tweetDataService.getTweetDataSubject().subscribe(filteredTweetData => {
      const mappedData = this.mapTweets(filteredTweetData);
      this.removeTreeFilters();
      this.setDataSource(mappedData);
      this.setTreemapData(mappedData);
    });
    this.tweetDataService.getNewTweetObservable().subscribe(newTweets => {
      const mappedData = this.mapTweets(newTweets);
      console.log('adding tweets: ', mappedData);
      const data = this.dataSource.data;
      data.unshift(...mappedData);
      this.dataSource.data = data;
      if (this.chart) this.updateTreeMapData(mappedData);
    });
  }

  mapTweets(tweetdata) {
    return tweetdata.map(tweet => ({
      date: new Date(tweet['@timestamp']),
      text: tweet.text,
      username: tweet.user ? tweet.user.name : 'Missing',
      location: tweet.place ? `${tweet.place.name}, ${tweet.place.country}` : 'Missing',
      link: `http://twitter.com/${tweet.user['screen_name']}/status/${tweet['id_str']}`,
      followers: +((tweet.user ? tweet.user.followers_count : '') || 0),
      labels: tweet['preds_label'] || []
    }));
  }

  initChart() {
    if (this.chart) this.chart.destroy();
    this.chart = new Chart({
      chart: {
        type: 'treemap',
        // backgroundColor: 'transparent'
      },
      credits: {
        enabled: false
      },
      title: {
        text: 'Labels'
      },
      colorAxis: {
        minColor: '#FFFFFF',
        maxColor: getOptions().colors[0]
      },
      series: []
    });
  }

  private generateChartSeries(tweetdata, series?) {
    const initialAcc = series || [ { name: NO_LABELS, value: 0, colorValue: 1 } ];
    const chartSeries = tweetdata.reduce((acc, curr) => {
      if (curr.labels.length === 0) {
        acc[0].value = acc[0].value + 1;
        return acc;
      } else {
        if (typeof curr.labels === 'string') {
          try {
            curr.labels = JSON.parse(curr.labels.replace(/\'/g, '"'));
          } catch (error) {
            curr.labels = curr.labels === 'related' ? [] : [ curr.labels ]
          }
        }
        curr.labels.forEach(label => {
          const found = acc.find(item => item.name === label);
          if (found) {
            found.value = found.value + 1;
          } else {
            acc.push({
              name: label,
              value: 1,
              colorValue: acc.length + 1
            })
          }
        });
      }
      return acc;
    }, initialAcc);
    return chartSeries;
  }

  setTreemapData(tweetdata){
    this.initChart();
    const seriesData = this.generateChartSeries(tweetdata);
    this.treeData = seriesData;
    const series: SeriesTreemapOptions = {
      type: 'treemap',
      layoutAlgorithm: 'squarified',
      events: {
        click: (event) => {
          if (this.treeFilters.includes(event.point.name)) {
            this.treeFilters = this.treeFilters.filter(item => item !== event.point.name);
          } else {
            this.treeFilters.push(event.point.name);
          }
          this.dataSource.filter = JSON.stringify(this.treeFilters);
        }
      },
      data: seriesData
    }
    this.chart.addSeries(series, true, true);
  }

  updateTreeMapData(tweetdata) {
    const currentSeries = this.chart.ref.series[0];
    const seriesData = this.generateChartSeries(tweetdata, this.treeData);
    this.treeData = seriesData;
    currentSeries.setData(seriesData);
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

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  removeTreeFilters() {
    this.treeFilters = [];
    this.dataSource.filter = JSON.stringify(this.treeFilters);
  }

  getSafeUrl(url) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

}
