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
app.locals.sentimentArray = [];

// App will perform any functions here before responding to routes.
app.all('*', function(req, res, next){
  next();
});

app.get('/', function(req, res) {
  res.render('index.ejs');
});

app.post('/tweets', function(req, res) {

    function getTweets(callback) {
      var error = function (err, response, body) {
        if (err) {
          console.log('ERROR [%s]', err);
          callback(err, null);
          return;
        }
      };
      var success = function(data) {
        var contentArray = [];
        var sentimentQueries = [];

        JSON.parse(data).statuses.forEach(function(tweet) {
          var text = tweet.text;
          var query = text.split(" ").join("+").replace("'","");
          sentimentQueries.push(query);
          contentArray.push(tweet);
        });

        res.app.locals.sentimentQueries = sentimentQueries;
        res.json(contentArray);
        // callback(null, sentimentQueries);
      };
      twitter.getSearch({"q":"trump", "lang":"en", "count": 5, "result\_type":"popular"}, error, success);
    }
    getTweets();
});

app.get('/sentiment', function(req, res) {

  var apiDomain = "https://twinword-sentiment-analysis.p.mashape.com/analyze/?text="
  var sentimentArray = [];

  function getSentiment(sentimentQueries, callback) {
    async.map(sentimentQueries, function(query, callback) {
      unirest.get(apiDomain+query)
      .header("X-Mashape-Key", "kWBJRsZrjmmshQnhz4Fta1chiRRxp1rhKxgjsnUGdwGKSkVFbG")
      .header("Accept", "application/json")
      .end(function (result) {
        if (result.status == 200) {
          console.log("Result status 200. Success");
          var res = [result.body.type, result.status];
          callback(null, res);
          return;
        } else {
          console.log("Result status is " + "result.status");
          var res = [result.body.type, result.status];
          callback(null, res);
          return;
        }
      });
      sentimentArray.push(res);
    }, function(err, results) {
      res.json(results);
    });
  };
  getSentiment(res.app.locals.sentimentQueries);
});

app.listen(3000);
console.log('app is listening at localhost:3000');