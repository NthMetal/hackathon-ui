import { Component, OnInit } from '@angular/core';
import { SeriesPackedbubbleOptions, SeriesWordcloudOptions } from 'highcharts';
import { TweetdataService } from '../services/tweetdata.service';
import { Chart } from 'angular-highcharts';

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
  wordChart: Chart;

  newSeriesData = [];

  isLoaded = false;

  ngOnInit() {
    this.tweetDataService.loadedSubject.subscribe(loaded => {
      this.isLoaded = loaded;
    });
    this.tweetDataService.getTweetDataSubject().subscribe(filteredTweetData => {
      let minSize = '20%';
      let maxSize = '150%';
      this.setPackedBubbleData(filteredTweetData.slice(0, 100), minSize, maxSize);
      // this.setWordChartData(filteredTweetData);
    });
    this.tweetDataService.getNewTweetObservable().subscribe(newTweets => {
      if (this.chart) this.updatePackedBubbleData(newTweets);
    });
  }

  initBubbleChart(minSize='50%', maxSize='300%') {
    if (this.chart) this.chart.destroy();
    this.chart = new Chart({
      chart: {
          type: 'packedbubble',
          backgroundColor: 'transparent'
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

  initWordChart() {
    this.wordChart = new Chart({
      chart: {
        type: 'wordcloud',
        backgroundColor: 'transparent'
      },
      credits: {
        enabled: false
      },
      title: {
        text: 'Wordcloud'
      },
      series: []
    });
  }

  classifyByCity(tweetdata: any[]): {city: string, tweets: any[] }[] {
    return tweetdata.reduce((acc, curr) => {
      const city = curr.user ? curr.user.location : 'Missing';
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
  }

  setPackedBubbleData(tweetdata: any[], minSize?, maxSize?) {
    this.initBubbleChart(minSize, maxSize);
    const classifiedByCity = this.classifyByCity(tweetdata);
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

  setWordChartData(tweetdata: any[]) {
    this.initWordChart();
    const allText = tweetdata.reduce((acc, curr) => {
      acc += curr.text + '\n'
      return acc;
    }, '');
    const lines = allText.split(/[,\. ]+/g);
    const data = lines.reduce((arr, word) => {
        var obj = arr.find(obj => obj.name === word);
        if (obj) {
            obj.weight += 1;
        } else {
            obj = {
                name: word,
                weight: 1
            };
            arr.push(obj);
        }
        return arr;
    }, []);
    const wordChartSeries: SeriesWordcloudOptions = {
      type: 'wordcloud',
      data,
      name: 'Occurrences'
    }
    this.wordChart.addSeries(wordChartSeries, true, true);
  }

  updatePackedBubbleData(tweetdata) {
    const classifiedByCity = this.classifyByCity(tweetdata);
    classifiedByCity.forEach(city => {
      const found = this.chart.ref.series.find(series => series.name === city.city);
      if (found) {
        const updatedData = {... found.data[0]};
        updatedData.value = updatedData.value + city.tweets.length;
        found.setData([updatedData])
        // const updatedData = [...found.data, {
        //   name: city.city,
        //   value: city.tweets.length
        // }];
        // found.setData(updatedData);
      } else {
        let found = this.newSeriesData.find(item => item.name === city.city);
        if (found) {
          found.value = found.value + city.tweets.length;
        } else {
          found = {
            name: city.city,
            value: city.tweets.length
          };
          this.newSeriesData.push(found);
        }
        const lowestSeries = this.chart.ref.series
          .sort((a, b) => a.data[0].value - b.data[0].value)[0]
        
        if (!lowestSeries || this.chart.ref.series.length < 2) {
          const citySeries: SeriesPackedbubbleOptions = {
            name: city.city,
            type: 'packedbubble',
            data: [{
              name: city.city,
              value: found.value
            }]
          }
          this.newSeriesData.splice(this.newSeriesData.indexOf(found), 1);
          this.chart.addSeries(citySeries, true, true);
        }
        
        if (this.chart.ref.series.length > 1 && found.value > lowestSeries.data[0].value) {
          const citySeries: SeriesPackedbubbleOptions = {
            name: city.city,
            type: 'packedbubble',
            data: [{
              name: city.city,
              value: found.value
            }]
          }
          this.newSeriesData.push({
            name: lowestSeries.name,
            value: lowestSeries.data[0].value
          })
          this.newSeriesData.splice(this.newSeriesData.indexOf(found), 1);
          this.chart.removeSeries(this.chart.ref.series.indexOf(lowestSeries));
          this.chart.addSeries(citySeries, true, true);
        }
      }
    });
    // [0].name
    // console.log(this.chart.ref.series[0].name);
    // this.chart.ref.series[0].setData([], true, true)
  }
}
