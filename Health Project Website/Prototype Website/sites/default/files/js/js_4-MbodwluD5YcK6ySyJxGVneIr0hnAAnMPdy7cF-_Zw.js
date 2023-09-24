var nephron_init = function ($) {

  // utility function to toggle classes on click
  // useful for toggling visibility
  $('[data-toggle=class]').once('classToggle').click(function (e) {
    //$(this).addClass('processed');
    var targets = $(this).attr('data-target').split('|');
    var classes = $(this).attr('data-class').split('|');
    $(targets).each(function (i, v) {
      $(v).toggleClass(classes[i]);
    })
    e.preventDefault();
  });
  // Hover version of toggle class.
  $('[data-toggle=hover-class]').once('classToggle').hover(function (e) {
    //$(this).addClass('processed');
    var targets = $(this).attr('data-target').split('|');
    var classes = $(this).attr('data-class').split('|');
    $(targets).each(function (i, v) {
      $(v).toggleClass(classes[i]);
    })
    e.preventDefault();
  });

  /*
  $('body').once('accordion-hash', function(){
    var accordHash = window.location.hash.slice(1).split('|');
    for (var i of accordHash){
      if (i.length > 0) {
        $('#' + i +' a').trigger('click');
      }
    }
  });
  */
  // utility for general slider selection
  if ($.fn.slick !== undefined) {
    $('.slider:not(.processed), .slick:not(.processed)').slick({
      infinite: true,
      speed: 300,
      slidesToShow: 1,
      variableWidth: true,
      swipeToSlide: true,
      touchThreshold: 8,
      prevArrow: '<a href="#" class="slider-button-left"><i class="icon-left-open"></i></a>',
      nextArrow: '<a href="#" class="slider-button-right"><i class="icon-right-open"></i></a>'
    }).addClass('processed');
    $('.slider-single:not(.processed)').slick({
      infinite: true,
      speed: 300,
      slidesToShow: 1,
      swipeToSlide: true,
      touchThreshold: 8,
      prevArrow: '<a href="#" class="slider-button-left"><i class="icon-left-open"></i></a>',
      nextArrow: '<a href="#" class="slider-button-right"><i class="icon-right-open"></i></a>'
    }).addClass('processed');
    $('.tabbed-slider--container:not(.processed)').each(function () {
      $(this).addClass('processed');
      var slider = $('.tabbed-slider--slider', this);
      $('.tabbed-slider--nav > *', this).each(function (i) {
        $(this).click(function (e) {
          e.preventDefault();
          slider.slick('slickGoTo', i);
          return false;
        })
      });
      slider.slick({
        speed: 300,
        slidesToShow: 1,
        arrows: false,
        swipe: false,
        adaptiveHeight: true
      });
    });
  }

  // utility for general modal selection
  $('.modal-trigger').magnificPopup({
    type: 'inline',
    midClick: true,
    focus: 'input'
  });

  // utility for general modal selection
  $('.modal-open').each(function () {
    if ($(this).data('trigger')) {
      // TODO: write code to trigger modal on other events.
    } else {
      if ($.cookie('facePunch') != 1) {
        $.cookie('facePunch', 1, {expires: 1, path: '/'});
        $.magnificPopup.open({
          items: {
            src: '.modal-open',
            type: 'inline'
          }
        });
      }
    }
  });


  // utility for general modal selection
  $('.modal-gallery').each(function () {
    $(this).magnificPopup({
      delegate: 'a',
      type: 'image',
      gallery: {
        enabled: true
      }
    });
  });
  $(".iframe-dynamic-height").load(function () {
    //console.log($(this);
    //console.log($(this).contents().find("html").height());
    //$(this).height( $(this).contents().find("html").height() );
  });
  $(window).on("message", function (e) {
    var data = e.originalEvent.data;
    if (data.height) {

    }
  });

  function popup(href) {
    var width = 550;
    var height = 420
    var left = Math.round((screen.width / 2) - (width / 2));
    var top = 0;
    if (screen.height > height) {
      top = Math.round((width / 2) - (height / 2));
    }
    var str = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes,width=' + width + ',height=' + height + ',left=' + left + ',top=' + top;
    window.open(href, 'intent', str);
  }

  // general print utility
  $('.js--print-link').once().on('click', function () {
    window.print();
    return false;
  });

  $('.js--share-link').once().on('click', function (e) {
    e.preventDefault();
    popup(this.href);
  });
  $('.js--hide').once().addClass('hide');


  // animation utilities
  $.fn.animationEnd = function (callback) {
    this.on("animationend webkitAnimationEnd mozAnimationEnd MSAnimationEnd oAnimationEnd", function () {
      callback.call(this);
    });
    return this;
  };
  $.fn.animationClass = function (animationClass, callback) {
    this.on("animationend webkitAnimationEnd mozAnimationEnd MSAnimationEnd oAnimationEnd", function () {
      $(this).removeClass(animationClass);
      if (callback) {
        callback.call(this);
      }
    });
    this.addClass(animationClass);
    return this;
  };

  var footerCookieName = 'FooterDismissed';
  var footerCookieValue = 'true';

  $("#sticky-footer--container").addClass("expanded");

  function getDrawerPreference() {
    var cookieValue = $.cookie(footerCookieName);

    if (cookieValue === footerCookieValue) {
      $("#sticky-footer--container").removeClass("expanded");
      $("#sticky-footer--container").addClass("collapsed");
    } else {
      $("#sticky-footer--container").addClass("expanded");
    }
  }

  getDrawerPreference();

  function setDrawerPreference() {
    $.cookie(footerCookieName, footerCookieValue, {expires: 30, path: '/'});
  }

  $(".collapser").click(function (e) {
    $("#sticky-footer--container").removeClass("expanded");
    $("#sticky-footer--container").addClass("collapsed");
    e.preventDefault();
    setDrawerPreference();
  });
};


