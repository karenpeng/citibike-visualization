'use strict';

var window = require('global/window');

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

module.exports = getAccessToken;