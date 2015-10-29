'use strict';

var React = require('react');
var Rcslider = require('rc-slider');
var r = require('r-dom');
var assign = require('object-assign');

var Info = React.createClass({

  render: function(){
    return r.div({
        className: 'info'
      }, [
        r.h1({
          className: 'title'
        },'Citibike Data Visualization'),
        r.div({
          className: 'subtitle'
        }, [
          r.span('data source :  '),
          r.a(assign({
            className: 'link',
            href: 'https://www.citibikenyc.com/system-data'
          }), 'citibike system data')
        ])
      ])
  }

});

module.exports = Info;