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

var document = require('global/document');
var React = require('react');
var r = require('r-dom');
var window = require('global/window');


var ScatterplotExample = require('./scatterplot.react');

function getAccessToken() {
  var match = window.location.search.match(/access_token=([^&\/]*)/);
  var accessToken = match && match[1];
  if (accessToken) {
    window.localStorage.accessToken = accessToken;
  } else {
    accessToken = window.localStorage.accessToken;
  }
  return accessToken;
}

var App = React.createClass({

  displayName: 'App',

  _onChangeViewport: function _onChangeViewport(opt) {
    this.setState({
      latitude: opt.latitude,
      longitude: opt.longitude,
      zoom: opt.zoom,
      bbox: opt.bbox
    });
  },

  getInitialState: function getInitialState() {
    return {
      map: {latitude: 40.71729, longitude: -73.996375, zoom: 8}
    };
  },

  render: function render() {
    var common = {
      width: window.innerWidth,
      height: window.innerHeight,
      style: {float: 'left'},
      mapboxApiAccessToken: getAccessToken()
    };
    return r.div([
      r(ScatterplotExample, common)
    ]);
  }
});

React.render(r(App), document.getElementById('chart'));
