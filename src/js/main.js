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
      'start station id' : obj['start station id'],
      'stop_time': obj['stoptime'],
      'stop_location': [obj['end station latitude'], obj['end station longitude']],
      'end station id': obj['end station id'],
      'usertype': obj['usertype']
    };

  });

  DATA = Immutable.fromJS(_data);

  console.dir(DATA); //window.DATA = DATA;

  console.dir(_data)

  var nest = 
    d3.nest()
      .key(function(d){ 
        console.dir(d)
        return d['end station id']
      })
      .entries(_data);

  console.dir(nest);
});

//@TODO: figure out how to do requestAnimationFrame properly in react
function tick(cb){
  animationID = requestAnimationFrame(function(){
    tick(cb);
  });
  cb();
}

function detect(cb){
  if(DATA !== undefined){

    try{
      var gap = moment(DATA.get(index).get('stop_time')).diff(fakeTime);
      console.log(gap)

      while(gap === 0){
        console.log('ouch ' + index)
        cb(DATA.get(index))

        index ++;
        gap = moment(_times[index]).diff(fakeTime);
        
        if(index === _times.length){
          console.log('STOP!')
          window.cancelAnimationFrame(animationID);
          return;
        }
      }

      fakeTime.add(RATE, 'millisecond')
    }catch(e){
      console.log(e)
    }
  }
}

var Main = React.createClass({

  getInitialState: function getInitialState(){
    return{}
  },

  changeLocation: function(index){
    var _locations = DATA.get(index).get('stop_location');
    console.log(_locations)
    this.setState({
      locations: _locations
    })
  },

  handleClick: function(){
    console.log('mua')
    tick(detect.bind(this, this.changeLocation));
  },

  handleSlide: function(){
    console.log('It hurts');
  },

  componentDidMount: function(){

  },

  render: function(){
    
    return r.div({}, [

        r(App, assign({
          locations: this.state.locations
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

React.render(r(Main), document.getElementById('chart'));
