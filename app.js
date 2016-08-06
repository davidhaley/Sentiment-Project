"use strict";

var express = require("express");
var app = express();
var unirest = require('unirest');
var fs = require('fs');

const URL = "https://api.twitter.com/1.1/search/tweets.json&q=%23freebandnames&since_id=24012619984051000&max_id=250126199840518145&result_type=mixed&count=4";

const Twitter = require("twitter-node-client").Twitter;

const twitterConfig = {
  consumerKey: "0yjFJ85xFKKZywszmJh5ISBuA",
  consumerSecret: "G3nSYYifc1M2z2h05XSaYYINa43phuoVloPUQPwlaN9w4B3gs1",
  accessToken: "395795682-mx88v72OEkG88L0BXK4C4bIGST1iE4mRRSwE33qZ",
  accessTokenSecret: "8vQD1029HPrvVkv3vaFGgxIAzx71CyvnDrmds84WlszoB",
  callBackUrl: ""
};

var twitter = new Twitter(twitterConfig);

app.get("/", function (req, res) {
  twitter.getSearch({"q":" movie -scary :)", "count": 10, "result\_type":"popular"}, function() {}, function(response) {
    res.render("index", {title: "Express", response: response});

    fs.writeFile('twitter.txt', response, function (err) {
      if (err) return console.log(err);
      console.log(response);
    });
  });
});





// unirest.get("https://twinword-sentiment-analysis.p.mashape.com/analyze/?text=great+value+in+its+price+range!")
// .header("X-Mashape-Key", "kWBJRsZrjmmshQnhz4Fta1chiRRxp1rhKxgjsnUGdwGKSkVFbG")
// .header("Accept", "application/json")
// .end(function (result) {
//   console.log(result.status, result.headers, result.body);
// });

module.exports = app;
// module.exports = unirest;

// app.listen(3000, function () {
//   console.log('Example app listening on port 3000!');
// });

