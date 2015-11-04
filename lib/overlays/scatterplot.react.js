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

var React = require('react');
var ReactDOM = require('react-dom');
var window = require('global/window');
var d3 = require('d3');
var r = require('r-dom');
var Immutable = require('immutable');
var COMPOSITE_TYPES = require('canvas-composite-types');

var ScatterplotOverlay = React.createClass({
  
  displayName: 'ScatterplotOverlay',

  propTypes: {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    project: React.PropTypes.func,
    isDragging: React.PropTypes.bool,
    //locations: React.PropTypes.instanceOf(Immutable.List),
    latLngAccessor: React.PropTypes.func,
    radiusAccessor: React.PropTypes.func,
    renderWhileDragging: React.PropTypes.bool,
    globalOpacity: React.PropTypes.number,
    compositeOperation: React.PropTypes.oneOf(COMPOSITE_TYPES),
    dots: React.PropTypes.object,
    defaultZoom: React.PropTypes.number,
    zoom: React.PropTypes.number,
    bgColor: React.PropTypes.string,
    dotColor: React.PropTypes.string,
  },

  getDefaultProps: function getDefaultProps() {
    return {
      latLngAccessor: function latLngAccessor(dot) {
        return dot.loc;
      },
      radiusAccessor: function latLngAccessor(dot) {
        return dot.radius;
      },
      renderWhileDragging: true,
      //dotFill: '#0C66B5',
      globalOpacity: 0.2,
      // Same as browser default.
      // compositeOperation: 'source-over'
      compositeOperation: 'multiply'
    };
  },

  componentDidMount: function componentDidMount() {
    this._redraw();
  },

  componentDidUpdate: function componentDidUpdate() {
    this._redraw();
  },

  _redraw: function _redraw() {
    
    var pixelRatio = window.devicePixelRatio;
    var canvas = ReactDOM.findDOMNode(this);
    var ctx = canvas.getContext('2d');
    var props = this.props;
    var dotFill = this.props.dotColor.split(',').slice(0, 3).join(',') + ',0.3)';
    ctx.save();
    ctx.scale(pixelRatio, pixelRatio);
    ctx.clearRect(0, 0, props.width, props.height);
    //ctx.globalCompositeOperation = this.props.compositeOperation;
    ctx.save();
    ctx.fillStyle = this.props.bgColor;
    ctx.fillRect(0, 0, props.width, props.height);
    ctx.fill();
    ctx.restore();

    var scalar = Math.pow(this.props.zoom / this.props.defaultZoom, 6);

    if ((this.props.renderWhileDragging || !this.props.isDragging) &&
      this.props.dots // this.props.locations
    ) {
      ctx.save();
      for(var key in this.props.dots) {
        var dot = this.props.dots[key];
        var latLng = this.props.latLngAccessor(dot);
        var radius = this.props.radiusAccessor(dot);

        //keep pace with the map's zooming
        radius *= scalar;

        var pixel = this.props.project(latLng);
        var pixelRounded = [d3.round(pixel.x, 1), d3.round(pixel.y, 1)];
        if (pixelRounded[0] + radius >= 0 &&
            pixelRounded[0] - radius < props.width &&
            pixelRounded[1] + radius >= 0 &&
            pixelRounded[1] - radius < props.height
        ) {

          ctx.fillStyle = this.props.dotColor;
          ctx.beginPath();
          ctx.arc(pixelRounded[0], pixelRounded[1], 1, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = dotFill;
          ctx.beginPath();
          ctx.arc(pixelRounded[0], pixelRounded[1], radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
    ctx.restore();
  },
  render: function render() {
    var pixelRatio = window.devicePixelRatio;
    return r.canvas({
      className: 'overlayCanvas',
      ref: 'overlay',
      width: this.props.width * pixelRatio,
      height: this.props.height * pixelRatio,
      style: {
        width: this.props.width + 'px',
        height: this.props.height + 'px',
        position: 'absolute',
        pointerEvents: 'none',
        opacity: this.props.globalOpacity,
        left: 0,
        top: 0
      }
    });
  }
});

module.exports = ScatterplotOverlay;