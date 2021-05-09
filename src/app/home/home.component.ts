import { Component, OnInit } from '@angular/core';
import { PlotPackedbubbleOptions, SeriesPackedbubbleOptions } from 'highcharts';
import { TweetdataService } from '../services/tweetdata.service';
import { Chart } from 'angular-highcharts';
import * as Highcharts from 'highcharts';
import more from 'highcharts/highcharts-more';
more(Highcharts);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {

  constructor(private tweetDataService: TweetdataService) {}
  
  currentPage = '/'
  cityDataSeries: SeriesPackedbubbleOptions;
  chart: Chart;

  ngOnInit() {
    this.tweetDataService.getTweetDataSubject().subscribe(filteredTweetData => {
      let minSize = '50%';
      let maxSize = '300%';
      if(filteredTweetData.length === 1) { maxSize = '100%'; minSize = '10%' }
      if(filteredTweetData.length === 2) { maxSize = '150%'; minSize = '10%' }
      this.setPackedBubbleData(filteredTweetData, minSize, maxSize);
    });
  }

  initChart(minSize='50%', maxSize='300%') {
    if (this.chart) this.chart.destroy();
    this.chart = new Chart({
      chart: {
          type: 'packedbubble',
      },
      title: {
          text: 'Untitled'
      },
      credits: {
        enabled: false
      },
      tooltip: {
          useHTML: true,
          pointFormat: '<b>{point.name}:</b> {point.value} tweets'
      },
      plotOptions: {
          packedbubble: {
              minSize,
              maxSize,
              layoutAlgorithm: {
                  splitSeries: '',
                  gravitationalConstant: 0.02
              },
              dataLabels: {
                  enabled: true,
                  format: '{point.name}',
                  filter: {
                      property: 'y',
                      operator: '>',
                      value: 250
                  },
                  style: {
                      color: 'black',
                      textOutline: 'none',
                      fontWeight: 'normal'
                  }
              }
          }
      },
      series: []
    });
  }

  setPackedBubbleData(tweetdata, minSize?, maxSize?) {
    this.initChart(minSize, maxSize);
    const classifiedByCity = tweetdata.reduce((acc, curr) => {
      const city = curr['tweet_cityname'];
      const foundCity = acc.find(item => item.city === city);
      if (foundCity) {
        foundCity.tweets.push(curr);
      } else {
        acc.push({
          city,
          tweets: [curr]
        })
      }
      return acc;
    }, []);
    const series = [];
    classifiedByCity.forEach(city => {
      const citySeries: SeriesPackedbubbleOptions = {
        name: city.city,
        type: 'packedbubble',
        data: [{
          name: city.city,
          value: city.tweets.length
        }]
      }
      series.push(citySeries);
    });
    series
      .sort((a, b) => b.data[0].value - a.data[0].value)
      .slice(0, 10)
      .forEach(series => this.chart.addSeries(series, true, true))
  }
}
