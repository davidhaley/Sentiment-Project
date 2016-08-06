// "use strict";

// Require the needed modules and create the app variable.
var express = require('express');
var fs = require('fs');
var app = express();

// Set up the app to serve whatever is in the public folder at the url
app.use('/public', express.static(__dirname + '/public'));

// Add local variables that can be used in views and throughout the app by passing an object to app.locals():
app.locals.title = 'Sentiment';

// Load tweets from the json file before responding to routes.
app.all('*', function(req, res, next){
  fs.readFile('twitter.json', function(err, data){
    res.locals.twitter = JSON.parse(data);
    next();
  });
});

// When a browser requests the root url, respond with the index.ejs file.
app.get('/', function(req, res){
  res.render('index.ejs');
});

app.listen(3000);
console.log('app is listening at localhost:3000');