$(document).ready(function(){
  $("#load-tweets").on('click', function(callback) {
    console.log("button has been clicked!");

    $.ajax({
      type: "POST",
      url: '  /tweets',
      // // data: String,
      dataType: 'JSON',
      success: function(data) {
        data.forEach(function(tweet) {
          var div = $('<div>').append(JSON.stringify(tweet.text));
          $(div).appendTo('.tweets');
        });
      },
      error: function(data) {
        console.log("error");
        console.log(data);
      }
    });

    // contentArray.forEach(function(tweet) {
    //   console.log(tweet);
    //   var div = $('.tweets').append(tweet);
    // });
  });
});
