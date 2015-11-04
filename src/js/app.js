'use strict';

var document = require('global/document');
var window = require('global/window');
var React = require('react');
var ReactDOM = require('react-dom');
var r = require('r-dom');
var assign = require('object-assign');
var d3 = require('d3');
var moment = require('moment');
var Immutable = require('immutable');

var requestAnimationFrame = require('./util/requestAnimationFrame');
var getAccessToken = require('./util/token');
var token = require('./../../processed_data/token.json').token[0];
var ColorInterpolate = require('sky-color-generator');
var mySkyColor = new ColorInterpolate();
var myDotColor = new ColorInterpolate();

myDotColor.set(0, [170, 222, 255, 1]);
myDotColor.set(1440, [170, 222, 255, 1]);
myDotColor.set(360, [132, 189, 245, 1]);
myDotColor.set(1080, [132, 189, 245, 1]);
myDotColor.set(420, [0, 167, 230, 1]);
myDotColor.set(1020, [0, 167, 230, 1]);


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
//var total = 0;

var stationURL = 'http://karenpeng.github.io/citibike-visualization/processed_data/stations.json';
var recordURL = 'http://karenpeng.github.io/citibike-visualization/processed_data/records.json';

var scale = d3.scale.sqrt().range([0, 30]).domain([0, 60]);

//@TODO: figure out how to do requestAnimationFrame properly in react
function tick(cb){
  animationID = requestAnimationFrame(function(){
    tick(cb);
  });
  cb();
}

var App = React.createClass({

  displayName: 'App',

  getInitialState: function(){
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
      //total: 0
      skyColor: 'rgba(0, 0, 0, 0.5)',
      dotColor: 'rgba(0, 0, 0, 0)'
    };
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
        
        timeData = Immutable.fromJS(data['records']);
        size = timeData.size;
        //console.dir(timeData);

        var _h = fakeTime.hours();
        var _m = fakeTime.minutes();
        var _minutes = _h * 60 + _m;
        mySkyColor.init(_minutes);
        myDotColor.init(_minutes);

        that.setState({ 
          dots: stationData,
          loaded: true,
          month: fakeTime.month(),
          date: fakeTime.date(),
          hour: _h,
          minute: _m,
          second: fakeTime.seconds(),
          isDay: (_h <= 17 && _h >= 7),
          skyColor: mySkyColor.get(_minutes),
          dotColor: myDotColor.get(_minutes)
        });
      });
    });

  },

  handleResize: function(){
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
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

    var _d = fakeTime.date();
    var _h = fakeTime.hours();
    var _m = fakeTime.minutes();

    var _minutes = _h * 60 + _m;

    if(_minutes === 0){
      mySkyColor.startDay();
      myDotColor.startDay();
    }

    this.setState({
      month: fakeTime.month(),
      date: _d,
      hour: _h,
      minute: _m,
      second: fakeTime.seconds(),
      isDay: (_h <= 17 && _h >= 7),
      skyColor: mySkyColor.get(_minutes),
      dotColor: myDotColor.get(_minutes)
    })

    var gap = moment(timeData.get(index).get('time')).diff(fakeTime);

    while(gap <= 0){

      if(timeData.get(index).get('prop') === 'start'){
        this._decreaseDot(timeData.get(index).get('id'));
      }else{
        this._increaseDot(timeData.get(index).get('id'));
      }

      index ++;
      
      if(index >= size - 1 || _d === 4){
        console.log('STOP!')
        this.setState({
          done: true
        })
        window.cancelAnimationFrame(animationID);
        return;
      }

      gap = moment(timeData.get(index).get('time')).diff(fakeTime);
    }

    fakeTime.add(rate, 'millisecond');
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
        //mapStyle: this.state.isDay ? 'mapbox://styles/mapbox/light-v8' : 'mapbox://styles/mapbox/dark-v8',
        bgColor: this.state.skyColor,
        dotColor: this.state.dotColor
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

ReactDOM.render(r(App), document.getElementById('chart'));
