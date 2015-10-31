'use strict';

var document = require('global/document');
var window = require('global/window');
var React = require('react');
var r = require('r-dom');
var assign = require('object-assign');
var d3 = require('d3');
var moment = require('moment');
//var SkyColor = require('sky-color-generator');
var requestAnimationFrame = require('./util/requestAnimationFrame');
var getAccessToken = require('./util/token');
var token = require('./../../processed_data/token.json').token[1];

var ScatterplotExample = require('./ui/scatterplot.react');
var Clock = require('./ui/clock');
var Rcslider = require('rc-slider');
var Control = require('./ui/control');
var Loading = require('./ui/loading');
var Info = require('./ui/info');

var animationID;
var index = 0;
var rate = 20000;
var fakeTime = moment("2015-09-01T00:00:00.000Z").subtract(rate, 'millisecond');
var size;
var timeData;
var stationData = {};
var total = 0;

var stationURL = 'http://karenpeng.github.io/citibike-visualization/processed_data/stations.json';
var recordURL = 'http://karenpeng.github.io/citibike-visualization/processed_data/records.json';

var scale = d3.scale.sqrt().range([0, 30]).domain([0, 60]);
//var skyColor = new SkyColor();

//@TODO: figure out how to do requestAnimationFrame properly in react
function tick(cb){
  animationID = requestAnimationFrame(function(){
    tick(cb);
  });
  cb();
}

var App = React.createClass({

  displayName: 'App',

  getInitialState: function getInitialState(){
    return{
      dots: {},
      width: window.innerWidth,
      height: window.innerHeight,
      init: false,
      loaded: false,
      ticking: false,
      month: -1,
      date: 0,
      hour: 0,
      minute: 0,
      second: 0,
      isDay: false,
      done: false,
      total: 0
    };
  },

  handleResize: function(){
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  },

  componentDidMount: function(){
    window.addEventListener('resize', this.handleResize, false);

    var that = this;

    that.setState({
      init: true
    });

    d3.json(stationURL, function(err, data){

      if(err){
        console.log(err);
        return;
      }

      stationData = data;
      //console.dir(stationData);

      d3.json(recordURL, function(err, data){

        if(err){
          console.log(err);
          return;
        }
        
        timeData = data['records'];
        //console.dir(timeData);

        var h = fakeTime.hours();

        that.setState({ 
          dots: stationData,
          loaded: true,
          month: fakeTime.month(),
          date: fakeTime.date(),
          hour: h,
          minute: fakeTime.minutes(),
          second: fakeTime.seconds(),
          isDay: (h < 18 && h >= 6)
        });
      });

    });

  },

  _increaseDot: function(key){
    stationData[key]['count'] ++;
    stationData[key]['radius'] = d3.round(scale(stationData[key]['count']), 1);
  },

  _decreaseDot: function(key){
    stationData[key]['count'] --;
    //something wrong with the data
    stationData[key]['count'] = stationData[key]['count'] < 0 ? 0 : stationData[key]['count'];
    stationData[key]['radius'] = d3.round(scale(stationData[key]['count']), 1);
  },

  animate: function(){

    var d = fakeTime.date();
    var h = fakeTime.hours();

    this.setState({
      month: fakeTime.month(),
      date: d,
      hour: h,
      minute: fakeTime.minutes(),
      second: fakeTime.seconds(),
      isDay: (h < 18 && h >= 6)//,
      //skyColor: skyColor(h)
    })

    var gap = moment(timeData[index]['time']).diff(fakeTime);

    while(gap <= 0){

      if(timeData[index]['prop'] === 'start'){
        this._decreaseDot(timeData[index]['id']);
      }else{
        this._increaseDot(timeData[index]['id']);
      }

      index ++;
      
      if(index >= size - 1 || d === 4){
        console.log('STOP!')
        this.setState({
          done: true
        })
        window.cancelAnimationFrame(animationID);
        return;
      }

      gap = moment(timeData[index]['time']).diff(fakeTime);
    }

    fakeTime.add(rate, 'millisecond');
  },


  handleClick: function(){

    if(!this.state.ticking){    
      tick(this.animate);
    
      this.setState({
        ticking: true
      });

    }else{
      console.log('STOP!')
      window.cancelAnimationFrame(animationID);

      this.setState({
        ticking: false
      });
    }

  },

  handleSlide: function(value){
    rate = 20000 + value * 2000;
  },

  render: function(){

    var buttonClass = this.state.ticking ? 'pause' : 'start';
    buttonClass = !this.state.loaded || this.state.done ? 'unclickable' : buttonClass;
    
    return r.div({}, [
      r(ScatterplotExample, assign({
        width: this.state.width,
        height: this.state.height,
        style: {float: 'left'},
        //mapboxApiAccessToken: getAccessToken(),
        mapboxApiAccessToken: token,
        dots: this.state.dots,
        mapStyle: this.state.isDay ? 'mapbox://styles/mapbox/light-v8' : 'mapbox://styles/mapbox/dark-v8',
        bgColor: 'rgba(0, 100, 200, 0)'
      })),

      r(Clock, assign({
        month: this.state.month,
        date: this.state.date,
        hour: this.state.hour,
        minute: this.state.minute,
        second: this.state.second
      })),

      // r.h2({
      //   className: 'total'
      // }, 'Total Rides: ' + this.state.total),

      r(Control, assign({
        handleClick: this.handleClick,
        handleSlide: this.handleSlide,
        buttonDisabled:!this.state.loaded || this.state.done,
        sliderDisabled: !this.state.ticking || !this.state.loaded || this.state.done,
        buttonClassName: buttonClass,
        buttonString: this.state.ticking? 'pause' : 'start'
      })),

      r(Loading, assign({
        loadingClassName: (this.state.init && !this.state.loaded) ? 'show' : 'gone'
      })),

      r(Info)
    ])
  }

})

React.render(r(App), document.getElementById('chart'));
