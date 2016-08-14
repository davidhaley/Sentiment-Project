'use strict';

$(document).ready(function(){
  $('#load-tweets').keyup(function(event) {
    event.preventDefault();
    if (event.keyCode == '13') {
      $.ajax({
        type: 'POST',
        url: '/tweets',
        dataType: 'JSON',
        success: function(data) {
          data.forEach(function(tweet) {


            // Grab tweet ID to later match sentiment analysis
            var id = tweet.id_str;

            // HTML structure
            var tweetBox = $('<li>').addClass('tweet-box').attr('id', id);
            var article = $('<article>').addClass('media');
            var mediaLeft = $('<div>').addClass('media-left');
            var figure = $('<figure>').addClass('image is-48x48');
            var mediaContent = $('<div>').addClass('media-content');
            var content = $('<div>').addClass('content');
            var avatarContainer = $('<div>').addClass('avatar-container').addClass('neutral');

            // Build tweet
            var userName = $('<strong>').append(tweet.user.name).append(' ');
            var atUser = $('<small>').append('@' + tweet.user.screen_name).append('<br>');
            var text = tweet.text;
            var fullTweet = $('<p>').append(userName).append(atUser).append(text).append(id);

            // Add tweet to HTML
            var appendTweet = $(content).append(fullTweet);
            var finalTweet = $(mediaContent).append(appendTweet);

            // Build profile image
            var imageUrl = tweet.user.profile_image_url;
            var userImg = $('<img>').attr('src', imageUrl).addClass('avatar');

            // Add profile image to HTML
            var appendImageToFigure = $(figure).append(userImg);
            var avatarImage = $(mediaLeft).append(appendImageToFigure);
            var avatar = $(avatarContainer).append(avatarImage);

            // Add profile image and tweet to page
            var mainArticle = $(article).append(avatar).append(finalTweet);
            var completeTweet = $(tweetBox).append(mainArticle);
            $('.tweets-neutral').append(completeTweet);
          });
          $.ajax({
            type: 'GET',
            url: '  /sentiment',
            dataType: 'JSON',
            success: function(data) {
              data.forEach(function(sentiment) {
                if (sentiment === null) {
                  false;
                  return;
                } else {
                  var sentimentId = sentiment[0];
                  var sentimentText = sentiment[1];
                  var sentimentResult = $('<div>').append(sentimentText).append(sentimentId);
                  var matchingTweet = $('.tweets-neutral').children('#' + sentimentId);
                  // $(matchingTweet).find('.avatar-container').addClass('neutral');
                  $(matchingTweet).find('.media-content').append(sentimentResult);               

                  if (sentimentText === 'positive') {
                    $(matchingTweet).find('.avatar-container').removeClass('neutral').addClass('positive');
                    $(matchingTweet).find('.media-content').append(sentimentResult);
                  } else if (sentimentText === 'negative') {
                    $(matchingTweet).find('.avatar-container').removeClass('neutral').addClass('negative');
                    $(matchingTweet).find('.media-content').append(sentimentResult);
                  }
                }
              });
            },
            error: function(data) {
              debugger;
              console.log('error');
              console.log(data);
            }
        });
        },
          error: function(data) {
            debugger;
            console.log('error');
            console.log(data);
          }
      });
    }
    return false;
  });
});