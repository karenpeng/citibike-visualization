'use strict';

var React = require('react');
var Rcslider = require('rc-slider');
var r = require('r-dom');
var assign = require('object-assign');

var ControlPanel = React.createClass({

  propTypes:{
    handleClick: React.PropTypes.func,
    handleSlide: React.PropTypes.func,
    buttonDisabled: React.PropTypes.bool,
    sliderDisabled: React.PropTypes.bool,
    buttonClassName: React.PropTypes.string,
    buttonString: React.PropTypes.string
  },

  render: function(){

    return r.div({
      className: 'panel'
    },[
      r.button(assign({
        onClick: this.props.handleClick,
        disabled: this.props.buttonDisabled,
        className: this.props.buttonClassName
      }), this.props.buttonString),

      r(Rcslider, assign({
        onChange: this.props.handleSlide,
        disabled: this.props.sliderDisabled,
        defaultValue: 0,
        min: -10,
        max: 10,
        step: 1
      }))
    ])
  }

});

module.exports = ControlPanel;