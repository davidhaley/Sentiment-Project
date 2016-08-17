$(function() { 
  $("#input").typed({    
    strings: ["Stephen Curry", "Adidas UltraBoosts", "iPhone 7", "Barack Obama", "try it out!"],
      typeSpeed: 1.5,
      backDelay: 500,
              contentType: 'html', // or text

      loop: false, // or text
       // defaults to false for infinite loop
      loopCount: true
  });  
  $('#sidebar-btn').on("click", function() {    
    $("#sidebar").toggleClass('visible');  
  });
});

