/**
 * Based on: https://github.com/alexblack/infinite-scroll
 */
(function() {
  var isIE = /msie/gi.test(navigator.userAgent); // http://pipwerks.com/2011/05/18/sniffing-internet-explorer-via-javascript/

  this.infiniteScroll = function(options) {
    var defaults = {
      callback: function() {},
      distance: 50
    };
    // Populate defaults
    for (var key in defaults) {
      if(typeof options[key] == 'undefined') options[key] = defaults[key];
    }

    var scroller = {
      options: options,
      updateInitiated: false
    };

    window.addEventListener('scroll', function() {
      window.requestAnimationFrame(function() {
        handleScroll(scroller);
      });
    });

    // Trigger initial loading
    window.requestAnimationFrame(function() {
      handleScroll(scroller);
    });

    // For touch devices, try to detect scrolling by touching
    document.addEventListener('touchmove', function() {
      window.requestAnimationFrame(function() {
        handleScroll(scroller);
      });
    });
  };

  function getScrollPos() {
    if(isIE) return document.documentElement.scrollTop; // Handle scroll position in case of IE differently
    return window.pageYOffset;
  }

  var prevScrollPos = getScrollPos();

  // Respond to scroll events
  function handleScroll(scroller, event) {
    if(scroller.updateInitiated) return;

    var scrollPos = getScrollPos();
    // if (scrollPos === prevScrollPos) return; // nothing to do

    // Find the pageHeight and clientHeight(the no. of pixels to scroll to make the scrollbar reach max pos)
    var pageHeight = document.documentElement.scrollHeight;
    var clientHeight = document.documentElement.clientHeight;

    // Check if scroll bar position is just distance above the max, if yes, initiate an update
    if (pageHeight - (scrollPos + clientHeight) < scroller.options.distance) {
      scroller.updateInitiated = true;

      scroller.options.callback(function() {
        scroller.updateInitiated = false;
      });
    }

    prevScrollPos = scrollPos;
  }
}());
