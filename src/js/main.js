'use strict';

var document = require('global/document');
var React = require('react');
var r = require('r-dom');
var App = require('./app.js');
var Immutable = require('immutable');
var moment = require('moment');

//Example data.
var location = require('./../../data/cities.json')[0];
var normal = d3.random.normal();
function wiggle(scale) {
  return normal() * scale;
}

// Example data.
var _locations = Immutable.fromJS(d3.range(10).map(function _map() {
  return [location.latitude + wiggle(0.01), location.longitude + wiggle(0.01), Math.random()*4+4];
}));

var common = {
  locations: _locations
};
    

React.render(r(App, common), document.getElementById('chart'));
