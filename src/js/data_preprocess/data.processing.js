//run this file with node
'use strict';

var fs = require('fs');
var csv = require('csv-parser');
var moment = require('moment');

var files = [
  "./../../../raw_data/91.0.csv",
  "./../../../raw_data/91.1.csv",
  "./../../../raw_data/92.0.csv",
  "./../../../raw_data/92.1.csv",
  "./../../../raw_data/93.0.csv",
  "./../../../raw_data/93.1.csv"
];

var index = 0;

var _data1 = [], _data2 = [];
var stationData = {};
var timeData;

//Ready? Go!!!!
sequence(files);

function sequence(files){

  var file = files.shift(); 

  if(files.length === 0){
    process(file, onEnd);
  }else{
    process(file, function(){
      sequence(files);
    });
  }
}

function process(file, cb){

  fs.createReadStream(file)
    .pipe(csv())
    .on("data", function(data){
      //console.log(data);
      onData(data);
    })
    .on("end", function(){
      cb();
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
      'min': 0,
      'count': 0
    }
  }

  if(!stationData.hasOwnProperty(obj['stop station id'])){
    stationData[obj['end station id']] = {
      'loc': [+obj['end station latitude'], +obj['end station longitude']],
      'min': 0,
      'count': 0
    }
  }
}

function onEnd(){
  console.log('processing time...')
  timeData = (_data1.concat(_data2))
    .sort(function(a, b){
      //this line of code consumes most of the time!!!
      return moment(a['time']).diff(moment(b['time']));
    })

  console.log('start writing file...')

  fs.writeFileSync("./../../../processed_data/_stations.json", JSON.stringify(stationData), 'utf-8');
  fs.writeFileSync("./../../../processed_data/records.json", JSON.stringify({'records':timeData}), 'utf-8');
}

/**
 * [parseTime description]
 * @param  {string} s "9/1/2015 00:00:00"
 * @return {string}   "2015-09-01T00:00:00-04:00"
 */
function parseTime(s){
  var _s = s.split(' ');
  var date = _s[0].split('/');
  var time = _s[1] + '-05:00';
  var m = +date[0] > 10 ? date[0] : '0' + date[0]; 
  var d = +date[1] > 10 ? date[1] : '0' + date[1];
  var formatedDate = date[2] + '-' + m + '-' + d + 'T';
  return formatedDate + time;
}
