(function(){
  function sortDrupalBehaviors() {
    var weights = {};
    for (var k in Drupal.behaviors) {
      var v = Drupal.behaviors[k];
      var pieces = k.split('.');
      if (pieces.length == 2 && pieces[1] === 'weight') {
        // This v is not a behavior, but a weight setting for another behavior.
        weights[pieces[0]] = v;
        delete Drupal.behaviors[k];
      }
      else if (typeof weights[k] != 'number') {
        // This v is a behavior object, but it might contain a weight setting.
        if (typeof v == 'object' && v && typeof v.weight == 'number') {
          weights[k] = v.weight;
        }
        else if (weights[k] == undefined) {
          weights[k] = false;
        }
      }
    }

    var ww = [0];
    var by_weight = {0: {}};
    for (var k in weights) {
      if (Drupal.behaviors[k] == undefined) {
        continue;
      }
      var w = weights[k];
      w = (typeof w == 'number') ? w : 0;
      if (by_weight[w] == undefined) {
        by_weight[w] = {};
        ww.push(w);
      }
      by_weight[w][k] = Drupal.behaviors[k];
    }
    ww.sort(function(a,b){return a - b;});

    // Other scripts that want to mess with behaviors, will only see those with weight = 0.
    Drupal.behaviors = by_weight[0];

    var sorted = [];
    for (var i = 0; i < ww.length; ++i) {
      var w = ww[i];
      sorted.push(by_weight[w]);
    }
    return sorted;
  }

  var attachBehaviors_original = Drupal.attachBehaviors;

  Drupal.attachBehaviors = function(context, settings) {
    var sorted = sortDrupalBehaviors();
    Drupal.attachBehaviors = function(context, settings) {
      context = context || document;
      settings = settings || Drupal.settings;
      // Execute all of them.
      for (var i = 0; i < sorted.length; ++i) {
        jQuery.each(sorted[i], function() {
          if (typeof this.attach == 'function') {
            this.attach(context, settings);
          }
        });
      }
    }
    Drupal.attachBehaviors.apply(this, [context, settings]);
  };

})();

