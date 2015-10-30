'use strict';

var document = require('global/document');
var window = require('global/window');
var React = require('react');
var Rcslider = require('rc-slider');
var ScatterplotExample = require('./scatterplot.react');
var Clock = require('./clock');
var Control = require('./control');
var Loading = require('./loading');
var Info = require('./info');
var r = require('r-dom');
var getAccessToken = require('./util/token');
var token = require('./../../token.json').token[2];

//var Immutable = require('immutable');
var d3 = require('d3');
var assign = require('object-assign');
var moment = require('moment');
var requestAnimationFrame = require('./util/requestAnimationFrame');
var loadData = require('./data.processing');

var animationID;
var index = 0;
var RATE = 20000;
var fakeTime = moment("2015/09/01 00:00:00").subtract(RATE, 'millisecond');
var timeData;
var size;
var stationData = {};

var scale = d3.scale.linear().range([0, 1]).domain([30, 1])

//@TODO: figure out how to do requestAnimationFrame properly in react
function tick(cb){
  animationID = requestAnimationFrame(function(){
    tick(cb);
  });
  cb();
}

function detect(increase, decrease, updateTime, dayAndNight){

  var d = fakeTime.date();
  var h = +fakeTime.hours();

  dayAndNight((h < 18 && h >= 6));

  updateTime(fakeTime.month(), d, h, fakeTime.minutes(), fakeTime.seconds());

  var gap = moment(timeData.get(index).get('time')).diff(fakeTime);

  while(gap <= 0){

    if(timeData.get(index).get('prop') === 'start'){
      decrease(timeData.get(index).get('id'));
    }else{
      increase(timeData.get(index).get('id'));
    }

    index ++;
    
    if(index >= size - 1 || d === 3){
      console.log('STOP!')
      this.setState({
        done: true
      })
      window.cancelAnimationFrame(animationID);
      return;
    }

    gap = moment(timeData.get(index).get('time')).diff(fakeTime);
  }

  fakeTime.add(RATE, 'millisecond');

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
      month: fakeTime.month(),
      date: fakeTime.date(),
      hour: fakeTime.hours(),
      minute: fakeTime.minutes(),
      second: fakeTime.seconds(),
      isDay: false,
      done: false
    };
  },

  _increaseDot: function(key){
    stationData[key].radius += scale(stationData[key].radius);
  },

  _decreaseDot: function(key){
    stationData[key].radius -= scale(stationData[key].radius);
    stationData[key].radius = stationData[key].radius < 0 ? 0 : stationData[key].radius;
  },

  _updateTime: function(mo, d, h, m, s){
    this.setState({
      month: mo,
      date: d,
      hour: h,
      minute: m,
      second: s
    });
  },

  _dayAndNight: function(day){
    this.setState({
      isDay: day
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
      tick(detect.bind(this, this._increaseDot, this._decreaseDot, this._updateTime, this._dayAndNight));
    
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
    RATE = 20000 + value * 2000;
    console.log(RATE);
  },

  componentDidMount: function(){
    window.addEventListener('resize', this.handleResize, false);

    var that = this;

    //@TODO: figure out how to do this without settimeout maybe?
    //cus the loading blocks the loading of the map
    setTimeout(function(){
        
      that.setState({
        init: true
      });

      loadData(function(_timeData, _stationData){
        timeData = _timeData;
        size = _timeData.size;
        stationData = _stationData;

        that.setState({ 
          dots: _stationData,
          loaded: true
        });

      });

    }, 5000);
  },

  render: function(){

    var buttonClass = this.state.ticking ? 'pause' : 'start';
    buttonClass = !this.state.loaded ? 'unclickable' : buttonClass;
    
    return r.div({}, [
      r(ScatterplotExample, assign({
        width: this.state.width,
        height: this.state.height,
        style: {float: 'left'},
        //mapboxApiAccessToken: getAccessToken(),
        mapboxApiAccessToken: token,
        dots: this.state.dots,
        mapStyle: this.state.isDay ? 'mapbox://styles/mapbox/light-v8' : 'mapbox://styles/mapbox/dark-v8'
      })),

      r.div({
        className: 'panel'
      }, [

        r(Clock, assign({
          month: this.state.month,
          date: this.state.date,
          hour: this.state.hour,
          minute: this.state.minute,
          second: this.state.second
        })),

        r(Control, assign({
          handleClick: this.handleClick,
          handleSlide: this.handleSlide,
          buttonDisabled:!this.state.loaded || this.state.done,
          sliderDisabled: !this.state.ticking || !this.state.loaded || this.state.done,
          buttonClassName: buttonClass,
          buttonString: this.state.ticking? 'pause' : 'start'
        }))

      ]),

      r(Loading, assign({
        loadingClassName: (this.state.init && !this.state.loaded) ? 'show' : 'gone'
      })),

      r(Info)
    ])
  }

})

React.render(r(App), document.getElementById('chart'));
