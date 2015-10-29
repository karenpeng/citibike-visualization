'use strict';

var Immutable = require('immutable');
var moment = require('moment');

function loadData(cb){

  d3.csv('./../../data/91.csv', function(err, data){
    if(err){
      console.log(err);
      return;
    }

   var  _data1 = data.map(function(obj){
      return {
        'time': obj['starttime'],
        'prop': 'start',
        'id': obj['start station id'],
        'loc': [obj['start station latitude'], obj['start station longitude']],
        'type': obj['usertype']
      };
    });

    var _data2 = data.map(function(obj){
      return{
        'time': obj['stoptime'],
        'prop': 'stop',
        'id': obj['end station id'],
        'loc': [obj['end station latitude'], obj['end station longitude']],
        'type': obj['usertype']
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
            'radius': 6
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