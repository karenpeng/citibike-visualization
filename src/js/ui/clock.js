'use strict';

var React = require('react');
var r = require('r-dom');
var d3 = require('d3');

var Clock = React.createClass({

  displayName: 'Clock',

  PropTypes: {
    month: React.PropTypes.number.isRequired,
    date: React.PropTypes.number.isRequired,
    hour: React.PropTypes.number.isRequired,
    minute: React.PropTypes.number.isRequired,
    second: React.PropTypes.number.isRequired
  },

  render: function(){

    var _m = (this.props.month+1) < 10 ? '0'+(this.props.month+1) : (this.props.month+1);
    var _d = this.props.date < 10 ? '0'+this.props.date : this.props.date;

    var dateStyle = {color: this.props.hour >= 6 && this.props.hour < 18 ? '#666' : '#bbb'}
    var clockStyle = {color: this.props.hour >=6 && this.props.hour < 18 ? '#444' : '#ddd'}

    return r.div({
      className: 'time'
    },[

      r.p({
        className: 'date',
        style: dateStyle
      }, _m+'/'+_d+'/2015'),

      r.div({
        className: 'clock',
        style: clockStyle
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