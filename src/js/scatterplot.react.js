// Copyright (c) 2015 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
'use strict';

var assign = require('object-assign');
var React = require('react');
var r = require('r-dom');
var d3 = require('d3');

var MapGL = require('../../lib/index.js');
var ScatterplotOverlay = require('../../lib/overlays/scatterplot.react');
var Immutable = require('immutable');

// New York
var location = require('./../../data/cities.json')[0];

var ScatterplotOverlayExample = React.createClass({

  displayName: 'ScatterplotOverlayExample',

  PropTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    //locations: React.PropTypes.instanceOf(Immutable.List)
    dots: React.PropTypes.object.isRequired
  },

  getDefaultProps: function getDefaultProps(){
    return{
      mapStyle: 'mapbox://styles/mapbox/light-v8'
    }
  },

  getInitialState: function getInitialState() {
    return {
      latitude: location.latitude,
      longitude: location.longitude,
      zoom: 12,
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
      onChangeViewport: this.props.onChangeViewport || this._onChangeViewport,
      mapStyle: this.props.mapStyle
    }, this.props), [
      r(ScatterplotOverlay, {
        //locations: this.props.locations,
        dots: this.props.dots,
        globalOpacity: 1,
        compositeOperation: 'screen',
        zoom: this.state.zoom
      })
    ]);
  }
});

module.exports = ScatterplotOverlayExample;
