'use strict';

$(document).ready(function() {
  $('#load-tweets').keyup(function(event) {
    event.preventDefault();
    console.log("button has been pressed");
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

              // Setup variables for charts
              var barChartSeries = [0, 0, 0];
              var lineChartLabelsDates = [];
              var lineChartSeriesPositive = [];
              var lineChartSeriesNeutral = [];
              var lineChartSeriesNegative = [];

              data.forEach(function(sentiment) {
                if (sentiment === null) {
                  false;
                  return;
                } else {
                  // Gather dates to update line chart
                  var tweetDate = new Date(sentiment[4]);
                  lineChartLabelsDates.push(tweetDate);

                  var sentimentId = sentiment[0];
                  var sentimentText = sentiment[1];
                  var sentimentScore = sentiment[3].toFixed(2);

                  var sentimentResult = $('<div>').append(sentimentText).append(sentimentId);
                  var matchingTweet = $('.tweets-neutral').children('#' + sentimentId);
                  $(matchingTweet).find('.media-content').append(sentimentResult);

                  if (sentimentText === 'positive') {
                    barChartSeries[0] += 1;
                    lineChartSeriesPositive.push(sentimentScore);
                    $(matchingTweet).find('.avatar-container').removeClass('neutral').addClass('positive');
                    $(matchingTweet).find('.media-content').append(sentimentResult);
                    var element = $(matchingTweet).detach();
                    $('.tweets-positive').append(element);
                  } else if (sentimentText === 'negative') {
                    barChartSeries[2] += 1;
                    lineChartSeriesNegative.push(sentimentScore);
                    $(matchingTweet).find('.avatar-container').removeClass('neutral').addClass('negative');
                    $(matchingTweet).find('.media-content').append(sentimentResult);
                    var element = $(matchingTweet).detach();
                    $('.tweets-negative').append(element);
                  } else if (sentimentText === 'neutral') {
                    barChartSeries[1] += 1;
                    lineChartSeriesNeutral.push(sentimentScore);
                  }
                }
              });

              // Get dates for y-axis on line chart
              var highLowDates = Chartist.getHighLow(lineChartLabelsDates);
              var mostPresentDate = highLowDates.high
              if (highLowDates.low == 0) {
                var oldestDate = mostPresentDate;
              } else {
                var oldestDate = highLowDates.low;
              }

              // Set dates for y-axis on line chart
              var mostPresentDate = new Date(highLowDates.high);
              var oldestDate = new Date(highLowDates.low);

              // New data to update bar chart
              var barChartData = {
              labels: ["Positive", "Neutral", "Negative"],
              series: [
                barChartSeries
              ]
              };

              // var formattedDate = $.format.date(tweetDate, "MMM/D");

              // New data to update line chart
              var lineChartData = {
                // Dates
                labels: [oldestDate, mostPresentDate],
                // Sentiment
                series: [
                  // Postive
                  lineChartSeriesPositive,
                  // Neutral
                  lineChartSeriesNeutral,
                  // Negative
                  lineChartSeriesNegative
                ]
              };              

              // Update bar chart
              var barChart = $('#bar-chart');
              barChart.get(0).__chartist__.update(barChartData);

              // Update line chart
              var lineChart = $('#line-chart');
              lineChart.get(0).__chartist__.update(lineChartData);

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