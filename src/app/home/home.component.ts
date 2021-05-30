import { Component, OnInit } from '@angular/core';
import { SeriesPackedbubbleOptions, SeriesWordcloudOptions } from 'highcharts';
import { TweetdataService } from '../services/tweetdata.service';
import { Chart } from 'angular-highcharts';
import * as d3 from 'd3';
import { Apollo, gql } from 'apollo-angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {

  constructor(private tweetDataService: TweetdataService) { }

  currentPage = '/'
  cityDataSeries: SeriesPackedbubbleOptions;
  chart: Chart;
  wordChart: Chart;

  newSeriesData = [];

  isLoaded = false;

  svg;
  width = 800;
  height = 800;
  margin = 0;
  showEverything = true;
  filteredTweetData = [];

  ngOnInit() {
    this.tweetDataService.loadedSubject.subscribe(loaded => {
      this.isLoaded = loaded;
    });
    this.tweetDataService.getTweetDataSubject().subscribe(filteredTweetData => {
      let minSize = '20%';
      let maxSize = '150%';
      this.filteredTweetData = filteredTweetData;
    });
    this.tweetDataService.getIntents().subscribe(intentsData => {
      const parsedData = intentsData[0];
      this.createIntetnsLinkGraph(parsedData);
    });
    this.tweetDataService.getNewTweetObservable().subscribe(newTweets => {
      if (this.chart) this.updatePackedBubbleData(newTweets);
    });
  }

  createIntetnsLinkGraph(intentsdata) {
    if(!intentsdata) return;
    console.log(intentsdata);
    const force = d3.layout.force()
      .charge(-150)
      .chargeDistance(200)
      .linkDistance(50)
      .size([this.width, this.height]);

    
    const svg = d3.select("#graph").append("svg")
      .attr("width", "100%").attr("height", "100%")
      .attr("pointer-events", "all");
    const graphData = { links: [], nodes: [] };
    // GENERATE NODES
    let lastKeyItemIndex = 0;
    Object.keys(intentsdata).forEach(key => {
      if(Array.isArray(intentsdata[key])) {
        intentsdata[key].forEach(item => {
          const itemName = item // isNaN(+item[0]) ? item[0] : item[1];
          graphData.nodes.push({ label: key, title: itemName, connections: 1 })
          graphData.links.push({
            source: lastKeyItemIndex,
            target: graphData.nodes.length - 1
          });
          lastKeyItemIndex = graphData.nodes.length - 1;
        });
      } else if (key !== '__typename') {
        Object.keys(intentsdata[key]).forEach(item => {
          graphData.nodes.push({ label: key, title: item, connections: 1 })
          graphData.links.push({
            source: lastKeyItemIndex,
            target: graphData.nodes.length - 1
          });
          lastKeyItemIndex = graphData.nodes.length - 1;
          graphData.nodes.push(...intentsdata[key][item].map(str => ({ label: key, title: str, parent: item })))
        })
      }
    })

    // GENERATE LINKS
    graphData.nodes.forEach((node, sourceIndex) => {
      graphData.nodes.forEach((_node, targetIndex) => {
        if (
          (node.title === _node.title ||
          node.label === _node.label) && node.connections < 2
        ) {
            if (sourceIndex !== targetIndex) { 
              node.connections = node.connections ? node.connections + 1 : 1;
              _node.connections = _node.connections ? _node.connections + 1 : 1;
              graphData.links.push(({ 
                target: targetIndex, 
                source: sourceIndex
              }));
            }
        }
      });
    });

    console.log(graphData);
    this.drawIntetsGraphData(force, svg, graphData);
  }

  createTweetLinkGraph(tweetdata) {
    if (!tweetdata || !tweetdata.length) return;
    console.log('creating likn graph');
    const force = d3.layout.force()
      .charge(-150)
      .chargeDistance(200)
      .linkDistance(50)
      .size([this.width, this.height]);

    
    const svg = d3.select("#graph2").append("svg")
      .attr("width", "100%").attr("height", "100%")
      .attr("pointer-events", "all");
    const graphData = { links: [], nodes: [] };

    // GENERATE NODES
    graphData.nodes = tweetdata.map(tweet => ({
      username: tweet.username,
      preds: tweet.preds,
      userlocation: tweet.userlocation,
      link: `http://twitter.com/${tweet.username}/status/${tweet.idstr}`,
      connections: 0
    }))

    console.log(...[...new Set(tweetdata.map(tweet => tweet.preds))])

    // city: "Missing"
    // country: "Missing"
    // idstr: "1393595689989414914"
    // retweetcount: 0
    // text: "\"The dead bodies shown floating in Ganga is the footage of Nigeria not India.\" \n\n~ Life Changing Quotes\n    by Kangna Runout"
    // userfollowercount: 2415
    // __typename: "User"

    // GENERATE LINKS
    graphData.nodes.forEach((node, sourceIndex) => {
      graphData.nodes.forEach((_node, targetIndex) => {
        if (
          (
            node.username === _node.username ||
            node.preds === _node.preds
            )
          && node.connections < 1
        ) {
            if (sourceIndex !== targetIndex) {
              node.connections = node.connections ? node.connections + 1 : 1;
              _node.connections = _node.connections ? _node.connections + 1 : 1;
              graphData.links.push(({ 
                target: targetIndex, 
                source: sourceIndex
              }));
            }
        }
      });
    });
    graphData.nodes.forEach((node, sourceIndex) => {
      graphData.nodes.forEach((_node, targetIndex) => {
        if (
          node.userlocation === _node.userlocation &&
          node.connections > 1 && _node.connections > 1
        ) {
            if (sourceIndex !== targetIndex) {
              graphData.links.push(({ 
                target: targetIndex, 
                source: sourceIndex
              }));
            }
        }
      });
    });
    console.log(graphData);
    this.drawTweetGraphData(force, svg, graphData)
  }

  drawTweetGraphData(force, svg, graph: { links: any[], nodes: any[] }) {
    force.nodes(graph.nodes).links(graph.links).start();

    const radius = 10;

    const link = svg.selectAll(".link")
      .data(graph.links).enter()
      .append("line").attr("class", "link");

    const node = svg.selectAll(".node")
      .data(graph.nodes).enter()
      .append("circle")
      .attr("class", d => {
        return "node " + d.label
      }).attr("fill", d => {return this.string2RGB(d.preds)})
      // .attr("r", d => Math.floor(Math.random() * 20) + 10)
      .attr("r", d => radius)
      .call(force.drag)
      .on("click", (item, index) => {
        window.open(item.link, '_blank');
      });
      // .on("mouseover", handleMouseOver)
      // .on("mouseout", handleMouseOut);

    // html title attribute
    node.append("title")
      .text(d => {
        return d.preds;
      });

    // force feed algo ticks
    force.on("tick", () => {
      link.attr("x1", d => {
        return d.source.x;
      }).attr("y1", d => {
        return d.source.y;
      }).attr("x2", d => {
        return d.target.x;
      }).attr("y2", d => {
        return d.target.y;
      });

      node.attr("cx", d => {
        return Math.max(radius, Math.min((window.innerWidth - 17) - radius, d.x));
      }).attr("cy", d => {
        return Math.max(radius, Math.min((window.innerHeight) - radius, d.y));
      });
    });
  }

  drawIntetsGraphData(force, svg, graph: { links: any[], nodes: any[] }) {
    force.nodes(graph.nodes).links(graph.links).start();

    const radius = 10;

    const link = svg.selectAll(".link")
      .data(graph.links).enter()
      .append("line").attr("class", "link");

    const node = svg.selectAll(".node")
      .data(graph.nodes).enter()
      .append("circle")
      .attr("class", d => {
        return "node " + d.label
      }).attr("fill", d => {return this.string2RGB(d.label)})
      // .attr("r", d => Math.floor(Math.random() * 20) + 10)
      .attr("r", d => radius)
      .call(force.drag)
      .on("click", (item, index) => {
        console.log(item);
      });
      // .on("mouseover", handleMouseOver)
      // .on("mouseout", handleMouseOut);

    // html title attribute
    node.append("title")
      .text(d => {
        return d.label + ': ' + d.title;
      });

    // force feed algo ticks
    force.on("tick", () => {
      link.attr("x1", d => {
        return d.source.x;
      }).attr("y1", d => {
        return d.source.y;
      }).attr("x2", d => {
        return d.target.x;
      }).attr("y2", d => {
        return d.target.y;
      });

      node.attr("cx", d => {
        return Math.max(radius, Math.min((window.innerWidth - 17) - radius, d.x));
      }).attr("cy", d => {
        return Math.max(radius, Math.min((window.innerHeight) - radius, d.y));
      });
    });
  }

  string2RGB(string): string {
    var hash = 0;
    for (var i = 0; i < string.length; i++) {
       hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    var c = (hash & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();
  
    return '#' + ('00000'.substring(0, 6 - c.length) + c);
  }


  initBubbleChart(minSize = '50%', maxSize = '300%') {
    if (this.chart) this.chart.destroy();
    this.chart = new Chart({
      chart: {
        type: 'packedbubble',
        // backgroundColor: 'transparent'
      },
      title: {
        text: 'Most Frequent Tweet Locations'
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
        // backgroundColor: 'transparent'
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

  classifyByCity(tweetdata: any[]): { city: string, tweets: any[] }[] {
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
        const updatedData = { ...found.data[0] };
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

  hideEverything() {
    this.showEverything = false;
    d3.select("#graph").remove();
    this.createTweetLinkGraph(this.filteredTweetData);
  }
}
