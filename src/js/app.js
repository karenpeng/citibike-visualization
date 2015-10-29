'use strict';

var document = require('global/document');
var window = require('global/window');
var React = require('react');
var Rcslider = require('rc-slider');
var ScatterplotExample = require('./scatterplot.react');
var Clock = require('./clock');
var getAccessToken = require('./util');
var token = require('./../../token.json').token[2];

//var Immutable = require('immutable');
var d3 = require('d3');
var r = require('r-dom');
var assign = require('object-assign');
var moment = require('moment');

var loadData = require('./data.processing');
var animationID;
var index = 0;
var RATE = 10000;
var fakeTime = moment("9/1/2015 00:00:00").subtract(RATE, 'millisecond');
var timeData;
var stationData = {};

var scale = d3.scale.linear().range([0, 1]).domain([60, 6])

//@TODO: figure out how to do requestAnimationFrame properly in react
function tick(cb){
  animationID = requestAnimationFrame(function(){
    tick(cb);
  });
  cb();
}

function detect(increase, decrease, updateTime, size){

  updateTime(fakeTime.hours(), fakeTime.minutes(), fakeTime.seconds());

  var gap = moment(timeData.get(index).get('time')).diff(fakeTime);
  //console.log(gap)
  
  while(gap <= 0){

    if(timeData.get(index).get('prop') === 'start'){
      decrease(timeData.get(index).get('id'));
    }else{
      increase(timeData.get(index).get('id'));
    }

    index ++;
    
    if(index === size){
      console.log('STOP!')
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
      second: fakeTime.seconds()
    };
  },

  _increaseDot: function(key){

    stationData[key].radius += scale(stationData[key].radius)
    stationData[key].radius = stationData[key].radius < 0 ? 0 : stationData[key].radius

    this.setState({
      dots: stationData
    })
  },

  _decreaseDot: function(key){

    stationData[key].radius -= scale(stationData[key].radius)
    stationData[key].radius = stationData[key].radius < 0 ? 0 : stationData[key].radius

    this.setState({
      dots: stationData
    })
  },

  _updateTime: function(h, m, s){

    this.setState({
      hour: h,
      minute: m,
      second: s
    })
  },

  handleResize: function(){
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    })
  },

  handleClick: function(){
    
    tick(detect.bind(this, this._increaseDot, this._decreaseDot, this._updateTime, timeData.size));
  
    this.setState({
      month: fakeTime.month(),
      date: fakeTime.date(),
      ticking: true
    })
  },

  handleSlide: function(value){
    RATE = 10000 + value * 100;
  },

  componentDidMount: function(){
    var that = this;

    //@TODO: figure out how to do this without settimeout maybe?
    //cus the loading blocks the loading of the map
    setTimeout(function(){
        
      that.setState({
        init: true
      });

      loadData(function(_timeData, _stationData){
        timeData = _timeData;
        window.timeData = timeData;
        stationData = _stationData;

        that.setState({ 
          dots: _stationData,
          loaded: true
        });

      });

    }, 5000);
  },

  render: function(){
    
    return r.div({}, [
      r(ScatterplotExample, assign({
        width: this.state.width,
        height: this.state.height,
        style: {float: 'left'},
        //mapboxApiAccessToken: getAccessToken(),
        mapboxApiAccessToken: token,
        dots: this.state.dots
      })),

      r.div({
        className: 'panel'
      }, [

        r(Clock, assign({
          month: this.state.month,
          date: this.state.date,
          hour: this.state.hour,
          minute: this.state.minute,
          second: this.state.second,
          _className: 'clock'
        })),

        r.button(assign({
          onClick: this.handleClick,
          disabled: !this.state.loaded || this.state.ticking,
          className: 'btn',
          className: (this.state.loaded && !this.state.ticking) ? 'clickable' : 'unclickable'
        }), 'start'),

        r(Rcslider, assign({
          onChange: this.handleSlide,
          disabled: !this.state.ticking,
          defaultValue: 0,
          min: -10,
          max: 10,
          step: 1
        }))
      ]),

      r.div({
        className: (this.state.init && !this.state.loaded) ? 'show' : 'gone'
      }, [
        r.p({className: 'loading'}, 'loading data...'),
        r.div({className: 'bg'})
      ])
    ])
  }

})

React.render(r(App), document.getElementById('chart'));
