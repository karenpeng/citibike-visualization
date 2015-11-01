'use strict';

var d3 = require('d3');

function SkyColor(){
  this.steps = [
    {'time': 0, 'color': [0, 0, 0, 0.6]},
    {'time': 320, 'color': [240, 146, 122, 0.1]},
    {'time': 350, 'color': [86, 236, 240, 0.3]},
    {'time': 360, 'color': [255, 255, 255, 0]},
    {'time': 1080, 'color': [90, 150, 250, 0.2]},
    {'time': 1140, 'color': [33, 89, 210, 0.1]},
    {'time': 1200, 'color': [0, 0, 0, 0.2]},
    {'time': 1440, 'color': [0, 0, 0, 0.6]},
  ];
  this.leftBound = 0;
  this.rightBound = 1;
}

SkyColor.prototype.set = function(minute, color) {
  this.steps.push({'time': minute, 'color': color});
  this.steps.sort(function(a, b){
    return a['time'] - b['time'];
  });
};

SkyColor.prototype.get = function(minute) {
  if(minute > this.steps[this.rightBound]['time']){
    this.leftBound++;
    this.rightBound++;
  }
  return interpolate(this.steps[this.leftBound], this.steps[this.rightBound], minute);
};

SkyColor.prototype.init = function(minute){
  var _b = searchRange(0, this.steps.length-1, this.steps, minute);
  this.leftBound = _b[0];
  this.rightBound = _b[1];
}

SkyColor.prototype.startDay = function(){
  this.leftBound = 0;
  this.rightBound = 1;
}

function interpolate(l, r, target){
  var amt = (r['time'] - target)/(r['time'] - l['time']);

  var _r = lerp(l['color'][0], r['color'][0], amt).toFixed();
  var _g = lerp(l['color'][1], r['color'][1], amt).toFixed();
  var _b = lerp(l['color'][2], r['color'][2], amt).toFixed();
  var _a = lerp(l['color'][3], r['color'][3], amt).toFixed(4);
  return 'rgba(' + _r + ',' + _g + ',' + _b + ',' + _a + ')';
};

function lerp(start, stop, amt) {
  return amt*(stop-start)+start;
};

function searchRange(_start, _end, arr, target){
  var leftBound, rightBound;
  var start = _start;
  var end = _end;

  while(start + 1 < end){
    var mid = Math.floor((start + end) / 2);
    var h = arr[mid]['time'];

    if(h === target) return [mid, mid];
    else if(h < target) start = mid;
    else end = mid - 1;
  }

  var h1 = arr[start]['time'];
  var h2 = arr[end]['time'];
  if(h1 === target) return [start, start];
  else if(h2 === target) return [end, end];
  else if(h2 < target) leftBound = end;
  else if(h1 < target) leftBound = start;
  else leftBound = start - 1;

  start = leftBound;
  end = _end;
  while(start + 1 < end){
    mid = Math.floor((start + end) / 2);
    h = arr[mid]['time'];

    if(h === target) return [mid, mid];
    else if(h > target) end = mid;
    else start = mid + 1;
  }
  var h1 = arr[start]['time'];
  var h2 = arr[end]['time'];
  if(h1 === target) return [start, start];
  else if(h2 === target) return [end, end];
  else if(h1 > target) rightBound = start;
  else if(h2 > target) rightBound = end;
  else rightBound = end + 1; 

  return [leftBound, rightBound];
}

module.exports = SkyColor;