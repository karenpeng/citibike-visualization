//run this file with node
'use strict';

var d3 = require('d3');
var fs = require('fs');
var timeData = require('./../../../processed_data/records.json')['records'];
var _stationData = require('./../../../processed_data/_stations.json');
var max = 0;
var scale = d3.scale.sqrt().range([0, 30]).domain([0, 60]);

timeData.forEach(function(obj){
  if(obj['prop'] === 'start'){
    _stationData[obj['id']]['count']--;
    _stationData[obj['id']]['min'] = Math.min(_stationData[obj['id']]['min'],  _stationData[obj['id']]['count'])
  }else if(obj['prop'] === 'stop'){
    _stationData[obj['id']]['count']++;
  }
});

//console.dir(_stationData)

var stationData = {};
for(var key in _stationData){
                                                   //something wrong with the data
  var _count = _stationData[key]['min'] < 0 ? (-_stationData[key]['min'] > 60 ? 60 :-_stationData[key]['min']) : 0

  stationData[key] = {
    'loc' : _stationData[key]['loc'],                                           
    'count': _count,
    'radius': d3.round(scale(_count), 1)
  }
  max = Math.max(max, stationData[key]['count']);
}

console.log(max)

fs.writeFileSync("./../../../processed_data/stations.json", JSON.stringify(stationData), 'utf-8');

