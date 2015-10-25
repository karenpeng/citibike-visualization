'use strict';

var assign = require('object-assign');
var React = require('react');
var r = require('r-dom');
var MapGL = require('../../lib/index.js');

// New York
var location = require('./../../data/cities.json')[0];

var UnderneathMap = React.createClass({

  PropTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired
  },

  getInitialState: function getInitialState() {
    return {
      latitude: location.latitude,
      longitude: location.longitude,
      zoom: 11,
      startDragLatLng: null,
      isDragging: false
    };
  },

  _onChangeViewport: function _onChangeViewport(opt) {
    this.setState({
      latitude: opt.latitude,
      longitude: opt.longitude,
      zoom: opt.zoom,
      startDragLatLng: opt.startDragLatLng,
      isDragging: opt.isDragging
    });
  },

  render: function render() {
    return r(MapGL, assign({
      latitude: this.state.latitude,
      longitude: this.state.longitude,
      zoom: this.state.zoom,
      isDragging: this.state.isDragging,
      startDragLatLng: this.state.startDragLatLng,
      width: this.props.width,
      height: this.props.height,
      onChangeViewport: this.props.onChangeViewport || this._onChangeViewport
    }, this.props), []);
  }
});

module.exports = UnderneathMap;
