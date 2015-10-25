'use strict';

var document = require('global/document');
var React = require('react');
var assign = require('object-assign');
var r = require('r-dom');
var Immutable = require('immutable');
var moment = require('moment');
var App = require('./app.js');

var id;
var _times = [];
var index = 0;
var gap;

//@TODO: figure out how to do requestAnimationFrame properly in react
function tick(cb){
  id = requestAnimationFrame(function(){
    tick(cb);
  });
  cb();
}

//@TODO: figure out how to map time in a rate
function detect(){

  var ms = moment(_times[index]).diff(moment());
  var diff = ms
  console.log(diff - gap)

  while(diff - gap < 3){
    console.log('ouch ' + index)

    index ++;
    ms = moment(_times[index]).diff(moment());
    diff = ms
    
    if(index === _times.length){
      console.log('STOP!')
      window.cancelAnimationFrame(id);
      return;
    }
  }
}

var Main = React.createClass({

  getInitialState: function(){
    return{
      locations: Immutable.fromJS([])
    }
  },

  componentDidMount: function(){
    d3.csv('./../../data/test.csv', function(err, data){
      if(err){
        console.log(err);
        return;
      }
      var _pos = []

      var _locations = Immutable.fromJS(data.map(function(obj){

        _times.push(obj['starttime'])
        _pos.push([obj['end station latitude'], obj['end station longitude']])

        return[obj['end station latitude'], obj['end station longitude'], Math.random()*2 + 2/*, obj['starttime']*/];
      }));

      this.setState({
        locations: _locations
      });


    gap = moment("8/31/2015 23:59:59").diff(moment());

      tick(detect)
    
    }.bind(this));

  },

  render: function(){
    return r(App, assign({
      locations: this.state.locations
    }, this.props))
  }

})


React.render(r(Main), document.getElementById('chart'));
    


