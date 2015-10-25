'use strict';

var React = require('react');
var r = require('r-dom');

var MapGL = require('../../lib/index.js');
var ScatterplotOverlay = require('../../lib/overlays/scatterplot.react');
var Immutable = require('immutable');

var OverlayCanvas = React.createClass({ 

  PropTypes: {
    locations: React.PropTypes.instanceOf(Immutable.List)
  },

  render: function render() {
    return r(ScatterplotOverlay, {
        locations: this.props.locations,
        globalOpacity: 1,
        compositeOperation: 'screen'
      })
  }
});

module.exports = OverlayCanvas;
