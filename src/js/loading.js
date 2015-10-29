'use strict';

var React = require('react');
var Rcslider = require('rc-slider');
var r = require('r-dom');
var assign = require('object-assign');

var Loading = React.createClass({
  PropTypes:{
    loadingClassName: React.PropTypes.string
  },

  render: function(){
    return r.div({
        className: this.props.loadingClassName
      }, [
        r.p({className: 'loading'}, 'loading data...'),
        r.div({className: 'bg'})
      ])
  }

});

module.exports = Loading;