'use strict';

var document = require('global/document');
var React = require('react');
var Rcslider = require('rc-slider');
var App = require('./app');

var Immutable = require('immutable');
var r = require('r-dom');
var assign = require('object-assign');
var moment = require('moment');

var loadData = require('./data.processing');
var animationID;
var index = 0;
var RATE = 1000;
var fakeTime = moment("9/1/2015 00:00:00").subtract(RATE, 'millisecond');
var timeData, stationData;

loadData(initMain);

function initMain(_timeData, _stationData){
  timeData = _timeData;
  stationData = _stationData;
  React.render(r(Main), document.getElementById('chart'));
}

//@TODO: figure out how to do requestAnimationFrame properly in react
function tick(cb){
  animationID = requestAnimationFrame(function(){
    tick(cb);
  });
  cb();
}

function detect(increase, decrease, size){
  
  var gap = moment(timeData[index]['time']).diff(fakeTime);

  while(gap === 0){

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

var Main = React.createClass({

  getInitialState: function getInitialState(){
    return{
      dots: stationData
    };
  },

  _increaseDot: function(key){

    stationData[key].radius +=2

    this.setState({
      dots: stationData
    })
  },

  _decreaseDot: function(key){

    stationData[key].radius -=2

    this.setState({
      dots: stationData
    })
  },

  handleClick: function(data){
    tick(detect.bind(this, this._increaseDot, this._decreaseDot, timeData.length));
  },

  handleSlide: function(){
    console.log('It hurts');
  },

  componentDidMount: function(){

  },

  render: function(){

    
    return r.div({}, [

        r(App, assign({
          dots: stationData
        })),

        r.div({
          className: 'panel'
        }, [
          r.button(assign({
            onClick: this.handleClick,
            className: 'btn'
          }), 'start'),

          r(Rcslider, assign({
            onChange: this.handleSlide,
            defaultValue: 5,
            min: 0,
            max: 10
          }))

        ])
        
    ])
  }

})
