'use strict';

var Immutable = require('immutable');
var moment = require('moment');
var d3 = require('d3');

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

function loadData(cb){

  d3.csv('/data/_91.csv', function(err, data){
    if(err){
      console.log(err);
      return;
    }

   var  _data1 = data.map(function(obj){
      
      //var time = parseTime(obj['starttime']);

      return{
        'time': obj['starttime'],
        'prop': 'start',
        'id': obj['start station id'],
        'loc': [obj['start station latitude'], obj['start station longitude']]//,
        //'type': obj['usertype']
      };
    });

    var _data2 = data.map(function(obj){

      //var time = parseTime(obj['stoptime']);

      return{
        'time': obj['stoptime'],
        'prop': 'stop',
        'id': obj['end station id'],
        'loc': [obj['end station latitude'], obj['end station longitude']]//,
        //'type': obj['usertype']
      }
    });

    var timeData = Immutable.fromJS(
      (_data1.concat(_data2))
      .sort(function(a, b){
        return moment(a['time']).diff(moment(b['time']));
      })
    )

    //console.dir(timeData)

    var stationData = {};

    (_data1.concat(_data2)).forEach(function(d){
      if(Number.isInteger(+d['id'])){
        if(!stationData.hasOwnProperty(d['id'])){
          stationData[d['id']] = {
            'loc': d['loc'],
            //'radius': 1
            //@TODO: figure out how to set default radius properly
            'radius': 5
          }
        }else{
          // if(d['prop'] === 'start'){
          //   stationData[d['id']]['radius']++;
          // }
          // if(d['prop'] === 'stop'){
          //   stationData[d['id']]['radius']--;
          //   stationData[d['id']]['radius'] = 
          //     stationData[d['id']]['radius'] < 0 ?
          //     0 : stationData[d['id']]['radius'];
          // }
        }
      }
    });

    //console.dir(stationData)

    console.log('data loaded!')

    cb(timeData, stationData);

  });
}

module.exports = loadData;