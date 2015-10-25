'use strict';

var document = require('global/document');
var React = require('react');
var assign = require('object-assign');
var r = require('r-dom');
var Immutable = require('immutable');
var moment = require('moment');
var App = require('./app.js');

var Main = React.createClass({

  getInitialState: function(){
    return{
      locations: Immutable.fromJS([])
    }
  },

  componentDidMount: function(){
    console.log('wat')
    d3.csv('./../../data/test.csv', function(err, data){
      if(err){
        console.log(err);
        return;
      }

      var _locations = Immutable.fromJS(data.map(function(obj){
        return[obj['end station latitude'], obj['end station longitude'], Math.random()*2 + 2];
      }));

      this.setState({
        locations: _locations
      });

      console.log(this.state.locations)
    
    }.bind(this));

  },

  render: function(){
    return r(App, assign({
      locations: this.state.locations
    }, this.props))
  }

})


React.render(r(Main), document.getElementById('chart'));
    