;
(function ($) {

  Drupal.kidneys_js = Drupal.kidneys_js || {};

  Drupal.kidneys_js.gaTrack = function(obj, target) {
    if(typeof ga !== 'function') return;

    try {
      if (obj.hitType == 'event') {
        // Add the current page to the label, makes reporting easier.
        obj.eventLabel = 'page:' + window.location.pathname + ' | ' + obj.eventLabel;

        // If we promo, add the id for reporting.
        var promo1 = Drupal.kidneys_js.getUrlParameter('promo');
        var promo2 = $(target).attr('href') ? Drupal.kidneys_js.getUrlParameter('promo', $(target).attr('href')) : undefined;

        if (promo1 || promo2) {
          obj.eventLabel = obj.eventLabel + ' | ' + 'promo:' + (promo2 || promo1);
        }
        // If we have  contact, add the id for reporting.
        if (Drupal.settings.kidneys_js.contact_id) {
          obj.eventLabel = obj.eventLabel + ' | ' + 'contact:' + Drupal.settings.kidneys_js.contact_id;
        }
      }
      ga('send', obj);
    } catch (e) {}
  };
  window.gaTrack = Drupal.kidneys_js.gaTrack;

  Drupal.kidneys_js.getUrlParameter = function(param, url) {
    url = url || window.location.href;

    var part2 = url.split('#')[0].split('?')[1],
        params = part2 ? part2.split('&') : false;

    for (i = 0; i < params.length; i++) {
      eParam = params[i].split('=');
      if (eParam[0] === param) {
        return decodeURIComponent(eParam[1]);
      }
    }
    return undefined;
  }
  // For legacy support consider setting to global.
  // First clean up other js code.
  //window.getUrlParameter = Drupal.kidneys_js.getUrlParameter;

  Drupal.kidneys_js.setUrlParameter = function(param, val, url) {
    param = encodeURIComponent(param);
    url = url || window.location.href;

    var part1 = url.split('#')[0].split('?')[0],
        part2 = url.split('#')[0].split('?')[1],
        anchor = url.split('#')[1],
        params = part2 ? part2.split('&') : [],
        set = false;

    // Update existing param, if we find it.
    for (i = 0; i < params.length; i++) {
      eParam = params[i].split('=');
      if (eParam[0] === param) {
        if (val) {
          params[i] = eParam[0] + '=' + encodeURIComponent(val);
        } else {
          // Remove parameter if no value.
          params.splice(i, 1);
        }
        set = true;
      }
    }
    if (!set && val) {
      params.push(param + '=' + val)
    }
    return part1 + (params.length > 0 ? '?' + params.join('&') : '') + (anchor ? '#' + anchor : '');
  }

  Drupal.kidneys_js.buildGaEventObject = function(obj, el) {
    // Set up default object.
    var url,
        val
        name;
    // Assume we can get a url from 'href' or 'src' property.
    url = $(el).attr('href') || $(el).attr('src') ;
    // Hack for youtube urls.
    if (url && url.includes('youtube'))
      url = decodeURIComponent(url).replace(/&amp;/g, '&')

    // Loop through event properties and set values
    $.each(['category', 'action', 'label'], function(i,v){
      name = 'event' + v.charAt(0).toUpperCase() + v.slice(1);
      // Get value from href or from data attributes.
      val = Drupal.kidneys_js.getUrlParameter(v, url) || $(el).data(v);
      obj[name] = val || obj[name];
    });
    return obj;
  }

  // Youtube video.
  Drupal.kidneys_js.youtubeIds = [];
  // If we have videos then register event callbacks for video actions.
  // Module code should handle loading the youtube api code.
  window.player = [];
  window.onYouTubeIframeAPIReady = function() {
    $('iframe[src*="youtube.com"]')
      .filter('iframe[src*="custom-event"], iframe[custom-event]')
      .once('custom-event').each(function(k,v) {
        // Set ID attribute on iFrame for later use.

        var id = 'youtube-' + (Drupal.kidneys_js.youtubeIds.length + k);
        $(this).attr('id', id);
        // Keep track of these ids.
        Drupal.kidneys_js.youtubeIds.push(id);
        // Add new property to url, needed for youtube api.
        var url = $(this).attr("src");
        $(this).attr("src", url + "&enablejsapi=1");
        var videoId = url.split('?')[0].split('https://www.kidney.org/').pop();

        window.player[id] = new YT.Player( v, {
          events: { 'onStateChange': window.onPlayerStateChange }
        });
        // Send GA event for all videos on a page.
        // This will set baseline for data analysis.
        var obj = {
          hitType: 'event',
          eventCategory: 'video',
          eventAction: 'loaded',
          eventLabel: 'video_id:' + videoId,
          transport: 'beacon',
          nonInteraction: true
        };

        obj = Drupal.kidneys_js.buildGaEventObject(obj, v);
        Drupal.kidneys_js.gaTrack(obj, v);
    });
  }
  // For some reason this needs to hang of window.
  window.onPlayerStateChange = function(e) {
    // Send event to GA.
    var videoData = e.target.getVideoData();
    var duration = e.target.getDuration();
    var currentTime = e.target.getCurrentTime();
    var obj = {
      hitType: 'event',
      eventCategory: 'video',
      eventLabel: 'video_id:' + videoData.video_id,
      transport: 'beacon'
    };

    obj = Drupal.kidneys_js.buildGaEventObject(obj, e.target.h);

    switch(e.data) {
      case YT.PlayerState.PLAYING:
        obj.eventAction = 'started';
        break;
      case YT.PlayerState.PAUSED:
        obj.eventAction = 'paused';
        obj.eventLabel += ' | percent:' + Math.floor(100 * currentTime / duration);
        break;
      case YT.PlayerState.ENDED:
        obj.eventAction = 'ended';
        break;
      default:
        return;
    }
    if (obj.eventAction) {
      Drupal.kidneys_js.gaTrack(obj, e.target.h);
    }
  }

  Drupal.behaviors.kidneys_js = {
    attach: function(context, settings) {

      // Copy promo value to select href.
      $('a[href*="append-promo"], a[append-promo]').once('append-promo').each(function() {
        var href = $(this).attr('href'),
            promo = Drupal.kidneys_js.getUrlParameter('promo');

        href = Drupal.kidneys_js.setUrlParameter('promo', promo, href);
        // Unset 'append-promo' param.
        href = Drupal.kidneys_js.setUrlParameter('append-promo', '', href);
        $(this).attr('href', href);
      });

      // Register any custom GA events on links.
      // Either of these formats will work:
      // <a href="https://domain.org?custom-event&category=c&action=a&label=l">link</a>
      // <a href="https://domain.org" custom-event data-category=c data-action=a data-label=l">link</a>

      //move description to right udner the label
      if (window.location.href.indexOf("edit") != -1) {
        const moveArray = ['form-item-field-blog-category-und', 'form-item-field-primary-blog-category-und'];
        moveArray.forEach(function(element){
          $('div.' + element).prepend($('div.'  + element + ' > .description')).prepend($('div.'  + element + ' > label'));
          }
        )
      }

      $('a[href*="custom-event"], a[custom-event]').once('custom-event').each(function() {
        var target = this;
        $(this).click(function(e){
          // Set up default object.
          var obj = {
                hitType: 'event',
                eventCategory: 'custom',
                eventAction: 'click',
                eventLabel: '',
                transport: 'beacon',
                nonInteraction: true
              };

          obj = Drupal.kidneys_js.buildGaEventObject(obj, target);
          Drupal.kidneys_js.gaTrack(obj, target);

        });

      });

    }
  }
})(jQuery);
;
// Callback for reCAPTCHA.
function kidneys_misc_recaptcha_callback() {
  jQuery('.g-recaptcha').addClass('recaptcha-success');
}

