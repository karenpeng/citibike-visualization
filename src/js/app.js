'use strict';

var document = require('global/document');
var window = require('global/window');
var React = require('react');
var Rcslider = require('rc-slider');
var ScatterplotExample = require('./scatterplot.react');
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
var timeData = [];
var stationData = {};

//@TODO: figure out how to do requestAnimationFrame properly in react
function tick(cb){
  animationID = requestAnimationFrame(function(){
    tick(cb);
  });
  cb();
}

function detect(increase, decrease, size){

  var gap = moment(timeData[index]['time']).diff(fakeTime);
  
  while(gap <= 0){

    if(timeData[index]['prop'] === 'start'){
      decrease(timeData[index]['id']);
    }else{
      increase(timeData[index]['id']);
    }

    index ++;
    
    if(index === size){
      console.log('STOP!')
      window.cancelAnimationFrame(animationID);
      return;
    }

    gap = moment(timeData[index]['time']).diff(fakeTime);
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
      loaded: 0,
      ticking: false
    };
  },

  _increaseDot: function(key){

    stationData[key].radius ++
    stationData[key].radius = stationData[key].radius < 0 ? 0 : stationData[key].radius

    this.setState({
      dots: stationData
    })
  },

  _decreaseDot: function(key){

    stationData[key].radius --
    stationData[key].radius = stationData[key].radius < 0 ? 0 : stationData[key].radius

    this.setState({
      dots: stationData
    })
  },

  handleResize: function(){
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    })
  },

  handleClick: function(){
    
    tick(detect.bind(this, this._increaseDot, this._decreaseDot, timeData.length));
  
    this.setState({
      ticking: true
    })
  },

  handleSlide: function(value){
    console.log(value);
    RATE = 10000 + value * 100;
  },

  componentDidMount: function(){
    var that = this;

    //@TODO: figure out how to do this without settimeout maybe?
    //cus the loading blocks the loading of the map
    setTimeout(function(){
        
      that.setState({
        loaded: 1
      });

      loadData(function(_timeData, _stationData){
        timeData = _timeData;
        stationData = _stationData;

        that.setState({ 
          dots: _stationData,
          loaded: 0
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
        r.button(assign({
          onClick: this.handleClick,
          disabled: this.state.loaded === 1,
          className: 'btn'
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
        className: this.state.loaded === 0 ? 'gone' : 'show'
      }, [
        r.p({className: 'loading'}, 'loading data...'),
        r.div({className: 'bg'})
      ])
    ])
  }

})

React.render(r(App), document.getElementById('chart'));