jQuery('document').ready(nephron_init(jQuery));
;
var fivestar_init = async function ($) {

  // Add feedback to the FiveStar widget voting.
  async function placeVotingWidet() {
    // See if the screen is mobile
    if ($('.mobile-content-helpful-widget').is(":visible")) {
      //console.log("mobile");

      // Make sure it isn't already appended.
      if (!$('#theVotingField #mobileVote').length) {
        $('#theVotingField').detach().appendTo('#mobileVote');
      }

    } else {
      // console.log("desktop");

      // Make sure it isn't already appended.
      if (!$('#theVotingField #desktopVote').length) {
        $('#theVotingField').appendTo('#desktopVote');
      }
    }
  }

  // Place the voting form based on screen size.
  placeVotingWidet();

  // Handle the screen resizing
  $(window).resize(async function () {
    placeVotingWidet();

  });


  var voting = $('.nkf-voting');
  var voted = $('.nkf-voted');

  $(document).on('click', '.fivestar-form-item .star', async function () {
    //console.log("clicked");
    voting.show();
    waitForVote();
  });

  async function waitForVote() {
    // ajaxStop
    $(document).ajaxStop(async function () {
      // console.log("it stopped");
      voting.hide();
      voted.show();
      setTimeout(thanksForVote, 3000);
    });
  }

  async function thanksForVote() {
    voted.hide();
  }
};


