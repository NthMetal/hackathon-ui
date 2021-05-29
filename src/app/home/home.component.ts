import { Component, OnInit } from '@angular/core';
import { SeriesPackedbubbleOptions, SeriesWordcloudOptions } from 'highcharts';
import { TweetdataService } from '../services/tweetdata.service';
import { Chart } from 'angular-highcharts';
import * as d3 from 'd3';

const tweetdata = { 
  "keyelements": [
    ["Mahabubnagar Telangan RT", 7.9],
    ["ICU", 7.09],
    ["injection", 6.4],
    ["patient", 4.09],
    ["Gurgaon", 3.7],
    ["friend", 3.7],
    ["Kaushik Sikdar", 3.5],
    ["Remdesivir", 3.5]
  ], 
  "namedentities": { 
    "Administrative geographic areas": [
      "Patiente", 
      "Miyapur", 
      "Bhutan", 
      "Calcutta", 
      "Chennai", 
      "United States of America", 
      "Bangalore", 
      "Varanasi", 
      "Hyderabad", 
      "Vijayawada", 
      "Bhubaneswar", 
      "Coimbatore", 
      "Mysore", 
      "Patna", 
      "Gurgaon", 
      "Kakinada"
    ], 
    "Building": ["ICU"], 
    "Businesses / companies": ["Telef\u00f3nica O2 Europe"], 
    "Humans": [
      "Jake", 
      "Edwina", 
      "Abu IsRael", 
      "Maami", 
      "Tharoor", 
      "Mountbatten", 
      "Tocillizumab", 
      "Kaushik Sikdar", 
      "Other Blue Lol", 
      "Sonu", 
      "Johnson", 
      "Prabir", 
      "Nand La Very",
      "Very Urgent", 
      "Murali KrishnaAge",
      "Urgentur Friend Arya Mani"
    ], 
    "Money": ["3 dollar"], 
    "Organizations / societies / institutions": ["Mahabubnagar Telangan RT", "Contact N They", "ACTEMRA", "TOCILIZUMAB"], 
    "Phone number": ["6352771379", "+91 7021402080"], 
    "Physical phenomena": ["Lungs Infection", "COVID-19"], 
    "Product": ["WE ARE TRYING TO Need", "ventilatorsI", "mucormycosisPatient", "Remdesivir", "UNeed Remdesivir"], 
    "Proper noun": ["GujaratYebin", "helpLocation", "sirMy", "LIPOSOMAL", "Tikamda", "iCU", "Mahabubnagar Telangana", "aND wE dEsperately nEEd oXyGen", "iN", "tO", "sto wE", "High Fl Please", "Baraut Bhagpat Uttar Pradesh", "Remdesivir Inj", "Gandhi HOSIPITAL BED", "NEED ICU BED IN VIZAGSPO2", "GOI", "Thats", "Lalbagh", "requirementPatient", "sirPatient", "Thankyou", "The Heart of No Need", "Cont Need ICU BED", "hyderabadPlease", "BeckhamWe", "Bhagpat", "Sheilds", "N95", "Add Please", "BED", "Need Remdesivir", "Bhatinda", "Pathankot", "87Reqirment", "SpO2:85", "BVS", "Visakhapatnam"], 
    "Web address": ["Chennai.Urgently.If"] 
  }, 
  "categories": [
    ["20000457", "Medical conditions", 21.92],
    ["20000462", "Hospital and clinic", 17.53],
    ["20000478", "Therapy", 5.82],
    ["20000787", "Parent and child", 4.46]
  ] 
}

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
    this.createLinkGraph();

  }

  createLinkGraph() {
    console.log('creating likn graph')
    const force = d3.layout.force()
      .charge(-200).linkDistance(30).size([this.width, this.height]);
    const svg = d3.select("#graph").append("svg")
      .attr("width", "100%").attr("height", "100%")
      .attr("pointer-events", "all");
    const graphData = { links: [], nodes: [] };

    // GENERATE NODES
    let lastKeyItemIndex = 0;
    Object.keys(tweetdata).forEach(key => {
      if(Array.isArray(tweetdata[key])) {
        tweetdata[key].forEach(item => {
          const itemName = isNaN(+item[0]) ? item[0] : item[1];
          graphData.nodes.push({ label: key, title: itemName })
          graphData.links.push({
            source: lastKeyItemIndex,
            target: graphData.nodes.length - 1
          });
          lastKeyItemIndex = graphData.nodes.length - 1;
        });
      } else {
        Object.keys(tweetdata[key]).forEach(item => {
          graphData.nodes.push({ label: key, title: item })
          graphData.links.push({
            source: lastKeyItemIndex,
            target: graphData.nodes.length - 1
          });
          lastKeyItemIndex = graphData.nodes.length - 1;
          graphData.nodes.push(...tweetdata[key][item].map(str => ({ label: key, title: str, parent: item })))
        })
      }
    })

    // GENERATE LINKS
    graphData.nodes.forEach((node, sourceIndex) => {
      graphData.nodes.forEach((_node, targetIndex) => {
        if (
          node.title === _node.title ||
          node.parent === _node.title
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
    this.drawGraphData(force, svg, graphData)
  }

  drawGraphData(force, svg, graph: { links: any[], nodes: any[] }) {
    console.log(graph.nodes);
    force.nodes(graph.nodes).links(graph.links).start();

    const link = svg.selectAll(".link")
      .data(graph.links).enter()
      .append("line").attr("class", "link");

    const node = svg.selectAll(".node")
      .data(graph.nodes).enter()
      .append("circle")
      .attr("class", d => {
        return "node " + d.label
      })
      // .attr("r", d => Math.floor(Math.random() * 20) + 10)
      .attr("r", d => 10)
      .call(force.drag)
      .on("click", (item, event) => {
        console.log(item, event);
      });
      // .on("mouseover", handleMouseOver)
      // .on("mouseout", handleMouseOut);

    // html title attribute
    node.append("title")
      .text(d => {
        return d.title;
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
        return d.x;
      }).attr("cy", d => {
        return d.y;
      });
    });
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
}
