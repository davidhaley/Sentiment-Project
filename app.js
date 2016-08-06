"use strict";

// Require the needed modules and create the app variable.
var express = require('express');
var unirest = require('unirest');
var fs = require('fs');
var app = express();
const apiConfig = require('./api');
const config = apiConfig.twitterConfig;
const Twitter = require("twitter-node-client").Twitter;
var twitter = new Twitter(config);

// Set up the app to serve files in the public folder.
app.use('/public', express.static(__dirname + '/public'));

// Add local variables that can be used in views and throughout the app.
app.locals.title = 'Sentiment';

// Load tweets from the json file before responding to routes.
app.all('*', function(req, res, next){
  next();

  // unirest.get("https://twinword-sentiment-analysis.p.mashape.com/analyze/?text=great+value+in+its+price+range!")
  //   .header("X-Mashape-Key", "kWBJRsZrjmmshQnhz4Fta1chiRRxp1rhKxgjsnUGdwGKSkVFbG")
  //   .header("Accept", "application/json")
  //   .end(function (result) {
  //     // res.locals.status = result.status;
  //     // res.locals.headers = result.headers;
  //     res.locals.sentiment = result.body.type;
  //     next();
  //   });
});

// When a browser requests the root url, respond with the index.ejs file.
app.get('/', function(req, res){

  // Search twitter for tweets matching search words
  twitter.getSearch({"q":" movie -scary :)", "count": 10, "result\_type":"popular"}, function() {}, function(response) {
    var contentArray = [];
    JSON.parse(response).statuses.forEach(function(tweet) {
      contentArray.push(tweet.text);
    });
    res.render("index.ejs", {contentArray: contentArray});
  });
});

app.listen(3000);
console.log('app is listening at localhost:3000');