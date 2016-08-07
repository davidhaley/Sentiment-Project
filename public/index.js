$(document).ready(function() {
  $("#load-tweets").on('click', function() {
    // Search twitter for tweets matching search words
    twitter.getSearch({"q":" movie -scary :)", "count": 10, "result\_type":"popular"}, function() {}, function(response) {
      var contentArray = [];
      JSON.parse(response).statuses.forEach(function(tweet) {
        contentArray.push(tweet.text);
      });
      contentArray.forEach(function(tweet) {
        var tweets = $("<h3>").append(tweet);
        $(".container").append(tweets);
      });
    });  
  });
});