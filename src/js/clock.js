'use strict';

var React = require('react');
var r = require('r-dom');
var d3 = require('d3');

var Clock = React.createClass({

  displayName: 'Clock',

  PropTypes: {
    date: React.PropTypes.number.isRequired,
    hour: React.PropTypes.number.isRequired,
    minute: React.PropTypes.number.isRequired,
    second: React.PropTypes.number.isRequired
  },

  render: function(){
    return r.div({},[

      r.p({className: 'date'}, this.props.date),

      r.div({
        className: this.props._className
      }, [
        r.span(this.props.hour < 10 ? '0'+this.props.hour : this.props.hour),
        r.span(':'),
        r.span(this.props.minute < 10? '0'+this.props.minute: this.props.minute),
        r.span(':'),
        r.span(this.props.second < 10? '0'+this.props.second: this.props.second)
        ])
    ])
  }

})

module.exports = Clock;