// From https://stackoverflow.com/questions/19491336/how-to-get-url-parameter-using-jquery-or-plain-javascript
function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};


(function ($, Drupal) {
  Drupal.kidneys_misc = Drupal.kidneys_misc || {};
  Drupal.kidneys_misc.getCategories = function(stringify) {
    stringify = stringify || false;
    var c = $.cookie('categories') || '{}';
    c = JSON.parse(c);
    if (c[undefined]) {
      delete c[undefined];
    }
    return stringify ? JSON.stringify(c) : c;
  }
  Drupal.kidneys_misc.addCategory = function(c, w) {
    var cs = Drupal.kidneys_misc.getCategories(false);
    if (c) { {
      cs[c] = +cs[c] ? cs[c] + (w / cs[c]) : w || 1;
    }}
    $.cookie('categories', JSON.stringify(cs), { path: '/' });
  }
  Drupal.kidneys_misc.addCategories = function(newCs) {
    if (typeof newCs === 'string') {
      newCs = JSON.parse(newCs);
    }
    $.each(newCs, function(i,v){
      Drupal.kidneys_misc.addCategory(i,v);
    });
  }

  Drupal.kidneys_misc.sticky_nav = function() {
    var o = {
      hasScrolled: false,
      hasResized: false,
      nav: $('.sticky-nav'),
      nav_sections: $('.nav-section'),
      onScroll: function() { o.hasScrolled = true; },
      onResize: function() { o.hasResized = true; },
      checkScroll: function() {
        if (o.hasScrolled) {
          o.hasScrolled = false;
          o.orientNav();
        }
      },
      checkResize: function() {
        if (o.hasResized) {
          o.hasResized = false;
          o.orientNav();
        }
      },
      orientNav: function() {
        var window_top = $(window).scrollTop();
        o.setNavPosition(window_top);
        o.setNavActiveItem(window_top);
      },
      setNavPosition: function(window_top) {
        if (window_top > o.nav_top) {
          if(!o.nav.hasClass('position--fixed')) {
            o.nav.addClass('position--fixed');
            o.nav.removeClass('position--relative');
            $('.nav-sub').removeClass('hide');
            $('.label', o.nav).addClass('bg--white--o40');
          }
        } else {
          if(o.nav.hasClass('position--fixed')) {
            o.nav.removeClass('position--fixed');
            o.nav.addClass('position--relative');
            $('.nav-sub').addClass('hide');
            $('.label', o.nav).removeClass('bg--white--o40');
          }
        }
      },
      setNavActiveItem: function(window_top) {
        o.nav_sections.each(function(i,v) {
          var s = $(v);
          var t = s.offset().top;
          var b = t + $(v).outerHeight();
          var j;
          if (window_top > (t - 50) && window_top < b) {
            $('a', o.nav).removeClass('bold');
            j = $('.nav-anchor', v).attr('id');
            o.nav.find('a[href="#' + j + '"]').addClass('bold');
          }
        });
      },
      init: function() {
        if (o.nav.length > 0) {
          o.nav_top = o.nav.offset().top;
          $(window).scroll(o.onScroll);
          $(window).resize(o.onResize);
          window.setInterval(o.checkScroll, 50);
          window.setInterval(o.checkResize, 50);
        }
      }
    }
    return o;
  }

  Drupal.behaviors.nkf_misc = {
    attach: function(context, settings) {
      $('body').once(Drupal.kidneys_misc.sticky_nav().init());
      if (Drupal.settings.kidneys_categories && !Drupal.settings.kidneys_categories_processed) {
        Drupal.kidneys_misc.addCategories(Drupal.settings.kidneys_categories);
        Drupal.settings.kidneys_categories_processed = true;
      }
      var query = Drupal.kidneys_misc.getCategories(true);
      $(".promotion").each(function() {
        $(this).once(function() {
          var base = $(this).attr('id');
          var element_settings = {
            url: settings.basePath + settings.pathPrefix + 'nkf-promotion?display=' + $(this).data('promo') + '&query=' + query + '&calling_q=' + Drupal.settings.calling_q,
            event: 'fetch',
            progress: {
              type: 'none'
            }
          };
          Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);
          $(this).trigger('fetch');
        });
        $(this).once().click(function(){
          var obj = {
            hitType: 'event',
            eventCategory: 'promo',
            eventAction: $(this).data('promo') ? $(this).data('promo') : '',
            eventLabel: $('>div',this).data('promo-name') ? $('>div',this).data('promo-name') : '',
            eventValue: $('>div',this).data('id') ? $('>div', this).data('id') : '',
            transport: 'beacon'
          };
          try {
            ga('send', obj);
          } catch (e) {}
        });
      });
      if ($('.modal-watertree').length) {
        // utility for watertree modal selection.
        $('.modal-watertree').magnificPopup({
          type: 'inline',
          midClick: true
        });
      }

      // This code will set any form field values with these url parameter values,
      // and store value in cookie for 15 days.
      var paramsToTrack = ['promo', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
      $.each(paramsToTrack, function(i,v) {
        var pv = getUrlParameter(v);

        if(pv) {
          $.cookie(v, pv, { path: '/', expires: 15});
        }
        var f = $('.field-name-field-' + v.replace('_','-'));
        // Handle special promo case.
        if (v == 'promo') {
          f = $('.field-name-field-' + v.replace('_','-') + '-code');
        }
        if(f.length > 0) {
          $('input', f).val($.cookie(v));
        }
      });

      // Send events to GA for entityform abandoment tracking.
      if(typeof ga === 'function') {
        ga(function(tracker) {
          $('form.entityform').once(function(){
            var v = getUrlParameter('version') ?  '-' + getUrlParameter('version') : '';
            var ef = $(this).attr('id').split('-entityform-')[0] + v;
            var obj = {
              hitType: 'event',
              eventCategory: 'form',
              eventAction: 'init',
              eventLabel: ef,
              transport: 'beacon'
            };
            ga('send',obj);
            $('input', this).on('change', function(){
              var wr = $(this).closest('.form-wrapper');
              // Don't send two events for same field.
              if(wr.hasClass('ga-event-processed')) return;
              wr.addClass('ga-event-processed');
              var fi = wr.attr('id').replace('edit-','');
              obj = {
                hitType: 'event',
                eventCategory: 'form',
                eventAction: 'change',
                eventLabel: ef + ': ' + fi,
                transport: 'beacon'
              };
              ga('send',obj);
            });
          });
        });
      }


    }
  }
  // jQuery function to trigger a email signup event.
  $.fn.kidneys_misc_email_signup = function() {
    $(document).trigger('email_signup');
  };


})(jQuery, Drupal);
;
(function ($) {

Drupal.googleanalytics = {};

$(document).ready(function() {

  // Attach mousedown, keyup, touchstart events to document only and catch
  // clicks on all elements.
  $(document.body).bind("mousedown keyup touchstart", function(event) {

    // Catch the closest surrounding link of a clicked element.
    $(event.target).closest("a,area").each(function() {

      // Is the clicked URL internal?
      if (Drupal.googleanalytics.isInternal(this.href)) {
        // Skip 'click' tracking, if custom tracking events are bound.
        if ($(this).is('.colorbox') && (Drupal.settings.googleanalytics.trackColorbox)) {
          // Do nothing here. The custom event will handle all tracking.
          //console.info("Click on .colorbox item has been detected.");
        }
        // Is download tracking activated and the file extension configured for download tracking?
        else if (Drupal.settings.googleanalytics.trackDownload && Drupal.googleanalytics.isDownload(this.href)) {
          // Download link clicked.
          ga("send", {
            "hitType": "event",
            "eventCategory": "Downloads",
            "eventAction": Drupal.googleanalytics.getDownloadExtension(this.href).toUpperCase(),
            "eventLabel": Drupal.googleanalytics.getPageUrl(this.href),
            "transport": "beacon"
          });
        }
        else if (Drupal.googleanalytics.isInternalSpecial(this.href)) {
          // Keep the internal URL for Google Analytics website overlay intact.
          ga("send", {
            "hitType": "pageview",
            "page": Drupal.googleanalytics.getPageUrl(this.href),
            "transport": "beacon"
          });
        }
      }
      else {
        if (Drupal.settings.googleanalytics.trackMailto && $(this).is("a[href^='mailto:'],area[href^='mailto:']")) {
          // Mailto link clicked.
          ga("send", {
            "hitType": "event",
            "eventCategory": "Mails",
            "eventAction": "Click",
            "eventLabel": this.href.substring(7),
            "transport": "beacon"
          });
        }
        else if (Drupal.settings.googleanalytics.trackOutbound && this.href.match(/^\w+:\/\//i)) {
          if (Drupal.settings.googleanalytics.trackDomainMode !== 2 || (Drupal.settings.googleanalytics.trackDomainMode === 2 && !Drupal.googleanalytics.isCrossDomain(this.hostname, Drupal.settings.googleanalytics.trackCrossDomains))) {
            // External link clicked / No top-level cross domain clicked.
            ga("send", {
              "hitType": "event",
              "eventCategory": "Outbound links",
              "eventAction": "Click",
              "eventLabel": this.href,
              "transport": "beacon"
            });
          }
        }
      }
    });
  });

  // Track hash changes as unique pageviews, if this option has been enabled.
  if (Drupal.settings.googleanalytics.trackUrlFragments) {
    window.onhashchange = function() {
      ga("send", {
        "hitType": "pageview",
        "page": location.pathname + location.search + location.hash
      });
    };
  }

  // Colorbox: This event triggers when the transition has completed and the
  // newly loaded content has been revealed.
  if (Drupal.settings.googleanalytics.trackColorbox) {
    $(document).bind("cbox_complete", function () {
      var href = $.colorbox.element().attr("href");
      if (href) {
        ga("send", {
          "hitType": "pageview",
          "page": Drupal.googleanalytics.getPageUrl(href)
        });
      }
    });
  }

});

/**
 * Check whether the hostname is part of the cross domains or not.
 *
 * @param string hostname
 *   The hostname of the clicked URL.
 * @param array crossDomains
 *   All cross domain hostnames as JS array.
 *
 * @return boolean
 */
Drupal.googleanalytics.isCrossDomain = function (hostname, crossDomains) {
  /**
   * jQuery < 1.6.3 bug: $.inArray crushes IE6 and Chrome if second argument is
   * `null` or `undefined`, https://bugs.jquery.com/ticket/10076,
   * https://github.com/jquery/jquery/commit/a839af034db2bd934e4d4fa6758a3fed8de74174
   *
   * @todo: Remove/Refactor in D8
   */
  if (!crossDomains) {
    return false;
  }
  else {
    return $.inArray(hostname, crossDomains) > -1 ? true : false;
  }
};

/**
 * Check whether this is a download URL or not.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isDownload = function (url) {
  var isDownload = new RegExp("\\.(" + Drupal.settings.googleanalytics.trackDownloadExtensions + ")([\?#].*)?$", "i");
  return isDownload.test(url);
};

/**
 * Check whether this is an absolute internal URL or not.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isInternal = function (url) {
  var isInternal = new RegExp("^(https?):\/\/" + window.location.host, "i");
  return isInternal.test(url);
};

/**
 * Check whether this is a special URL or not.
 *
 * URL types:
 *  - gotwo.module /go/* links.
 *
 * @param string url
 *   The web url to check.
 *
 * @return boolean
 */
Drupal.googleanalytics.isInternalSpecial = function (url) {
  var isInternalSpecial = new RegExp("(\/go\/.*)$", "i");
  return isInternalSpecial.test(url);
};

/**
 * Extract the relative internal URL from an absolute internal URL.
 *
 * Examples:
 * - https://mydomain.com/node/1 -> /node/1
 * - https://example.com/foo/bar -> https://example.com/foo/bar
 *
 * @param string url
 *   The web url to check.
 *
 * @return string
 *   Internal website URL
 */
Drupal.googleanalytics.getPageUrl = function (url) {
  var extractInternalUrl = new RegExp("^(https?):\/\/" + window.location.host, "i");
  return url.replace(extractInternalUrl, '');
};

/**
 * Extract the download file extension from the URL.
 *
 * @param string url
 *   The web url to check.
 *
 * @return string
 *   The file extension of the passed url. e.g. "zip", "txt"
 */
Drupal.googleanalytics.getDownloadExtension = function (url) {
  var extractDownloadextension = new RegExp("\\.(" + Drupal.settings.googleanalytics.trackDownloadExtensions + ")([\?#].*)?$", "i");
  var extension = extractDownloadextension.exec(url);
  return (extension === null) ? '' : extension[1];
};

})(jQuery);
;
