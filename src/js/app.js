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

var d3 = require('d3');
var assign = require('object-assign');
var moment = require('moment');
//var SkyColor = require('sky-color-generator');
var requestAnimationFrame = require('./util/requestAnimationFrame');
var loadData = require('./data.processing');

var animationID;
var index = 0;
var RATE = 20000;
var fakeTime = moment("2015/09/01 00:00:00").subtract(RATE, 'millisecond');
var timeData;
var size;
var stationData = {};
var total = 0;

var scale = d3.scale.linear().range([0, 1.5]).domain([36, 1]);
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
      month: 0,
      date: 0,
      hour: 0,
      minute: 0,
      second: 0,
      isDay: false,
      done: false,
      total: 0
    };
  },

  _increaseDot: function(key){
    stationData[key].radius += scale(stationData[key].radius);
  },

  _decreaseDot: function(key){
    stationData[key].radius -= scale(stationData[key].radius);
    stationData[key].radius = stationData[key].radius < 0 ? 0 : stationData[key].radius;
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
    RATE = 20000 + value * 2000;
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

  animate: function(){

    var d = fakeTime.date();
    var h = +fakeTime.hours();

    this.setState({
      month: fakeTime.month(),
      date: d,
      hour: h,
      minute: fakeTime.minutes(),
      second: fakeTime.seconds(),
      isDay: (h < 18 && h >= 6)
    })

    var gap = moment(timeData.get(index).get('time')).diff(fakeTime);

    while(gap <= 0){

      if(timeData.get(index).get('prop') === 'start'){
        this._decreaseDot(timeData.get(index).get('id'));
      }else{
        total++;
        this.setState({
          total: total
        });
        this._increaseDot(timeData.get(index).get('id'));
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
        //mapStyle: this.state.isDay ? 'mapbox://styles/mapbox/light-v8' : 'mapbox://styles/mapbox/dark-v8'
        bgColor: '#000000',
        bgAlpha: 0.4
      })),

      r.div({
        className: 'panel'
      }, [

        r.h2({
          className: 'total'
        }, 'Total Rides: ' + this.state.total),

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
