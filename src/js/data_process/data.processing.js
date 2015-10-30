//just run this file with node
'use strict';

var fs = require('fs');
var csv = require('csv-parser');
var moment = require('moment');

var files = [
  "91.0",
  "91.1",
  "92.0",
  "92.1",
  "93.0",
  "93.1"
];

var index = 0;

var _data1 = [], _data2 = [];
var stationData = {};
var timeData;

sequence(files);

function sequence(files){

  var file = files.shift(); 

  if(files.length === 0){
    process(file, onEnd);
    return;
  }else{
    process(file, function(){
      sequence(files, null);
    });
  }
}

function process(file, cb){

  var dir = "./../../../raw_data/" + file + ".csv";

  fs.createReadStream(dir)
    .pipe(csv())
    .on("data", function(data){
      //console.log(data);
      onData(data);
    })
    .on("end", function(){
      cb(file);
      console.log("done");
    });
}

function onData(obj){

  var _startTime = parseTime(obj['starttime']);
  var _stopTime = parseTime(obj['stoptime']);

   _data1.push({
      'time': _startTime,
      'prop': 'start',
      'id': obj['start station id'],
      'loc': [+obj['start station latitude'], +obj['start station longitude']]//,
      //'type': obj['usertype']
    });

  _data2.push({
      'time': _stopTime,
      'prop': 'stop',
      'id': obj['end station id'],
      'loc': [+obj['end station latitude'], +obj['end station longitude']]//,
      //'type': obj['usertype']
  });
  
  if(!stationData.hasOwnProperty(obj['start station id'])){
    stationData[obj['start station id']] = {
      'loc': [+obj['start station latitude'], +obj['start station longitude']],
      //'radius': 1
      //@TODO: figure out how to set default radius properly
      'radius': 5
    }
  }

  if(!stationData.hasOwnProperty(obj['stop station id'])){
    stationData[obj['end station id']] = {
      'loc': [+obj['end station latitude'], +obj['end station longitude']],
      //'radius': 1
      //@TODO: figure out how to set default radius properly
      'radius': 5
    }
  }
}

function onEnd(file){
  console.log('processing time...')
  timeData = (_data1.concat(_data2))
    .sort(function(a, b){
      //this line of code consumes most of the time!!!
      return moment(a['time']).diff(moment(b['time']));
    })

  console.log('start writing file...')

  fs.writeFileSync("./../../../processed_data/stations.json", JSON.stringify(stationData), 'utf-8');
  fs.writeFileSync("./../../../processed_data/"+file+".json", JSON.stringify({'records':timeData}), 'utf-8');
}

/**
 * [parseTime description]
 * @param  {string} s "9/1/2015 00:00:00"
 * @return {string}   "2015-09-01T00:00:00"
 */
function parseTime(s){
  var _s = s.split(' ');
  var date = _s[0].split('/');
  var time = _s[1] + '.000Z';
  var m = +date[0] > 10 ? date[0] : '0' + date[0]; 
  var d = +date[1] > 10 ? date[1] : '0' + date[1];
  var formatedDate = date[2] + '-' + m + '-' + d + 'T';
  return formatedDate + time;
}
