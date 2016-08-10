$(function(){
    
    $("#typed").typed({
        stringsElement: $('#typed-strings'),
        typeSpeed: 1.5,
        backDelay: 500,
        loop: false,
        contentType: 'html', // or text
        // defaults to false for infinite loop
        loopCount: false
    });
    $(".reset").click(function(){
        $("#typed").typed('reset');
    });
});