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

  var sentimentArray = [];
  var apiDomain = "https://twinword-sentiment-analysis.p.mashape.com/analyze/?text="

  async.waterfall([
    function(callback) {
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

        res.json(contentArray);
        callback(null, sentimentQueries);
      };
      twitter.getSearch({"q":"trump", "lang":"en", "count": 20, "result\_type":"popular"}, error, success);
    },
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
        // callback(null, results);
        sentimentArray = results;
        var test = [ [ 'negative', 200 ],
          [ 'negative', 200 ],
          [ 'negative', 200 ],
          [ 'positive', 200 ],
          [ 'neutral', 200 ],
          [ 'negative', 200 ],
          [ 'neutral', 200 ],
          [ 'negative', 200 ],
          [ 'neutral', 200 ],
          [ 'neutral', 200 ],
          [ 'positive', 200 ],
          [ 'neutral', 200 ],
          [ 'neutral', 200 ],
          [ 'positive', 200 ],
          [ 'negative', 200 ] ]
        console.log(JSON.stringify(test) == JSON.stringify(results));
      });
  //   // callback(null, sentimentArray);
  //   // debugger;
  //   }
  // // }
  // ],
  // // optional callback
  // function(err, results) {
  //   app.locals.sentimentArray = results;
  //   debugger;
  // });
    }
  ]);
});

// When a browser requests the root apiDomain, request tweet, send to NPL, and display on index page.
// app.get('/', function(req, res){

//   async.waterfall([

//     // Send array of tweets to NLP API to be evaluated, return 'positive/negative' sentiment on success, or print error on failure.
//     function getSentiment(contentArray, callback) {
//       contentArray.forEach(function(tweet, index) {
//         var text = tweet.text;
//         var query = text.split(" ").join("+").replace("'","");
//         var apiDomain = "https://twinword-sentiment-analysis.p.mashape.com/analyze/?text="

//       unirest.get(apiDomain+query)
//         .header("X-Mashape-Key", "kWBJRsZrjmmshQnhz4Fta1chiRRxp1rhKxgjsnUGdwGKSkVFbG")
//         .header("Accept", "application/json")
//         .end(function (result) {
//           if (result.status == 200) {
//             console.log("Result status 200. Success");
//             contentArray[index].sentiment = result.body.type;
//             contentArray[index].status = result.status
//             return;
//           } else {
//             console.log("Result status is " + "result.status");
//             res.locals.sentiment = "ERROR"
//             res.locals.status = result.status;
//             return;
//           }
//         });
//       });
//       console.log(contentArray);
//       callback(null, contentArray);
//     }
//   ], function(err, result) {
//     if (err) {
//       console.log("ERROR: " + err);
//     } else {
//       console.log("SUCCESS: " + result);
//       res.render('index.ejs', {contentArray: result});
//     }
//   });
// });

app.listen(3000);
console.log('app is listening at localhost:3000');