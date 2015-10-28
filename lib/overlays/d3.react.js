'use strict';

var React = require('react');
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
    locations: React.PropTypes.instanceOf(Immutable.List),
    latLngAccessor: React.PropTypes.func,
    radiusAccessor: React.PropTypes.func,
    renderWhileDragging: React.PropTypes.bool,
    globalOpacity: React.PropTypes.number,
    dotFill: React.PropTypes.string,
    compositeOperation: React.PropTypes.oneOf(COMPOSITE_TYPES)
  },

  getDefaultProps: function getDefaultProps() {
    return {
      latLngAccessor: function latLngAccessor(location) {
        return [location.get(0), location.get(1)];
      },
      radiusAccessor: function latLngAccessor(location) {
        return Math.random()*2+2;
      },
      renderWhileDragging: true,
      dotFill: '#1FBAD6',
      globalOpacity: 1,
      // Same as browser default.
      compositeOperation: 'source-over'
    };
  },

  componentDidMount: function componentDidMount() {
    this._redraw();
  },

  componentDidUpdate: function componentDidUpdate() {
    this._redraw();
  },

  _redraw: function _redraw() {
    console.log('meow~')
   
  },
  render: function render() {
    var pixelRatio = window.devicePixelRatio;
    return r.svg({
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
