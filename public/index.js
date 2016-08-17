'use strict';

$(document).ready(function() {
  $(".search-container").on("submit", function(){
    return false;
  });
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
            var avatarContainer = $('<div>').addClass('avatar-container');
            var hr = $('<hr>').addClass('hr').addClass('neutral');

            // Build tweet
            var userName = $('<strong>').append(tweet.user.name).append(' ');
            var atUser = $('<small>').append('@' + tweet.user.screen_name).append('<br>');
            var text = tweet.text;
            var fullTweet = $('<p>').append(userName).append(atUser).append(text);

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
            var completeTweet = $(tweetBox).append(mainArticle).append(hr);
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
              var sentimentCount = 0;

              // Load Tipsy tooltip plugin
              // $('a[rel=tipsy]').tipsy({fade: true, gravity: 'n'});

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
                  var sentimentKeyWordsArray = sentiment[5];
                  sentimentCount += 1;

                  // Get Sentiment keywords for word highlighting & Sentiment scores for tooltip
                  var context = [];
                  var tooltip = [];
                  sentimentKeyWordsArray.forEach(function(keyword) {
                    context.push(keyword.word);
                    tooltip.push(keyword.word + ": " + (keyword.score * 10).toFixed(2) + "<br>");
                  });

                  // Prepare tooltip
                  var tooltip = tooltip.toString().replace(/"|,/g,'');
                  var finalToolTip = "<strong>Overall Sentiment: <strong>" + sentimentText.toUpperCase() + "<br>" + "<strong>Overall Score: <strong>" + sentimentScore + "<br><br>" + tooltip;

                  // Highlight Sentiment keywords
                  $('.content').mark(context);

                  // Find the tweet that matches the sentiment score
                  var matchingTweet = $('.tweets-neutral').children('#' + sentimentId).attr('title', finalToolTip).tipsy({html: true });

                  if (sentimentText === 'positive') {
                    barChartSeries[0] += 1;
                    lineChartSeriesPositive.push(sentimentScore);
                    $(matchingTweet).find('.hr').removeClass('neutral').addClass('positive');
                    var element = $(matchingTweet).detach();
                    $('.tweets-positive').append(element);
                  } else if (sentimentText === 'negative') {
                    barChartSeries[2] += 1;
                    lineChartSeriesNegative.push(sentimentScore);
                    $(matchingTweet).find('.hr').removeClass('neutral').addClass('negative');
                    var element = $(matchingTweet).detach();
                    $('.tweets-negative').append(element);
                  } else if (sentimentText === 'neutral') {
                    barChartSeries[1] += 1;
                    lineChartSeriesNeutral.push(sentimentScore);
                  }
                }
              });

              // Increase the magnitude of the scores by one decimal place
              var increaseMagnitude = function(value) {
                return value * 10;
              };
              
              var lineChartSeriesPositive = lineChartSeriesPositive.map(increaseMagnitude);
              var lineChartSeriesNeutral = lineChartSeriesNeutral.map(increaseMagnitude);
              var lineChartSeriesNegative = lineChartSeriesNegative.map(increaseMagnitude);
              
              var xAxisSentimentCount = [];
              var sentimentCount = function() {
                for (i = 0; i < sentimentCount.length; i++) {
                  xAxisSentimentCount.push(i);
                }
              };

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
                // labels: [oldestDate, mostPresentDate],
                labels: xAxisSentimentCount,
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

              // Update line chart options to include tweet count on x-axis
              var lineChartOptions = {
                plugins: [
                  Chartist.plugins.axisLabel({
                    axisX: {
                        name: 'Based on ' + sentimentCount.length + 'tweets!'
                    }
                  })
                ]
              };

              // Update bar chart
              var barChart = $('#bar-chart');
              barChart.get(0).__chartist__.update(barChartData);

              // Update line chart
              var lineChart = $('#line-chart');
              lineChart.get(0).__chartist__.update(lineChartData, lineChartOptions, true);

            },
            error: function(data) {
              console.log('error');
              console.log(data);
            }
          });
        },
        error: function(data) {
          console.log('error');
          console.log(data);
        }
      });
    }
    return false;
  });
});