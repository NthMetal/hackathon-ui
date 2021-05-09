import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { PlotPackedbubbleOptions, SeriesPackedbubbleOptions } from 'highcharts';
import * as Highcharts from 'highcharts';
import more from 'highcharts/highcharts-more';
import { TweetdataService } from '../services/tweetdata.service';
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
  chart = new Chart({
    chart: {
        type: 'packedbubble',
    },
    title: {
        text: 'Untitled'
    },
    tooltip: {
        useHTML: true,
        pointFormat: '<b>{point.name}:</b> {point.value} tweets'
    },
    plotOptions: {
        packedbubble: {
            minSize: '50%',
            maxSize: '500%',
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

  ngOnInit() {
    const tweetdata = this.tweetDataService.getTweetData();
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
    this.cityDataSeries = {
      name: 'City',
      type: 'packedbubble',
      data: classifiedByCity.map(city => ({
        name: city.city,
        value: city.tweets.length
      }))
    }
    this.chart.addSeries(this.cityDataSeries, true, true);
    console.log(classifiedByCity);
  }
}
