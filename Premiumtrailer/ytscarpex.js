// YouTube Scraper - Version 1.0.0
// Host this file on GitHub to enable remote updates
// This extracts long-form videos and shorts from YouTube mobile search results

const YouTubeAutomation = (function() {
    'use strict';
    
    const MAX_LONG_FORM = 60;
    const SCROLL_DELAY = 2000;
    
    // Step 0: Initiate search
    function performSearch(searchTerm) {
        const safeTerm = JSON.stringify(searchTerm);
        
        const script = `
            (function(){
                var input = document.querySelector('input[name="search_query"]');
                if(input) {
                    input.value = ${safeTerm};
                    var btn = document.querySelector('button[aria-label="Search"]');
                    if(btn) btn.click(); 
                    else if(input.form) input.form.submit();
                    return 'OK';
                }
                return 'WAIT';
            })();
        `;
        
        return {
            step: 0,
            script: script,
            successCheck: function(result) {
                return result && result.includes('OK');
            },
            delay: 1000
        };
    }
    
    // Step 1: Scroll and extract
    function scrollAndExtract() {
        const script = `
            (function(){
                /* Trigger lazy loading */
                window.scrollTo(0, document.body.scrollHeight);
                
                /* Identify video elements */
                var longFormItems = document.querySelectorAll(
                    'ytm-video-with-context-renderer, ytm-compact-video-renderer'
                );
                var shortsItems = document.querySelectorAll('ytm-reel-item-renderer');
                
                /* Check if we have enough long-form videos */
                if (longFormItems.length < ${MAX_LONG_FORM}) {
                    return 'NEED_MORE_' + longFormItems.length;
                }
                
                /* Extract videos */
                var finalResults = [];
                
                /* Long-form videos */
                for(var i = 0; i < longFormItems.length; i++) {
                    var titleEl = longFormItems[i].querySelector('h3, .media-item-metadata-title');
                    var linkEl = longFormItems[i].querySelector('a');
                    var thumbEl = longFormItems[i].querySelector('img');
                    var durationEl = longFormItems[i].querySelector('.video-badge-label, .ytm-badge-and-byline-item-byline');
                    var viewsEl = longFormItems[i].querySelector('.ytm-badge-and-byline-item-byline');
                    
                    if(titleEl && linkEl) {
                        var videoData = {
                            type: 'VIDEO',
                            title: titleEl.innerText.trim(),
                            link: linkEl.href,
                            thumb: thumbEl ? thumbEl.src : '',
                            duration: durationEl ? durationEl.innerText.trim() : '',
                            views: viewsEl ? viewsEl.innerText.trim() : ''
                        };
                        
                        // Skip duplicates
                        if (!finalResults.find(function(item) { return item.link === videoData.link; })) {
                            finalResults.push(videoData);
                        }
                    }
                }
                
                /* Shorts */
                for(var j = 0; j < shortsItems.length; j++) {
                    var sLinkEl = shortsItems[j].querySelector('a');
                    var sThumbEl = shortsItems[j].querySelector('img');
                    var sTitleEl = shortsItems[j].querySelector('.reel-item-endpoint');
                    var sViewsEl = shortsItems[j].querySelector('.reel-item-metadata');
                    
                    if(sLinkEl) {
                        var shortData = {
                            type: 'SHORT',
                            title: sTitleEl ? (sTitleEl.getAttribute('aria-label') || 'YouTube Short') : 'YouTube Short',
                            link: sLinkEl.href,
                            thumb: sThumbEl ? sThumbEl.src : '',
                            views: sViewsEl ? sViewsEl.innerText.trim() : ''
                        };
                        
                        if (!finalResults.find(function(item) { return item.link === shortData.link; })) {
                            finalResults.push(shortData);
                        }
                    }
                }
                
                return JSON.stringify(finalResults);
            })();
        `;
        
        return {
            step: 1,
            script: script,
            successCheck: function(result) {
                return result && !result.includes('NEED_MORE') && result.length > 20;
            },
            needsMore: function(result) {
                return result && result.includes('NEED_MORE');
            },
            extractCount: function(result) {
                if (result && result.includes('NEED_MORE_')) {
                    return result.replace(/["']/g, '').replace('NEED_MORE_', '');
                }
                return '0';
            },
            delay: SCROLL_DELAY
        };
    }
    
    // Get current state info
    function getPageInfo() {
        const script = `
            (function(){
                return JSON.stringify({
                    url: window.location.href,
                    title: document.title,
                    readyState: document.readyState,
                    videoCount: document.querySelectorAll(
                        'ytm-video-with-context-renderer, ytm-compact-video-renderer'
                    ).length,
                    shortsCount: document.querySelectorAll('ytm-reel-item-renderer').length
                });
            })();
        `;
        
        return {
            script: script,
            isInfo: true
        };
    }
    
    return {
        performSearch: performSearch,
        scrollAndExtract: scrollAndExtract,
        getPageInfo: getPageInfo,
        MAX_LONG_FORM: MAX_LONG_FORM
    };
})();
