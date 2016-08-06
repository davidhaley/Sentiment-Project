"use strict";

// Require the needed modules and create the app variable.
var express = require('express');
var unirest = require('unirest');
var fs = require('fs');
var app = express();

// Set up the app to serve whatever is in the public folder.
app.use('/public', express.static(__dirname + '/public'));

// Add local variables that can be used in views and throughout the app by passing an object to app.locals():
app.locals.title = 'Sentiment';

// Load tweets from the json file before responding to routes.
app.all('*', function(req, res, next){
  fs.readFile('twitter.json', function(err, data){
    res.locals.twitter = JSON.parse(data);
  });

  unirest.get("https://twinword-sentiment-analysis.p.mashape.com/analyze/?text=great+value+in+its+price+range!")
    .header("X-Mashape-Key", "kWBJRsZrjmmshQnhz4Fta1chiRRxp1rhKxgjsnUGdwGKSkVFbG")
    .header("Accept", "application/json")
    .end(function (result) {
      // res.locals.status = result.status;
      // res.locals.headers = result.headers;
      res.locals.sentiment = result.raw_body;
      next();
    });

  // fs.readFile('twinwords.json', function(err, data){
  //   res.locals.sentiment = JSON.parse(data);
  //   next();
  // });
});

// When a browser requests the root url, respond with the index.ejs file.
app.get('/', function(req, res){

  res.render('index.ejs');
});

app.listen(3000);
console.log('app is listening at localhost:3000');