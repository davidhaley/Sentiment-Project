"use strict";

// Require the needed modules and create the app variable.
var requirejs = require('requirejs');
const express = require('express');
const unirest = require('unirest');
const fs = require('fs');
const app = express();
const apiConfig = require('./api');
const config = apiConfig.twitterConfig;
const Twitter = require("twitter-node-client").Twitter;
const twitter = new Twitter(config);
var async = require('async');

// Set up the app to serve files in the public folder.
app.use('/public', express.static(__dirname + '/public'));

// Add local variables that can be used in views and throughout the app.
app.locals.title = 'Sentiment';

// App will perform any functions here before responding to routes.
// app.all('*', function(req, res, next){
//   next();
// });

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('main.ejs');
});

app.post('/tweets', function(req, res) {

  function getTweets(callback) {
    var error = function (error, response, body) {
      if (error) {
        console.log('ERROR [%s]', error);
        callback(error, null);
        return;
      }
    };
    var success = function(data) {
      var contentArray = [];
      var sentimentQueries = [];

      JSON.parse(data).statuses.forEach(function(tweet) {
          // Create query object for TwinWord.
          var queryObj = {};

          // Make query id and tweet id equivalent to match them in the client.
          queryObj.id = tweet.id_str;

          // Build query for TwinWord API.
          var text = tweet.text;
          var query = text.split(" ").join("+").replace("'","");
          
          // Add API query to query object, to later match with tweet when returned. 
          queryObj.query = query;

          // Add tweet date to query object for line chart on client
          queryObj.tweetDate = tweet.created_at;

          sentimentQueries.push(queryObj);
          contentArray.push(tweet);
        });

      // var max_id = lowest id parameter for the next request
      // number of tweets to request
      // var count = 120;

      // Dates for chart
      // var searchDates = function(contentArray) {
      //   contentArray.forEach(function(tweet) {
      //     return tweet.created_at;
      //   });
      // };
      
      // var minDate = new Date(Math.min.call(null,searchDates));
      // var maxDate = new Date(Math.max.call(null,searchDates));

      res.app.locals.sentimentQueries = sentimentQueries;
      res.json(contentArray);
    };
      twitter.getSearch({"q":"Donald Trump", "lang":"en", "count": 5}, error, success);
      // , "result\_type":"popular"
  }
    getTweets();
});

app.get('/sentiment', function(req, res) {

  var apiDomain = "https://twinword-sentiment-analysis.p.mashape.com/analyze/?text="
  var sentimentArray = [];

  function getSentiment(sentimentQueries, callback) {
    async.reflect(async.mapLimit(sentimentQueries, 10, function(queryObj, callback) {
      var query = queryObj.query;
      unirest.get(apiDomain+query)
      .header("X-Mashape-Key", "kWBJRsZrjmmshQnhz4Fta1chiRRxp1rhKxgjsnUGdwGKSkVFbG")
      .header("Accept", "application/json")
      .end(function (result) {
        if (result.status == 200) {
          console.log("Result status 200. Success");
          var response = [queryObj.id, result.body.type, result.status, result.body.score, queryObj.tweetDate];
          callback(null, response);
          return;
        } else {
          console.log("Result status is " + result);
          var error = [queryObj.id, result.error]
          callback(error, null);
          return;
        }
      });
    }, function(err, results) {
      res.json(results);
    }));
  }
  getSentiment(res.app.locals.sentimentQueries);
});

app.listen(3000);
console.log('app is listening at localhost:3000');