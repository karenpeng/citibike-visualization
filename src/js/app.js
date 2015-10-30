'use strict';

var document = require('global/document');
var window = require('global/window');
var React = require('react');
var r = require('r-dom');
var assign = require('object-assign');
var d3 = require('d3');
var moment = require('moment');
//var SkyColor = require('sky-color-generator');
var requestAnimationFrame = require('./util/requestAnimationFrame');
var getAccessToken = require('./util/token');
var token = require('./../../processed_data/token.json').token[1];

var ScatterplotExample = require('./ui/scatterplot.react');
var Clock = require('./ui/clock');
var Rcslider = require('rc-slider');
var Control = require('./ui/control');
var Loading = require('./ui/loading');
var Info = require('./ui/info');

var animationID;
var index = 0;
var RATE = 20000;
var fakeTime = moment("2015-09-01T00:00:00.000Z").subtract(RATE, 'millisecond');
var size;
var timeData;
var stationData = {};
var total = 0;

var scale = d3.scale.linear().range([0, 1.5]).domain([28, 1]);
//var skyColor = new SkyColor();

//@TODO: figure out how to do requestAnimationFrame properly in react
function tick(cb){
  animationID = requestAnimationFrame(function(){
    tick(cb);
  });
  cb();
}

var App = React.createClass({

  displayName: 'App',

  getInitialState: function getInitialState(){
    return{
      dots: {},
      width: window.innerWidth,
      height: window.innerHeight,
      init: false,
      loaded: false,
      ticking: false,
      month: 0,
      date: 0,
      hour: 0,
      minute: 0,
      second: 0,
      isDay: false,
      done: false,
      total: 0
    };
  },

  handleResize: function(){
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  },

  componentDidMount: function(){
    window.addEventListener('resize', this.handleResize, false);

    var that = this;

    //@TODO: figure out how to do this without settimeout maybe?
    //cus the loading blocks the loading of the map

    setTimeout(function(){

      that.setState({
        init: true
      });

      d3.json('./../../processed_data/stations.json', function(err, data){

        that.setState({
          dots: data
        });

        d3.json('./../../processed_data/9123.json', function(err, data){
          
          timeData = data['records'];
          console.dir(timeData);

          that.setState({ 
            loaded: true,
            month: fakeTime.month(),
            date: fakeTime.date(),
            hour: fakeTime.hours(),
            minute: fakeTime.minutes(),
            second: fakeTime.seconds()
          });
        });

      })



    }, 5000);
  },

  _increaseDot: function(key){
    stationData[key].radius += scale(stationData[key].radius);
    stationData[key].radius = stationData[key].radius > 26 ? 26 : stationData[key].radius;
  },

  _decreaseDot: function(key){
    stationData[key].radius -= scale(stationData[key].radius);
    stationData[key].radius = stationData[key].radius < 0 ? 0 : stationData[key].radius;
  },

  animate: function(){

    var d = fakeTime.date();
    var h = +fakeTime.hours();

    this.setState({
      month: fakeTime.month(),
      date: d,
      hour: h,
      minute: fakeTime.minutes(),
      second: fakeTime.seconds()//,
      //isDay: (h < 18 && h >= 6)
    })

    var gap = moment(timeData[index]['time']).diff(fakeTime);

    while(gap <= 0){

      if(timeData[index]['prop'] === 'start'){
        this._decreaseDot(timeData[index]['id']);
      }else{
        this._increaseDot(timeData[index]['id']);
      }

      index ++;
      
      if(index >= size - 1 || d === 4){
        console.log('STOP!')
        this.setState({
          done: true
        })
        window.cancelAnimationFrame(animationID);
        return;
      }

      gap = moment(timeData[index]['time']).diff(fakeTime);
    }

    fakeTime.add(RATE, 'millisecond');
  },


  handleClick: function(){

    if(!this.state.ticking){    
      tick(this.animate);
    
      this.setState({
        ticking: true
      });

    }else{
      console.log('STOP!')
      window.cancelAnimationFrame(animationID);

      this.setState({
        ticking: false
      });
    }

  },

  handleSlide: function(value){
    RATE = 20000 + value * 2000;
  },

  render: function(){

    var buttonClass = this.state.ticking ? 'pause' : 'start';
    buttonClass = !this.state.loaded || this.state.done ? 'unclickable' : buttonClass;
    
    return r.div({}, [
      r(ScatterplotExample, assign({
        width: this.state.width,
        height: this.state.height,
        style: {float: 'left'},
        //mapboxApiAccessToken: getAccessToken(),
        mapboxApiAccessToken: token,
        dots: this.state.dots,
        //mapStyle: this.state.isDay ? 'mapbox://styles/mapbox/light-v8' : 'mapbox://styles/mapbox/dark-v8'
        bgColor: '#000000',
        bgAlpha: 0.4
      })),

      r.div({
        className: 'panel'
      }, [

        // r.h2({
        //   className: 'total'
        // }, 'Total Rides: ' + this.state.total),

        r(Clock, assign({
          month: this.state.month,
          date: this.state.date,
          hour: this.state.hour,
          minute: this.state.minute,
          second: this.state.second
        })),

        r(Control, assign({
          handleClick: this.handleClick,
          handleSlide: this.handleSlide,
          buttonDisabled:!this.state.loaded || this.state.done,
          sliderDisabled: !this.state.ticking || !this.state.loaded || this.state.done,
          buttonClassName: buttonClass,
          buttonString: this.state.ticking? 'pause' : 'start'
        }))

      ]),

      r(Loading, assign({
        loadingClassName: (this.state.init && !this.state.loaded) ? 'show' : 'gone'
      })),

      r(Info)
    ])
  }

})

React.render(r(App), document.getElementById('chart'));
