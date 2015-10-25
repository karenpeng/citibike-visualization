'use strict';

var React = require('react');
var r = require('r-dom');
var window = require('global/window');
var Immutable = require('immutable');

var ScatterplotExample = require('./scatterplot.react');
// var UnderneathMap = require('./underneath.map.js');
// var OverlayCanvas = require('./overlay.canvas.js');

function getAccessToken() {
  var match = window.location.search.match(/access_token=([^&\/]*)/);
  var accessToken = match && match[1];
  if (accessToken) {
    window.localStorage.accessToken = accessToken;
  } else {
    accessToken = window.localStorage.accessToken;
  }
  return accessToken;
}

var App = React.createClass({

  displayName: 'App',

  PropTypes: {
    locations: React.PropTypes.instanceOf(Immutable.List)
  },

  _onChangeViewport: function _onChangeViewport(opt) {
    this.setState({
      latitude: opt.latitude,
      longitude: opt.longitude,
      zoom: opt.zoom,
      bbox: opt.bbox
    });
  },

  getInitialState: function getInitialState() {
    return {
      map: {latitude: 40.71729, longitude: -73.996375, zoom: 8}
    };
  },

  render: function render() {
    var common = {
      width: window.innerWidth,
      height: window.innerHeight,
      style: {float: 'left'},
      mapboxApiAccessToken: getAccessToken(),
      locations: this.props.locations
    };
    return r.div([
      r(ScatterplotExample, common)
      // r(UnderneathMap, common),
      // r(OverlayCanvas, common)
    ]);
  }
});

module.exports = App
