'use strict';

function ColorInterpolate(){
  this.steps = [
    {'time': 0, 'color': [0, 0, 0, 0.7]},
    {'time': 360, 'color': [0, 0, 0, 0.5]},
    {'time': 420, 'color': [0, 0, 0, 0]},
    {'time': 960, 'color': [0, 0, 0, 0]},
    {'time': 1020, 'color': [0, 0, 0, 0.5]},
    {'time': 1440, 'color': [0, 0, 0, 0.7]},
  ];
  this.leftBound = 0;
  this.rightBound = 1;
}

ColorInterpolate.prototype.set = function(minute, color) {
  for(var i = 0; i < this.steps.length; i++){
    var _obj = this.steps[i];
    if(_obj['time'] === minute){
      _obj['color'] = color;
      return;
    }
  }
  this.steps.push({'time': minute, 'color': color});
  this.steps.sort(function(a, b){
    return a['time'] - b['time'];
  });
};

ColorInterpolate.prototype.get = function(minute) {
  if(minute > this.steps[this.rightBound]['time']){
    this.leftBound++;
    this.rightBound++;
  }
  if(this.leftBound === this.rightBound){
    return 'rgba('+this.steps[this.leftBound]['color'].join(',') + ')';
  }
  return interpolate(this.steps[this.leftBound], this.steps[this.rightBound], minute);
};

ColorInterpolate.prototype.init = function(minute){
  var _b = searchRange(0, this.steps.length-1, this.steps, minute);
  this.leftBound = _b[0];
  this.rightBound = _b[1];
}

ColorInterpolate.prototype.startDay = function(){
  this.leftBound = 0;
  this.rightBound = 1;
}

function interpolate(l, r, target){
  var amt = (target - l['time'])/(r['time'] - l['time']);

  var _r = lerp(l['color'][0], r['color'][0], amt).toFixed();
  var _g = lerp(l['color'][1], r['color'][1], amt).toFixed();
  var _b = lerp(l['color'][2], r['color'][2], amt).toFixed();
  var _a = lerp(l['color'][3], r['color'][3], amt).toFixed(4);
  return 'rgba(' + _r + ',' + _g + ',' + _b + ',' + _a + ')';
};

function lerp(start, stop, amt) {
  return start + amt * (stop - start);
};

function searchRange(_start, _end, arr, target){
  var leftBound, rightBound;

  // for(var i = 0; i < arr.length; i++){
  //   if(arr[i]['time'] === target) return [i, i]
  //   if(arr[i]['time'] > target){
  //     rightBound = i;
  //     break;
  //   }
  // }

  // for(var i = arr.length-1; i >= 0; i--){
  //   if(arr[i]['time'] === target) return [i, i]
  //   if(arr[i]['time'] < target){
  //     leftBound = i;
  //     break;
  //   }
  // }
  // return [leftBound, rightBound];

  //use binary search instead
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

module.exports = ColorInterpolate;
