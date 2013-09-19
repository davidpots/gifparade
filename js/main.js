// Read URL params

      // v1 via http://jquery-howto.blogspot.com/2009/09/get-url-parameters-values-with-jquery.html
      function getUrlVars() {
        // look for comment by SpaceLobster to make the orig post's code return an object instead of array
        var params = {}, d = function (s) { return s ? decodeURIComponent(s.replace(/\+/, " ")) : null; }
        if(window.location.search) $.each(window.location.search.substring(1).split('&'), function(i, v) {
        var pair = v.split('=');
        params[d(pair[0])] = d(pair[1]);
        });
        return params;
      }
      var urlVars = getUrlVars();

      // v2 written by me, quite newbish but works for prototype... need to understand the ins+outs better
      function tidyParams(str) {
        str = str.replace(/\+/g,' ');
        return str;
      }

// Defaults

      var defaultNumberGifs = 3;
      var defaultTitle = "get on board!";
      var defaultYoutubeUrl = "http://www.youtube.com/watch?v=kpy4xNAnWzM";
      var defaultGif1 = "http://media.giphy.com/media/DIx84JJyyCqFW/giphy.gif";
      var defaultGif2 = "http://media1.giphy.com/media/oOAuubU8LEI0w/giphy.gif";
      var defaultGif3 = "http://media1.giphy.com/media/d1vaWA1lsbIdy/200.gif";
      var videoStartTime = parseInt(urlVars.videoStartTime) || 0;

// YouTube URL Manipulation

      // Take a normal YouTube URL, get the special ID...
      function getYouTubeCode(url) {
        return url.split('?v=')[1];
      }

      // Insert the YouTube ID into the embed URL
      function makeEmbeddable(code) {
        return "//www.youtube.com/embed/"+code;
      }

      // Setup YouTube video
      if (urlVars.paradeYoutubeUrl == undefined) {
        urlVars.paradeYoutubeUrl = defaultYoutubeUrl;
      }
      var str = urlVars.paradeYoutubeUrl;
      str = getYouTubeCode(str);
      str = makeEmbeddable(str);
      str = "https:" + str + "?enablejsapi=1&controls=0&modestbranding=1&autoplay=1&start=0&origin="+location.hostname;
      $('#player').attr('src',str)

// YouTube API high-five https://developers.google.com/youtube/iframe_api_reference

      var tag = document.createElement('script');

      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      var player;
      function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
          height: '390',
          width: '640',
          origin: location.origin,
          videoId: getYouTubeCode(urlVars.paradeYoutubeUrl),
          playerVars: {
              'autoplay': 1,
              'controls': 0,
              'modestbranding': 1,
              'showinfo': 0,
              'loop': 1,
              'start': videoStartTime
          },
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
      }

      function onPlayerReady(event) {
        // This is what Garrett does... pauses the video, gets the GIF ready, which then starts the video (once GIF is loaded). http://loudgif.com/js/loud.js
        player.pauseVideo();
        startParade();
      }

      function onPlayerStateChange(event) {
        // Garrett does something here too, need to dig into it... http://loudgif.com/js/loud.js
      }


// Turn Params into vars

      // Setup Title. Ghetto fix here, need to learn about defaults vs. empty paramater, etc
      if (window.location.search == "") {
        urlVars.paradeTitle = defaultTitle;
      }
      if (urlVars.paradeTitle == undefined) {
        urlVars.paradeTitle = "";
      }
      var paradeTitle = tidyParams(urlVars.paradeTitle);

      // Setup the Gifs
      if (urlVars.gif1 == undefined) {
        urlVars.gif1 = defaultGif1;
      }
      if (urlVars.gif2 == undefined) {
        urlVars.gif2 = defaultGif2;
      }
      if (urlVars.gif3 == undefined) {
        urlVars.gif3 = defaultGif3;
      }
      if (urlVars.numberOfGifs == undefined) {
        urlVars.numberOfGifs = 3;
      }      
      if (urlVars.secret == undefined) {
        urlVars.secret = defaultGif1+","+defaultGif2+","+defaultGif3;
      }



// Loop through the gifs!
      
      function startParade() {
        player.playVideo();
        // Lets the video start for a brief moment before the GIF cycling is called
        setTimeout(function(){
          imgCycle(0);
          $('#chyron h1').text(paradeTitle);
          $('#wrapper').removeClass('loading');
        },400);
        
      }
      // based on http://stackoverflow.com/a/6051567, minus the jQuery UI stuff
      var gifArr = urlVars.secret.split(',');
      function imgCycle(counter) {
          var bgImg = gifArr[counter];
          var bgCss = "background-image: url("+bgImg+")";
          $('#gif').attr('style',bgCss);
          delete gifArr[counter];
          gifArr.push(bgImg);
          setTimeout(function() {
              imgCycle(counter + 1);
          }, 1242);
      };


// String multiple form fields together

      // via http://stackoverflow.com/a/13830609
      function check(){
          var n = $('#newParade-form input.combine').length;
          $("#numberOfGifs").val(n);
          $('#newParade-form input.combine').each(function(id,elem){
              b = $("#hiddenField").val();
              if(b.length > 0){
                  $("#hiddenField").val( b + ',' + $(this).val() );
              } else {
                  $("#hiddenField").val( $(this).val() );
              }
          });
          $("#newParade-form").submit();
          return false;
      }

// Setup the variable # of GIF form fields

      var newGif,i,numGifs = 0;

      // Function that adds a new GIF field
      function prepGif(newG,count){
        newG = $('#gif_template').clone();
        newG.removeAttr("id").addClass('gif_wrap');
        newG.find('input').removeClass('template').addClass('combine').attr('type','text').attr('name','gif'+(count+1)).attr('id','gif'+(count+1));
        newG.prepend("<label>gif #"+(count+1)+"</label>").fadeIn();
        return newG;
      }

      // On load, add the the initial GIF fields
      for(i=0; i<urlVars.numberOfGifs; i++) {
        newGif = prepGif(newGif,i);
        $('.gif_fields').append(newGif);
        numGifs++;
      }

      // On click, add one additional GIF field
      $('.spawn').click(function(){
        newGif = prepGif(newGif,numGifs);
        $('.gif_fields').append(newGif);
        numGifs++;
        return false;
      });

// Repopulate the text inputs with existing values on each load

      $('input[name="paradeTitle"]').attr('value',tidyParams(urlVars.paradeTitle));
      $('input[name="paradeYoutubeUrl"]').attr('value',urlVars.paradeYoutubeUrl);
      $('input[name="videoStartTime"]').attr('value',videoStartTime);
      var ng = parseInt(urlVars.numberOfGifs);
      for (var i = 0; i < ng; i++) {
        var c = (i+1);
        document.getElementById('gif'+c).value = urlVars["gif"+c];
      }

// YouTube play/pause (for audio sensibility)

      $('#toggle-video').click(function(){
        if ($(this).data('playing') === true) {
          player.pauseVideo();
          $(this)
            .data('playing', false)
            .text('turn audio ON')
            .removeClass('audio-on')
            .addClass('audio-off');
        } else {
          player.playVideo();
          $(this)
            .data('playing', true)
            .text('turn audio OFF')
            .removeClass('audio-off')
            .addClass('audio-on');
        }
        return false;
      });