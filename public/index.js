"use strict";

$(document).ready(function(){
  $("#load-tweets").keyup(function(event) {
    event.preventDefault();
    if (event.keyCode == '13') {
      console.log("button has been clicked!");
      $.ajax({
        type: "POST",
        url: '  /tweets',
        dataType: 'JSON',
        success: function(data) {
          data.forEach(function(tweet) {
            var p = $('<p>');
            var text = tweet.text;
            var id = tweet.id_str;
            $(p).append(text).append(id);
            var finalTweet = $("<div>").attr('id', id).append(p);
            $('#tweets-neutral').append(finalTweet);

            // image stuff
            var imageUrl = tweet.user.profile_image_url;
            var userImg = $('<img>').attr("src", imageUrl);
            var media = $('<div>').addClass("media-left");
            var figure = $("<figure>").addClass("image").addClass("is-64x64").append(userImg);
            var mediaLeft = $(media).append(figure);

            $('#tweets-neutral').append(mediaLeft);
          });
          $.ajax({
            type: "GET",
            url: '  /sentiment',
            dataType: 'JSON',
            success: function(data) {
              data.forEach(function(sentiment) {
                var div = $('<div>');
                var p = $('<p>');

                if (sentiment == null) {
                  false;
                  return;
                } else {
                  var id = sentiment[0];
                  var text = $(p).append(sentiment[1]);
                  $(div).append(text).append(id);
                  $('#tweets-neutral').children("#" + id).append(div);               
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