// YouTube Scraper Functions - Version 1.0.0
// These are the exact scripts from MainActivity, externalized for remote updates

var YouTubeScraper = {
    
    // Step 0: Search initiation script
    getSearchScript: function(searchTerm) {
        return "(function(){ " +
            "  var input = document.querySelector('input[name=\"search_query\"]');" +
            "  if(input) { " +
            "    input.value = \"" + searchTerm.replace(/"/g, '\\"') + "\";" +
            "    var btn = document.querySelector('button[aria-label=\"Search\"]');" +
            "    if(btn) btn.click(); else if(input.form) input.form.submit();" +
            "    return 'OK'; " +
            "  } return 'WAIT'; " +
            "})();";
    },
    
    // Step 1: Scroll and extract script
    getExtractScript: function() {
        return "(function(){ " +
            "  window.scrollTo(0, document.body.scrollHeight);" +
            "  var longFormItems = document.querySelectorAll('ytm-video-with-context-renderer, ytm-compact-video-renderer');" +
            "  var shortsItems = document.querySelectorAll('ytm-reel-item-renderer');" +
            "  if (longFormItems.length < 60) { return 'NEED_MORE_' + longFormItems.length; }" +
            "  var finalResults = [];" +
            "  for(var i=0; i < longFormItems.length; i++) {" +
            "    var titleEl = longFormItems[i].querySelector('h3, .media-item-metadata-title');" +
            "    var linkEl = longFormItems[i].querySelector('a');" +
            "    var thumbEl = longFormItems[i].querySelector('img');" +
            "    if(titleEl && linkEl) {" +
            "      finalResults.push({" +
            "        title: '[VIDEO] ' + titleEl.innerText," +
            "        link: linkEl.href," +
            "        thumb: thumbEl ? thumbEl.src : ''" +
            "      });" +
            "    }" +
            "  }" +
            "  for(var j=0; j < shortsItems.length; j++) {" +
            "    var sTitleEl = shortsItems[j].querySelector('.reel-item-endpoint');" +
            "    var sLinkEl = shortsItems[j].querySelector('a');" +
            "    var sThumbEl = shortsItems[j].querySelector('img');" +
            "    if(sLinkEl) {" +
            "      finalResults.push({" +
            "        title: '[SHORT] ' + (sTitleEl ? sTitleEl.getAttribute('aria-label') : 'YouTube Short')," +
            "        link: sLinkEl.href," +
            "        thumb: sThumbEl ? sThumbEl.src : ''" +
            "      });" +
            "    }" +
            "  }" +
            "  return JSON.stringify(finalResults);" +
            "})();";
    },
    
    // Get page info for debugging
    getPageInfo: function() {
        return "(function(){" +
            "  return JSON.stringify({" +
            "    url: window.location.href," +
            "    title: document.title," +
            "    videoCount: document.querySelectorAll('ytm-video-with-context-renderer, ytm-compact-video-renderer').length," +
            "    shortsCount: document.querySelectorAll('ytm-reel-item-renderer').length" +
            "  });" +
            "})();";
    }
};
