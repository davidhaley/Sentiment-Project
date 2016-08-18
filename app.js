"use strict";

// Require the needed modules and create the app variable.
var requirejs = require('requirejs');
const express = require('express');
var bodyParser = require('body-parser')
const unirest = require('unirest');
const fs = require('fs');
const app = express();
const apiConfig = require('./api');
const config = apiConfig.twitterConfig;
const Twitter = require("twitter-node-client").Twitter;
const twitter = new Twitter(config);
var async = require('async');

if ('development' == app.get('env')) {
    console.log("Threadpool 128");
    process.env.UV_THREADPOOL_SIZE=128;
}

// Setup bodyParser to receive requests from client
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// Set up the app to serve files in the public folder.
app.use('/public', express.static(__dirname + '/public'));

// *** Don't change these ***
app.locals.title = 'Sentiment';
app.locals.sentimentQueries = [];
app.locals.tweetArray = [];
// *** Change count in tweet route below ***
app.locals.count = 0;
app.locals.queryString = "";

// EJS view engine
app.set('view engine', 'ejs');

// Landing page
app.get('/', function(req, res) {
  res.render('main.ejs');
});

app.post('/tweets', jsonParser, function(req, res) {
  if (!req.body) return res.sendStatus(400);

  // Receive search query from client
  res.app.locals.queryString = req.body.query;

  // Change query count here
  res.app.locals.count = 100;

  function getTweets(callback) {
    var error = function (error, response, body) {
      if (error) {
        // console.log('ERROR [%s]', error);
        console.log(error)
        // callback(error, null);
        return;
      }
    };

    var success = function(data) {

      // Remove emoji icons from Twinword search query, else receive 400 error 'Bad Request'
      var ranges = [
        '\ud83c[\udf00-\udfff]', // U+1F300 to U+1F3FF
        '\ud83d[\udc00-\ude4f]', // U+1F400 to U+1F64F
        '\ud83d[\ude80-\udeff]',  // U+1F680 to U+1F6FF
        '[^\x00-\x7F]'
      ];

      function removeInvalidChars(string) {
        var string = string.replace(new RegExp(ranges.join('|'), 'g'), '');
        return string;
      }

      JSON.parse(data).statuses.forEach(function(tweet) {
        // Create query object for TwinWord.
        var queryObj = {};

        // Make query id and tweet id equivalent to match them in the client.
        queryObj.id = tweet.id_str;

        // Build query for TwinWord API.
        var text = removeInvalidChars(tweet.text);
        var query = text.split(" ").join("+").replace("'","");
        
        // Add API query to query object, to later match with tweet when returned. 
        queryObj.query = query;

        // Add tweet date to query object for line chart on client
        queryObj.tweetDate = tweet.created_at;

        res.app.locals.sentimentQueries.push(queryObj);
        res.app.locals.tweetArray.push(tweet);
        });

      function sortNumber(a,b) {
        return a.id_str - b.id_str;
      }

      res.app.locals.tweetArray = res.app.locals.tweetArray.sort(sortNumber);

      // Respond to the view only once all of the Tweets have been gathered
      // Otherwise, make additional requests to Twitter

      if ((res.app.locals.tweetArray.length + 1) >= res.app.locals.count ) {
        console.log('Tweet Array Length: ' + res.app.locals.tweetArray.length);
        console.log('Count: ' + res.app.locals.count);
        // Show a maximum amount of tweets on the page
        var numberOfTweetsToDisplay = -50;

        // Build response
        var response = res.app.locals.tweetArray.splice(numberOfTweetsToDisplay);

        // Repond to the view
        res.json(response);
      } else {
        console.log('Tweet Array Length: ' + res.app.locals.tweetArray.length);
        console.log('Count: ' + res.app.locals.count);

        // The first request to the twitter API should specify a count.
        // Subsequent requests should utilize max_id and since_id to
        // Make sure duplicate tweets are not obtained.
        // More information can be found here: https://dev.twitter.com/rest/public/timelines

        // Twitter will only return Tweets with IDs LOWER than the value passed for max_id.
        var max_id = res.app.locals.tweetArray[0].id_str;
        
        // Twitter will only return Tweets with IDs HIGHER than the value passed for since_id.
        var since_id = res.app.locals.tweetArray.slice(-1)[0].id_str;

        if (res.app.locals.count >= 100) {
          var pageCount = 100;
        } else {
          var pageCount = res.app.locals.count;
          console.log("Page Count: " + pageCount);
        };

        if ((res.app.locals.tweetArray.length + pageCount) > res.app.locals.count) {
          res.app.locals.count = res.app.locals.count - res.app.locals.tweetArray.length;
          console.log("New Count: " + res.app.locals.count);
        }

        // Following Twitter API requests
        twitter.getSearch({"q":res.app.locals.queryString, "lang":"en", "count": res.app.locals.count, "max_id": max_id}, error, success);
      };
    };
    debugger;
    // Initial Twitter API request
    twitter.getSearch({"q":res.app.locals.queryString, "lang":"en", "count": res.app.locals.count}, error, success);
  }
    getTweets();
});

app.get('/sentiment', function(req, res) {

  var apiDomain = "https://twinword-sentiment-analysis.p.mashape.com/analyze/?text="
  var sentimentArray = [];
  var queryCounter = 0;

  function getSentiment(sentimentQueries, callback) {
    async.reflect(async.mapLimit(sentimentQueries, 10, function(queryObj, callback) {
      var query = queryObj.query;
      unirest.get(apiDomain+query)
      .header("X-Mashape-Key", "kWBJRsZrjmmshQnhz4Fta1chiRRxp1rhKxgjsnUGdwGKSkVFbG")
      .header("Host: twinword-sentiment-analysis.p.mashape.com")
      .header("Accept", "application/json")
      .timeout(10000)
      .forever(true)
      .end(function (result) {
        if (result.status == 200) {
          console.log("Result status 200. Success");
          queryCounter += 1;
          console.log("Queries remaining: ")
          console.log(sentimentQueries.length - queryCounter);
          var response = [queryObj.id, result.body.type, result.status, result.body.score, queryObj.tweetDate, result.body.keywords];
          callback(null, response);
          return;
        } else {
          console.log(JSON.stringify(result))
          console.log("Result status is " + result.error);
          var error = [queryObj.id, result.error]
          // callback(error, null);
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