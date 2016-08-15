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
            $('.tweet-container').empty()

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

            $(function() {
              $(".chartContainer").CanvasJSChart({
                title: {
                  text: "Sentiment"
                },
                axisY: {
                  animationEnabled: true,
                  title: "Sentiment",
                  includeZero: true,
                  // minimum: -maxValue(),
                  // maximum: maxValue()
                  minimum: -10,
                  maximum: 10
                },
                axisX: {
                  interval: 2
                },
                data: [{
                  type: "spline", //change type to bar, line, area, pie, etc
                  name: "Positive",
                  showInLegend: false,        
                  dataPoints: [
                    { x: 10, y: 51 },
                    { x: 20, y: 45},
                    { x: 30, y: 50 },
                    { x: 40, y: 62 },
                    { x: 50, y: 95 },
                    { x: 60, y: 66 },
                    { x: 70, y: 24 },
                    { x: 80, y: 32 },
                    { x: 90, y: 16}
                  ]},
                  {
                  type: "spline",
                  name: "Negative",
                  showInLegend: false,        
                  dataPoints: [
                    { x: 10, y: 21 },
                    { x: 20, y: 44},
                    { x: 30, y: 35 },
                    { x: 40, y: 45 },
                    { x: 50, y: 75 },
                    { x: 60, y: 58 },
                    { x: 70, y: 18 },
                    { x: 80, y: 30 },
                    { x: 90, y: 11}
                  ]}
                ],
                legend: {
                  cursor: "pointer",
                  itemclick: function (e) {
                    if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                      e.dataSeries.visible = false;
                    } else {
                      e.dataSeries.visible = true;
                  }
                  chart.render();
                  }
                }
              });
            });
          });
          $.ajax({
            type: 'GET',
            url: '  /sentiment',
            dataType: 'JSON',
            success: function(data) {
              data.forEach(function(sentiment) {
                console.log(sentiment)
                if (sentiment === null) {
                  false;
                  return;
                } else {
                  var sentimentId = sentiment[0];
                  var sentimentText = sentiment[1];
                  var sentimentScore = sentiment[3];
                  console.log(sentimentScore);
                  
                  var sentimentResult = $('<div>').append(sentimentText).append(sentimentId);
                  var matchingTweet = $('.tweets-neutral').children('#' + sentimentId);
                  $(matchingTweet).find('.media-content').append(sentimentResult);               

                  if (sentimentText === 'positive') {
                    $(matchingTweet).find('.avatar-container').removeClass('neutral').addClass('positive');
                    $(matchingTweet).find('.media-content').append(sentimentResult);
                    var element = $(matchingTweet).detach();
                    $('.tweets-positive').append(element);
                  } else if (sentimentText === 'negative') {
                    $(matchingTweet).find('.avatar-container').removeClass('neutral').addClass('negative');
                    $(matchingTweet).find('.media-content').append(sentimentResult);
                    var element = $(matchingTweet).detach();
                    $('.tweets-negative').append(element);
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