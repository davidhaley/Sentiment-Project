"use strict";

$(document).ready(function(){
  $("#input").keyup(function(event) {
    event.preventDefault();
    if (event.keyCode == '13') {
      console.log("button has been clicked!");
      $.ajax({
        type: "POST",
        url: '  /search',
        dataType: 'JSON',
        success: function(data) {
          data.forEach(function(tweet) {

            // Grab tweet ID to later match sentiment analysis
            var id = tweet.id_str;

            // HTML structure
            var tweetBox = $('<li>').addClass('tweet-box');
            var article = $('<article>').addClass('media');
            var mediaLeft = $('<div>').addClass('media-left');
            var figure = $('<figure>').addClass('image is-64x64');
            var mediaContent = $('<div>').addClass('media-content');
            var content = $('<div>').addClass('content');
            // var figure = $("<figure>").addClass("image").addClass("is-64x64");

            // Build tweet
            var userName = $('<strong>').append(tweet.user.name).append(' ');
            var atUser = $('<small>').append("@" + tweet.user.screen_name).append('<br>');
            var text = tweet.text;
            var fullTweet = $('<p>').append(userName).append(atUser).append(text).append(id);

            // Add tweet to HTML
            var appendTweet = $(content).append(fullTweet);
            var finalTweet = $(mediaContent).append(appendTweet);

            // Build profile image
            var imageUrl = tweet.user.profile_image_url;
            var userImg = $('<img>').attr("src", imageUrl);

            // Add profile image to HTML
            var appendImageToFigure = $(figure).append(userImg);
            var profileImage = $(mediaLeft).append(appendImageToFigure);

            // Add profile image and tweet to page
            var mainArticle = $(article).append(profileImage).append(finalTweet);
            $('.tweet-box').append(mainArticle);
          });
          $.ajax({
            type: "GET",
            url: '  /sentiment',
            dataType: 'JSON',
            success: function(data) {
              data.forEach(function(sentiment) {
                var div = $('<div>');
                var li = $('<li>');

                if (sentiment === null) {
                  false;
                  return;
                } else {
                  var id = sentiment[0];
                  var text = $(li).append(sentiment[1]);
                  $(div).append(text).append(id);
                  $('.tweets-neutral').children("#" + id).append(div);               
                }
              });
            },
            error: function(data) {
              console.log("error");
              console.log(data);
            }
        });
        },
          error: function(data) {
            console.log("error");
            console.log(data);
          }
      });
    }
    return false;
  });
});