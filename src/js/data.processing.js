'use strict';

var d3 = require('d3');
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

    var timeData = (_data1.concat(_data2))
      .sort(function(a, b){
        return moment(a['time']).diff(moment(b['time']));
      })
    console.dir(timeData)


    var nest = d3.nest()
      .key(function(d){
        return d['id']
      })
      .entries(_data1.concat(_data2))

    console.dir(nest)

    var stationData = {};
      
    nest.forEach(function(d){

      var _key =  d['key'] + '';

      if(Number.isInteger(+_key) && Array.isArray(d['values'][0]['loc']) ) {

        if(_key === 'starttime'){
          console.log(d)
        }

        stationData[_key] = {
          'loc': d['values'][0]['loc'],
          'radius': 6
        }

      }

    })

    console.dir(stationData)

    console.log('data loaded!')

    cb(timeData, stationData);

  });
}

module.exports = loadData;