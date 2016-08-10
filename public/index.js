"use strict";

$(document).ready(function(){
  $("#load-tweets").on('click', function(callback) {
    console.log("button has been clicked!");
    $.ajax({
      type: "POST",
      url: '  /tweets',
      dataType: 'JSON',
      success: function(data) {
        data.forEach(function(tweet) {
          var div = $('<div>');
          var p = $('<p>');
          var text = tweet.text;

          $(p).append(text);
          $(div).append(p);
          $('.tweets').append(div);
        });
        $.ajax({
          type: "GET",
          url: '  /sentiment',
          dataType: 'JSON',
          success: function(data) {
            data.forEach(function(sentiment) {
              var div = $('<div>');
              var p = $('<p>');

              $(p).append(sentiment[0]);
              $(div).append(p);
              $('.sentiment').append(div);
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
    });
  });