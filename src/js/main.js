'use strict';

var document = require('global/document');
var React = require('react');
var Rcslider = require('rc-slider');
var App = require('./app');

var Immutable = require('immutable');
var r = require('r-dom');
var assign = require('object-assign');
var moment = require('moment');




var animationID;
var _times = [];
var _pos = [];
var index = 0;
var RATE = 1000;
var fakeTime = moment("9/1/2015 00:00:00").subtract(RATE, 'millisecond');

//@TODO: figure out how to do requestAnimationFrame properly in react
function tick(cb){
  animationID = requestAnimationFrame(function(){
    tick(cb);
  });
  cb();
}

function detect(cb){
  var gap = moment(_times[index]).diff(fakeTime);
  console.log(gap)

  while(gap === 0){
    console.log('ouch ' + index)
    // cb(index)

    index ++;
    gap = moment(_times[index]).diff(fakeTime);
    
    if(index === _times.length){
      console.log('STOP!')
      window.cancelAnimationFrame(animationID);
      return;
    }
  }

  fakeTime.add(RATE, 'millisecond')
}

var Main = React.createClass({

  getInitialState: function(){
    return{
      locations: Immutable.fromJS([])
    }
  },

  changeLocation: function(index){
    // var _locations = Immutable.fromJS(_pos[index].concat([Math.random()*2 + 2]))
    // console.log(_locations)
    // this.setState({
    //   locations: _locations
    // })
  },

  handleClick: function(){
    console.log('mua')
    tick(detect.bind(this, this.changeLocation));
  },

  handleSlide: function(){
    console.log('It hurts');
  },

  componentDidMount: function(){
    d3.csv('./../../data/test.csv', function(err, data){
      if(err){
        console.log(err);
        return;
      }

      var _locations = Immutable.fromJS(data.map(function(obj){

        _times.push(obj['starttime'])
        _pos.push([obj['end station latitude'], obj['end station longitude']])

        return[obj['end station latitude'], obj['end station longitude'], Math.random()*2 + 2/*, obj['fakeTime']*/];
      }));

      this.setState({
        locations: _locations
      });
    
    }.bind(this));

  },

  render: function(){
    return r.div({}, [
        r.button(assign({
          onClick: this.handleClick,
          innerHTML: 'Click me!'
        }, this.props)),

        r(App, assign({
          locations: this.state.locations
        }, this.props))//,

        // r(Rcslider, assign({
        //   onChange: this.handleSlide,
        //   min: 0,
        //   max: 10
        // }, this.props))//,

        //r(Rcslider)
        
    ])
  }

})

React.render(r(Main), document.getElementById('chart'));
