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
app.all('*', function(req, res, next){
  next();
});

app.get('/tweets', function(req, res) {
  res.render('tweets.ejs');
});

// When a browser requests the root url, request tweet, send to NPL, and display on index page.
app.get('/', function(req, res){

  async.waterfall([
    // Retrieve tweets from Twitter, return array of tweets on success, or print error on failure.
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
        JSON.parse(data).statuses.forEach(function(tweet) {
          contentArray.push(tweet);
        });
        callback(null, contentArray);
      };

      twitter.getSearch({"q":"tesla", "lang":"en", "count": 3, "result\_type":"popular"}, error, success);
    },
    
    // Send array of tweets to NLP API to be evaluated, return 'positive/negative' sentiment on success, or print error on failure.
    function getSentiment(contentArray, callback) {
      contentArray.forEach(function(tweet, index) {
        var text = tweet.text;
        var query = text.split(" ").join("+").replace("'","");
        var url = "https://twinword-sentiment-analysis.p.mashape.com/analyze/?text="

      unirest.get(url+query)
        .header("X-Mashape-Key", "kWBJRsZrjmmshQnhz4Fta1chiRRxp1rhKxgjsnUGdwGKSkVFbG")
        .header("Accept", "application/json")
        .end(function (result) {
          if (result.status == 200) {
            console.log("Result status 200. Success");
            contentArray[index].sentiment = result.body.type;
            contentArray[index].status = result.status
            return;
          } else {
            console.log("Result status is " + "result.status");
            res.locals.sentiment = "ERROR"
            res.locals.status = result.status;
            return;
          }
        });
      });
      console.log(contentArray);
      callback(null, contentArray);
    }
  ], function(err, result) {
    if (err) {
      console.log("ERROR: " + err);
    } else {
      console.log("SUCCESS: " + result);
      res.render('index.ejs', {contentArray: result});
    }
  });
});

app.listen(3000);
console.log('app is listening at localhost:3000');