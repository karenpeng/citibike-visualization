'use strict';

var d3 = require('d3');
var moment = require('moment');
var assign = require('object-assign');

function loadData(cb){

  var _data1, _data2;
  var timeData = [];
  var stationData = {}; 

  d3.csv('./../../data/test.csv', function(err, data){
    if(err){
      console.log(err);
      return;
    }

    _data1 = data.map(function(obj){
      return {
        'time': obj['starttime'],
        'prop': 'start',
        'id': obj['start station id'],
        'loc': [obj['start station latitude'], obj['start station longitude']],
        'type': obj['usertype']
      };
    });

    _data2 = data.map(function(obj){
      return{
        'time': obj['stoptime'],
        'prop': 'stop',
        'id': obj['end station id'],
        'loc': [obj['end station latitude'], obj['end station longitude']],
        'type': obj['usertype']
      }
    });


    timeData = _data1.concat(_data2)
      .sort(function(a, b){
        return moment(a['time']).diff(moment(b['time']));
      })
    console.dir(timeData)


    var nest = d3.nest()
      .key(function(d){
        return d.id
      })
      .entries(_data1.concat(_data2))
      
    nest.forEach(function(d){

      var _key =  d['key'] + '';
      // var _obj = {
      //   _key : {
      //     'loc': d['values'][0]['loc'],
      //     'radius': 4
      //   }
      // }
      //assign(stationData, _obj)
      stationData[_key] = {
        'loc': d['values'][0]['loc'],
        'radius': 10
      }

    })

      console.dir(stationData)

      cb(timeData, stationData);
  });
}

module.exports = loadData;