jQuery('document').ready(fivestar_init(jQuery));
;
(function ($, Drupal) {
  var donationProcessed = false;
  var inited = false;
  Drupal.behaviors.nephron = {
    attach: function(context, settings) {
      nephron_init($);
      fivestar_init($);
      // flip password strength indicator
      $('.password-field').after($('.password-strength'));
      $('input.password-confirm').after($('div.password-confirm'));

      $('.discount__apply').once().click(function(){
        //$(this).prop('value', '')
        $(this).html('<i class="icon-smile display--inline-block animate--spin"></i>');
        $('.discount__apply-alt').trigger('change');
        return false;
      });
      //
      $('.discount__reset').once().click(function(){
        $('.field-name-field-membership-discount-code input').attr('value', '');
        $('.discount__apply-alt').trigger('change');
        return false;
      });

      $('[data-track="event"]').once('googleEvent').click(function(){
        var obj = {
          hitType: 'event',
          eventCategory: $(this).data('category') ? $(this).data('category') : '',
          eventAction: $(this).data('action') ? $(this).data('action') : '',
          eventLabel: $(this).data('label') ? $(this).data('label') : '',
          transport: 'beacon',
          nonInteraction: true
        };
        gaTrack(obj);
      });

      $('[data-track="social"]').once('googleSocial').click(function(){
        var obj = {
          hitType: 'social',
          socialNetwork: $(this).data('network') ? $(this).data('network') : '',
          socialAction: $(this).data('action') ? $(this).data('action') : '',
          socialTarget: $(this).data('target') ? $(this).data('target') : '',
          transport: 'beacon',
          nonInteraction: true
        };
        gaTrack(obj);
      });

      // Add GA events for select components.
      // Would be better to make this generic and define selector in template file.
      var ga_compnents = [
        'landing_page_header',
        'card',
        'gallery_card_image',
        'gallery_card_text',
        'icon_card',
        'large_card',
        'status_card',
        'email_capture',
        'gallery_item',
        'article_preview',
        'news_preview',
        'promo_banner',
        'kidney_cars_promo',
        'nkf_cares_promo',
        'nkf_peers_promo',
        'nkf_peers_promo',
        'link_callout',
        'bio_pages',
        'detail_article_header_icon',
        'toggle'
      ];
      $(ga_compnents).each(function(i,name){
        $('a', '.' + name).once('googleEvent').click(function(e){
          var a = $(this);
          var component = a.closest('.' + name);
          var s = $('h1,h2,h3', component).first().text().trim().toLowerCase().replace(/[^a-z0-9]/g,'-');
          var l = a.text().trim().toLowerCase().replace(/[^a-z0-9]/g,'-');
          var p = new URL(a.prop('href'));
          p = window.location.hostname != p.hostname ? p.hostname + p.pathname : p.pathname;
          var obj = {
            hitType: 'event',
            eventCategory: name,
            eventAction: 'click',
            eventLabel: 'section:' + s + ' | label:' + l + ' | path:' + p,
            transport: 'beacon',
            nonInteraction: true
          };
          gaTrack(obj);
        });
      });

      // Track scroll depth.
      if (!inited && false) {
        var scrollPercents = scrollPercents || {25:0,50:0,75:0,100:0};
        // Only track for pages over a certain height.
        if ($(document).height() - $('footer').height() > 1000) {
          $(document).scroll(function(){
            var s = $(window).scrollTop(),
                d = $(document).height(),
                c = $(window).height(),
                f = $('footer').height();

            var scrollPercent = (s / (d - c - f)) * 100;
            $.each(scrollPercents, function(k,v){
              if(!v && parseInt(k) <= scrollPercent) {
                var obj = {
                  hitType: 'event',
                  eventCategory: k + '%',
                  eventAction: 'scroll',
                  eventLabel: k + '%',
                  transport: 'beacon',
                  nonInteraction: true
                };
                gaTrack(obj);
                scrollPercents[k] = 1;
              }
            });
          });
        }
      }


      var gaTrack = function(obj) {
        try {
          if (obj.hitType == 'event') {
            // Add the current page to the label, makes reporting easier.
            obj.eventLabel = 'page:' + window.location.pathname + ' | ' + obj.eventLabel;
            // If we have  contact, add the id for reporting.
            if (Drupal.settings.nephron.contact_id) {
              obj.eventLabel = obj.eventLabel + ' | ' + 'contact:' + Drupal.settings.nephron.contact_id;
            }
          }
          ga('send', obj);
        } catch (e) {}
      };

      // Mobile menu toggle behavior.
      var tabbingContext = null;
      if (context === document) {
        function toggleMenu() {
          var menuTarget = $(".mobile-menu-target");
          var toggle = $(".menu-toggle");

          toggle.toggleClass("active");
          if (toggle.hasClass("active")) {
            toggle.attr("aria-label", "Close mobile menu");
          } else {
            toggle.attr("aria-label", "Open mobile menu");
          }
          menuTarget.toggleClass("expanded");
          menuTarget
            .closest(".region")
            .toggleClass("mobile-menu-open");
          if (
            menuTarget.hasClass("expanded") &&
            window.outerWidth <= 500
          ) {
            tabbingContext = Drupal.tabbingManager.constrain(
              $(".mobile-menu-target,.menu-toggle")
            );
            Drupal.announce(
              Drupal.t(
                "Tabbing is constrained to the mobile nav. Press Close the mobile menu to exit."
              )
            );
          } else {
            if (tabbingContext) {
              tabbingContext.release();
              Drupal.announce(
                Drupal.t("Mobile menu closed. Tabbing is no longer constrained")
              );
            }
          }
        }
      }

      $(".menu-toggle", context)
        .once("nkf-menu-toggle")
        .on("click", function() {
          toggleMenu();
        });
      // Close the menu when clicking off of it.
      $(document)
        .once("nkf-collapse-menu")
        .on("click", function(e) {
          if (
            !$(e.target).closest(".mobile-menu-target").length &&
            !$(e.target).closest(".menu-toggle").length &&
            $(".mobile-menu-target").hasClass("expanded")
          ) {
            toggleMenu();
          }
        });

      // Clear facets.
      $('.search_form--active-facets').html('');
      $('.search_form--filter').removeClass('filtered');
      $('.search_form--filter-reset').addClass('hide');

      // Loop through and see if we need to create facets.
      $('.search_form--filter input:checked').each(function(){
        $(this).parents('.search_form--filter').addClass('filtered');
        var that = $(this);
        var l = $('<div class="search_form--active-facet">'+$(this).next('label').text().replace(/ *\([^)]*\) */g, "")+'</div>');
        $('.search_form--active-facets').append(l);
        l.click(function(){
          that.attr("disabled", false);
          that.click();
        });
        // Unhide filter reset.
        $('.search_form--filter-reset').removeClass('hide');
      });


      // Set the query search reset

      if($('.search_form input.form-text').val()) {
        $('.search_form').addClass('has-keyword');
      }
      $('.search_form--inputs input.form-text').on('input', function(e){
        if($(this).val().length > 0) {
          $('.search_form--inputs').addClass('has-keyword');
        } else {
          $('.search_form--inputs').removeClass('has-keyword');
        }
      });



      // For the recipe search filter make sure open/close state is preserved on ajax response.
      // First capture state of search filters in a variable.
      Drupal.settings.nephron = Drupal.settings.nephron || {};
      Drupal.settings.nephron.filter_state = Drupal.settings.nephron.filter_state || {};

      // If we have any open filters set state.
      $.each(Drupal.settings.nephron.filter_state, function(k,v){
        if (v.open) { $(k).parent().addClass('open'); }
        if (v.filtered) { $(k).addClass('filtered'); }
      });

      $('.search_form--filter-title').once().click(function(e){
        var f = $(this).data('target');
        // close all filters first.
        $('.search_form--filter:not('+f+')').each(function(k,v){
          $(v).parent().removeClass('open');
          var i = '#'+$(v).attr('id');
          Drupal.settings.nephron.filter_state[i] = Drupal.settings.nephron.filter_state[i] || {}
          Drupal.settings.nephron.filter_state[i].open = false;
        });

        $(f).parent().toggleClass('open');
        Drupal.settings.nephron.filter_state[f] = Drupal.settings.nephron.filter_state[f] || {
          open: false,
          filtered: false
        };
        Drupal.settings.nephron.filter_state[f].open = $(f).parent().hasClass('open');
      });

      // Make sure we prevent events form bubbling up when clicking filter,
      // This way we can close them when clicking off of the filter.
      $('.search_form--filter').once().click(function(e){
        e.stopPropagation();
      });

      // Manage filtering states.
      $('.search_form--filter-options input').once().change(function(e){
        var $f = $(this).parents('.search_form--filter');
        var f = '#' + $f.attr('id');
        Drupal.settings.nephron.filter_state[f] = Drupal.settings.nephron.filter_state[f] || {
          open: false,
          filtered: false
        };
        $f.addClass('filtering');
        if($f.find('input:checked').length !== 0) {
          Drupal.settings.nephron.filter_state[f].filtered = true;
          $f.addClass('filtered');
        } else {
          Drupal.settings.nephron.filter_state[f].filtered = false;
          $f.removeClass('filtered');
        }
      });

      $('.search_form--filter-reset').click(function(e){
        e.preventDefault();
        //$form = $('.search_form--inputs form');
        $form = $(this).closest('form');
        $form.find(':checked').prop('checked', false).trigger('change');
        $('.search_form--filter.open .search_form--filter-title').trigger('click');
        $('.form-submit', $form).trigger('click');
        return false;
      });
      $('.search_form--query-reset').click(function(e){
        e.preventDefault();
        $form = $(this).closest('form');
        $form.find(':input').not(':button, :submit, :reset, :hidden, :checkbox, :radio').val('');
        $('.form-submit', $form).trigger('click');
        return false;
      });
      $(document).click(function(e){
        $('.search_form--filter').parent().removeClass('open');
        $.each(Drupal.settings.nephron.filter_state, function(k,v){
          v.open = false;
        });
      });
      // Add youtube event tracking.
      if (!inited && false) {
        var youtubeIds = [];
        // Set up all the iframes with correct info.
        $('iframe[src*="youtube.com"]').each(function(k,v) {
          $(this).attr('id', 'youtube-'+k);
          youtubeIds.push('youtube-'+k);
          var url = $(this).attr("src");
          $(this).attr("src", url + "&enablejsapi=1");
          var videoId = url.split('?')[0].split('https://www.kidney.org/').slice(-1).pop();
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
          gaTrack(obj);
        });
        // If we have videos then load youtube api.
        if (youtubeIds.length > 0){
          var tag = document.createElement('script');

          tag.src = "https://www.youtube.com/iframe_api";
          var firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

          window.player = [];
          window.onYouTubeIframeAPIReady = function() {
            $.each(youtubeIds, function(k,v){
              window.player[v] = new YT.Player( v, {
                events: { 'onStateChange': window.onPlayerStateChange }
              });
            });
          }
        }
        window.onPlayerStateChange = function(event) {
          // Send event to GA.
          var videoData = event.target.getVideoData();
          var duration = event.target.getDuration();
          var currentTime = event.target.getCurrentTime();
          var obj = {
            hitType: 'event',
            eventCategory: 'video',
            eventLabel: 'video_id:' + videoData.video_id,
            transport: 'beacon'
          };
          switch(event.data) {
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
            gaTrack(obj);
          }
        }

      }
      inited = true;
    }
  };
})(jQuery, Drupal);
;
