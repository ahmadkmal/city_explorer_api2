'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const PORT = process.env.PORT;
const app = express();


app.use(cors());
app.use(express.static('./public'));
app.get('/location',locationHandeller);
app.get('/weather',weatherHandeler);

app.get('/trails',trailsHandeler);
app.use('*',notFoundHandeler);
app.use(errorHandeler);


function locationHandeller(request,response) {
  // response.status(200).send
  const city = request.query.city;
  superagent(`https://eu1.locationiq.com/v1/search.php?key=${process.env.geoCode}&q=${city}&format=json`)
    .then((res) => {
      const geoData = res.body;
      const locationData = new Location(city, geoData);
      Location.current = locationData;
      response.status(200).json(locationData);
    })
    .catch((err) => errorHandeler(err, request, response));
}
function weatherHandeler(request,response){
  // response.status(200).send
  console.log(request.query.search_query);
  superagent(`https://api.weatherbit.io/v2.0/forecast/daily?city=${request.query.search_query}&key=${process.env.weatherCode}`)
    .then((weathres) => {
      // response.status(200).json(weathres.body);
      const weatherData = weathres.body;
      //   console.log(weatherData);
      Weather.all = weatherData.data.map((day) =>{
        return new Weather(day);
      });
      //         weatherData.data.forEach(element => {
      //     var weather = new Weather(element);
      //     Weather.all.push(weather);
      //   });
      response.status(200).json(Weather.all);
    })
    .catch((err) => errorHandeler(err, request, response));
}
function trailsHandeler(request,response){
  // response.status(200).send
  console.log(request.query.search_query);
  superagent(`https://www.hikingproject.com/data/get-trails?lat=${Location.current.latitude}&lon=${Location.current.longitude}&maxDistance=400&key=${process.env.haikCode}`)
    .then((trailsres) => {
    //   response.status(200).json(trailsres.body);
      //   const weatherData = weathres.body;
      //   console.log(weatherData);
      const trail = trailsres.body.trails.map((trail =>{
        return new Trail(trail);
      }));

      //   weatherData.data.forEach(element => {
      //     var weather = new Weather(element);
      //     Weather.all.push(weather);
      //   });
      response.status(200).json(trail);
    })
    .catch((err) => errorHandeler(err, request, response));
}
function notFoundHandeler(request,response){
  response.status(404).send('error 404 page not found');
}
function errorHandeler(error,request,response){
  response.status(500).send(`Sorry, something went wrong`);
}
// "name": "Rattlesnake Ledge",
//     "location": "Riverbend, Washington",
//     "length": "4.3",
//     "stars": "4.4",
//     "star_votes": "84",
//     "summary": "An extremely popular out-and-back hike to the viewpoint on Rattlesnake Ledge.",
//     "trail_url": "https://www.hikingproject.com/trail/7021679/rattlesnake-ledge",
//     "conditions": "Dry: The trail is clearly marked and well maintained.",
//     "condition_date": "2018-07-21",
//     "condition_time": "0:00:00 "
// "id": 7032788,
// "name": "Wadi Rum Sand Dunes",
// "type": "Hike",
// "summary": "An easier hike that allows you to enjoy the majestic scenery of Wadi Rum Protected Area.",
// "difficulty": "blue",
// "stars": 5,
// "starVotes": 1,
// "location": "Ad Dīsah, Jordan",
// "url": "https://www.hikingproject.com/trail/7032788/wadi-rum-sand-dunes",
// "imgSqSmall": "https://cdn-files.apstatic.com/hike/7042036_sqsmall_1555105523.jpg",
// "imgSmall": "https://cdn-files.apstatic.com/hike/7042036_small_1555105523.jpg",
// "imgSmallMed": "https://cdn-files.apstatic.com/hike/7042036_smallMed_1555105523.jpg",
// "imgMedium": "https://cdn-files.apstatic.com/hike/7042036_medium_1555105523.jpg",
// "length": 8.1,
// "ascent": 376,
// "descent": -376,
// "high": 3460,
// "low": 3118,
// "longitude": 35.4208,
// "latitude": 29.5737,
// "conditionStatus": "Unknown",
// "conditionDetails": null,
// "conditionDate": "1970-01-01 00:00:00"
function Trail(obj){
  this.name =obj.name;
  this.location =obj.location;
  this.length =obj.length;
  this.stars =obj.stars;
  this.star_votes =obj.starVotes;
  this.summary =obj.summary;
  this.trail_url =obj.url;
  this.conditions =obj.conditionStatus;
  this.condition_date =obj.conditionDate.slice(0,10);
  this.condition_time =obj.conditionDate.slice(10);
}
function Location(city,geoData){
  this.search_query = city;
  this.formatted_query =geoData[0].display_name;
  this.latitude =geoData[0].lat;
  this.longitude = geoData[0].lon;
}
Location.current ;
function Weather(obj){
  this.forecast=obj.weather.description;
  this.time = new Date(obj.valid_date).toDateString();
}
Weather.all =[];
app.listen(PORT,()=>console.log(`the server running in port ${PORT}`));
