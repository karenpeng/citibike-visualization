'use strict';

var document = require('global/document');
var React = require('react');
var Rcslider = require('rc-slider');
var App = require('./app');

var Immutable = require('immutable');
var r = require('r-dom');
var assign = require('object-assign');
var moment = require('moment');

var _data, DATA;
var DOTS = {};
var animationID;
var index = 0;
var RATE = 1000;
var fakeTime = moment("9/1/2015 00:00:00").subtract(RATE, 'millisecond');

d3.csv('./../../data/test.csv', function(err, data){
  if(err){
    console.log(err);
    return;
  }

  _data = data.map(function(obj){

    return {
      'start_time' : obj['starttime'],
      'start_location': [obj['start station latitude'], obj['start station longitude']],
      'start_station_id' : obj['start station id'],
      'stop_time': obj['stoptime'],
      'stop_location': [obj['end station latitude'], obj['end station longitude']],
      'end_station_id': obj['end station id'],
      'usertype': obj['usertype']
    };

  });

  DATA = Immutable.fromJS(_data);

  //console.dir(DATA); //window.DATA = DATA;

  //console.dir(_data);

  var nest = 
    d3.nest()
      .key(function(d){ 
        return d['end_station_id']
      })
      .entries(_data);

  //console.dir(nest);

  nest.forEach(function(obj){
    //assign(DOTS, {obj.key : obj.values[0]['stop_location']});
    DOTS[obj.key] = {
      'loc': obj.values[0]['stop_location'],
      'radius': 4
    };
  })

  console.dir(DOTS);

  React.render(r(Main), document.getElementById('chart'));
});

//@TODO: figure out how to do requestAnimationFrame properly in react
function tick(cb){
  animationID = requestAnimationFrame(function(){
    tick(cb);
  });
  cb();
}

function detect(increase, decrease){

  var gap1 = moment(_data[index]['start_time']).diff(fakeTime);
  var gap2 = moment(_data[index]['stop_time']).diff(fakeTime);

  while(gap1 === 0){
    console.log('ouch ' + index)
    decrease(_data[index]['start_station_id']);

    index ++;
    gap1 = moment(_data[index]['start_time']).diff(fakeTime);
    
    if(index === DATA.size){
      console.log('STOP!')
      window.cancelAnimationFrame(animationID);
      return;
    }
  }

  fakeTime.add(RATE, 'millisecond');

}

var Main = React.createClass({

  getInitialState: function getInitialState(){
    return{
      dots: DOTS
    }
  },

  _increaseDot: function(key){

    DOTS[key].radius += 4

    this.setState({
      dots: DOTS
    })
  },

  _decreaseDot: function(key){
    console.log(key, DOTS[key])

    DOTS[key].radius -= 4

    this.setState({
      dots: DOTS
    })
  },

  handleClick: function(){
    console.dir(_data)
    tick(detect.bind(this, this._increaseDot, this._decreaseDot));
  },

  handleSlide: function(){
    console.log('It hurts');
  },

  componentDidMount: function(){

  },

  render: function(){

    
    return r.div({}, [

        r(App, assign({
          dots: DOTS
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
