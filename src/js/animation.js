'use strict'

var d3 = require('d3');
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

console.dir(_locations);

module.exports = _locations;