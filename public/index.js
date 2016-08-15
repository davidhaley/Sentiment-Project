'use strict';

$(document).ready(function() {
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
              var chartData = [0, 0, 0];
              data.forEach(function(sentiment) {
                console.log(sentiment)
                debugger;
                if (sentiment === null) {
                  false;
                  return;
                } else {
                  // Every tweet is neutral until proven otherwise
                  chartData[1] += 1;

                  var sentimentId = sentiment[0];
                  var sentimentText = sentiment[1];
                  var sentimentScore = sentiment[3];
                  console.log(sentimentScore);

                  var sentimentResult = $('<div>').append(sentimentText).append(sentimentId);
                  var matchingTweet = $('.tweets-neutral').children('#' + sentimentId);
                  $(matchingTweet).find('.media-content').append(sentimentResult);

                  if (sentimentText === 'positive') {
                    chartData[1] -= 1;
                    chartData[0] += 1;
                    $(matchingTweet).find('.avatar-container').removeClass('neutral').addClass('positive');
                    $(matchingTweet).find('.media-content').append(sentimentResult);
                    var element = $(matchingTweet).detach();
                    $('.tweets-positive').append(element);
                  } else if (sentimentText === 'negative') {
                    chartData[1] -= 1;
                    chartData[2] += 1;
                    $(matchingTweet).find('.avatar-container').removeClass('neutral').addClass('negative');
                    $(matchingTweet).find('.media-content').append(sentimentResult);
                    var element = $(matchingTweet).detach();
                    $('.tweets-negative').append(element);
                  }
                }
              });

              // if tweet container is empty, remove class is-one-quarter
              // if one is missing, change to is-half
              // if two are missing, change to 

              // New data to update the bar chart
              var data = {
              labels: ["Positive", "Neutral", "Negative"],
              series: [
                chartData
              ]
              };

              // Update bar chart
              var mychart = $('#bar-chart');
              mychart.get(0).__chartist__.update(data);

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