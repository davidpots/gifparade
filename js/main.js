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
      var defaultGifDuration = "1.2";
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

      // Setup for VANILLA visit (with no paramaters)
      // THIS NEEDS MAJOR WORK -- so inefficient and unnecessarily long. 
      // ------------------------------------------------------------------------
      
      // Check to see if LEGACY parade. If so, need to map some values.
      if (urlVars.gif1 != undefined) { // is legacy!
        for (var y = 0; y < parseInt(urlVars.numberOfGifs); y++) {
          urlVars["gifUrl"+[y+1]] = urlVars["gif"+[y+1]];
          urlVars["gifDuration"+[y+1]] = defaultGifDuration;
        }
      }
      if (urlVars.secret != undefined) { // is legacy!
        for (var y = 0; y < parseInt(urlVars.numberOfGifs); y++) {
          if (urlVars.secretUrls == undefined) {
            urlVars.secretUrls = urlVars["gif"+[y+1]];  
          } else {
            urlVars.secretUrls = urlVars.secretUrls + "," + urlVars["gif"+[y+1]];
          }
        }
      }


      // Commence with checking to see if vanilla/default OR if custom
      if (urlVars.gifUrl1 == undefined) {
        urlVars.gifUrl1 = defaultGif1;
      }
      if (urlVars.gifUrl2 == undefined) {
        urlVars.gifUrl2 = defaultGif2;
      }
      if (urlVars.gifUrl3 == undefined) {
        urlVars.gifUrl3 = defaultGif3;
      }
      if (urlVars.gifDuration1 == undefined) {
        urlVars.gifDuration1 = defaultGifDuration;
      }
      if (urlVars.gifDuration2 == undefined) {
        urlVars.gifDuration2 = defaultGifDuration;
      }
      if (urlVars.gifDuration3 == undefined) {
        urlVars.gifDuration3 = defaultGifDuration;
      }
      if (urlVars.secretUrls == undefined) {
        urlVars.secretUrls = defaultGif1+","+defaultGif2+","+defaultGif3;
      }
      if (urlVars.secretDurations == undefined) {
        urlVars.secretDurations = defaultGifDuration+","+defaultGifDuration+","+defaultGifDuration;
      }

      if (urlVars.numberOfGifs == undefined) {
        urlVars.numberOfGifs = 3;
      }      

      // Sets up the array for the duration of each gif. If not provided, it defaults to the default
      var durations = urlVars.secretDurations.split(',');
      for (var d = 0; d < durations.length; d++) {
        durations[d] = parseFloat(durations[d]) * 1000 || (parseFloat(defaultGifDuration)*1000);
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
      var gifArr = urlVars.secretUrls.split(',');
      function imgCycle(counter) {
          var bgImg = gifArr[counter];
          var bgDur = durations[counter];
          var bgCss = "background-image: url("+bgImg+")";
          $('#gif').attr('style',bgCss);
          delete gifArr[counter];
          delete durations[counter];
          gifArr.push(bgImg);
          durations.push(bgDur);
          setTimeout(function() {
              imgCycle(counter + 1);
          }, bgDur);
      };


// String multiple form fields together

      // via http://stackoverflow.com/a/13830609
      function check(){
          var n = $('#newParade-form input.combineUrl').length;
          $("#numberOfGifs").val(n);

          // Combine the GIF urls
          $('#newParade-form input.combineUrl').each(function(id,elem){
              b = $("#hiddenUrls").val();
              if(b.length > 0){
                  $("#hiddenUrls").val( b + ',' + $(this).val() );
              } else {
                  $("#hiddenUrls").val( $(this).val() );
              }
          });

          // Combine the GIF durations
          $('#newParade-form input.combineDuration').each(function(id,elem){
              b = $("#hiddenDurations").val();
              if(b.length > 0){
                  $("#hiddenDurations").val( b + ',' + $(this).val() );
              } else {
                  $("#hiddenDurations").val( $(this).val() );
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
        newG.find('input').removeClass('template').attr('type','text');
        newG.find('input.gifUrl').attr('name','gifUrl'+(count+1)).attr('id','gifUrl'+(count+1)).addClass('combineUrl');
        newG.find('input.gifDuration').attr('name','gifDuration'+(count+1)).attr('id','gifDuration'+(count+1)).addClass('combineDuration');
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
        document.getElementById('gifUrl'+c).value = urlVars["gifUrl"+c];
        document.getElementById('gifDuration'+c).value = urlVars["gifDuration"+c];
      }

// YouTube play/pause (for audio sensibility)

      $('#toggle-audio a').click(function(){
        if ($(this).parent().data('playing') === true) {
          player.pauseVideo();
          $(this)
            .text('turn audio ON')
            .parent().data('playing', false)
                     .removeClass('audio-on')
                     .addClass('audio-off')
        } else {
          player.playVideo();
          $(this)
            .text('turn audio OFF')
            .parent().data('playing', true)
                     .removeClass('audio-off')
                     .addClass('audio-on')
        }
        return false;
      });

// Bitly API Short URL Stuff

            var loudgif_url = 'http://davidpots.com/gifparade/' + location.search;

            $.getJSON(
                "https://api-ssl.bitly.com/v3/shorten?callback=?",
                {
                    "format": "json",
                    "access_token": 'c59a956538c4c6468c8aafcd5cb1dae381fb5833',
                    "longUrl": loudgif_url
                },
                function(response)
                {
                    var bitlyUrl = response.data.url;
                    console.log(response);
                    console.log(bitlyUrl);
                    $('#get-short-url a').click(function(){
                      $(this).parent().hide();
                      $('#copy-short-url span').text(bitlyUrl);
                      $('#copy-short-url').show();
                      return false;
                    });
                    $('#copy_url').click(function(){
                      return false;
                    });
                }
            );

// Copy to Clipboard plugin
            
            ZeroClipboard.setDefaults( {
                moviePath: 'ZeroClipboard.swf',
                hoverClass: 'copy-is-hover',
                activeClass: 'copy-is-active'
            });

            var clip = new ZeroClipboard($("#copy_url"));

            clip.on( 'complete', function(client, args) {
                $('#copy_url').text('COPIED!').removeClass('pre-copy').addClass('post-copy');
            } );