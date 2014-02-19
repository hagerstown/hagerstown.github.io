/*global $*/
$(function() {

// Twirl open/close TOC sections
$('.section-active .twirl').addClass('open');

$('.twirl').click(function() {
  $(this).toggleClass('open')
    .parent().next().toggle();
  return false;
});



// Prev/next buttons
var $active = $('.active')
  , prev = getPrev($active)
  , $prev = $('.prev')
  , next = getNext($active)
  , $next = $('.next');

$('.controls a').hover(function() {
  $(this).toggleClass('over');
});

if (prev) {
  $prev.attr('href', prev.href)
    .children().text(prev.name);
} else {
  $prev.addClass('disabled')
    .click(function() { return false; });
}

if (next) {
  $next.attr('href', next.href)
    .children().text(next.name);
} else {
  $next.addClass('disabled')
    .click(function() { return false; });
}

function getPrev($cur) {
  var $parent = $cur.parent()
    , $prevParent = $parent.prev()
    , $prevLink;

  if (!$cur.length) return false; // at index

  if ($parent.hasClass('section')) { // main section
    $prevLink = $prevParent.find('ul li:last-child a');

    if ($prevParent[0] === undefined) {
      return {
        'name': 'Home',
        'href': $('.title a').attr('href')
      };
    }

    return { 'name': $prevLink.text(), 'href': $prevLink.attr('href') };
  } else { // subsection
    if ($prevParent[0] === undefined) {
      $prevLink = $parent.parent().prev();

      return {
        'name': $prevLink.text(),
        'href': $prevLink.attr('href')
      };
    }

    $prevLink = $prevParent.children();
    return {'name': $prevLink.text(), 'href': $prevLink.attr('href')};
  }
}

function getNext($cur) {
  var $parent = $cur.parent()
    , $nextParent = $parent.next()
    , $nextLink;

  if (!$cur.length) { // at index
    $nextLink = $('.section').first().children('a');
    return {
      'name': $nextLink.text(),
      'href': $nextLink.attr('href')
    };
  }

  if ($parent.hasClass('section')) { // main section
    $nextLink = $cur.next().children().first().children();

    return { 'name': $nextLink.text(), 'href': $nextLink.attr('href') };
  } else { // subsection
    if ($nextParent[0] === undefined) { // last subsection
      $nextLink = $parent.parent().parent().next().children('a');

      if ($nextLink[0] === undefined) return false; // on last page

      return {
        'name': $nextLink.text(),
        'href': $nextLink.attr('href')
      };
    }

    $nextLink = $nextParent.children();
    return {'name': $nextLink.text(), 'href': $nextLink.attr('href')};
  }
}



// Search
$.getJSON('/site-index.json', function(indexData) {
  var index = lunr.Index.load(indexData)
    , $searchResultsTemplate = $('#search-results-template').text()
    , $results = $('.results')
    , $resultsCont = $('#search-results');
  
  $('#search form').submit(function(e) {
    e.preventDefault();
  });

  $.getJSON('/site-data.json', function(data) {
    $('#search-query').addClass('visible')
      .focusin(function() {
        $(this).addClass('focused').attr('placeholder', 'Search');
      })
      .focusout(function() {
        if ($(this).val()) return;
        $(this).removeClass('focused').removeAttr('placeholder');
      })
      .keyup(function() {
        var $this = $(this);
      
        if ($this.val()) {
          $('.toc').hide();
          $this.addClass('filled');
        } else {
          $('.toc').show();
          $this.removeClass('filled');
        }
      })
      .keyup(debounce(function() {
        var $query = $(this).val()
          , results;
        
        if ($query.length <= 2) {
          $resultsCont.hide();
          results = [];
        } else {
          $resultsCont.show();
          results = index.search($query).map(function(result) {
            return data.filter(function(q) {
              return q.id === parseInt(result.ref, 10)
            })[0];
          });
        }
        renderSearchResults(results);
      }));
    
    $('.clear').click(function() {
      $resultsCont.hide();
      $('#search-query').val('')
        .keyup()
        .removeClass('filled')
        .focus();
    });
    
    function renderSearchResults(pages) {
      $results.empty();
      if (pages.length) {
        $results.append(Mustache.to_html($searchResultsTemplate, {
          pages: pages
        }));
      } else {
        $results.append('<p>Nothing found.</p>');
      }
      
    }
    
    function debounce(fn) {
      var timeout;
      return function() {
        var args = Array.prototype.slice.call(arguments),
            ctx = this;
    
        clearTimeout(timeout);
        timeout = setTimeout(function () {
          fn.apply(ctx, args)
        }, 100);
      }
    }
    
  });
});

$('article#main div.wrapper img').each(function(){
  $this = $(this);
  var src = $this.attr('src');
  var alt = $this.attr('alt');
  $this.wrap('<a title="' + alt + '" href="' + src + '" class="fancy" rel="photos">');
});


// Fancybox
$(".thumb").fancybox({
  helpers: {
    thumbs: {
      width: 50,
      height: 50
    }
  }
});


// Full report print stuff
$('.full-report #back').click(function(e) {
  (window.history) ? window.history.back() : window.back();
  e.preventDefault();
});

});
