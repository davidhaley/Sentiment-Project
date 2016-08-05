"use strict";

var express = require("express");
var app = express();
const Twitter = require("twitter-node-client").Twitter;

var rp = require("request-promise");

const URL = "https://api.twitter.com/1.1/search/tweets.json&q=%23freebandnames&since_id=24012619984051000&max_id=250126199840518145&result_type=mixed&count=4";


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
  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});