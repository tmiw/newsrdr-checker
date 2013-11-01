FirefoxBrowserActions = (function() {
    
    function FirefoxBrowserActions() 
    {
        // Use BrowserAction package to simulate Chrome behavior.
        this._badge = require('browserAction').BrowserAction({
            default_icon: 'images/icon.png',
            default_title: 'newsrdr.us'
        });
        return this;
    };

    FirefoxBrowserActions.prototype.newTab = function(url)
    {
        var tabs = require("sdk/tabs");
        tabs.open(url);
    };

    FirefoxBrowserActions.prototype.allTabsInWindow = function(fn)
    {
        var tabs = require("sdk/tabs");
        for each (var tab in tabs)
        {
            fn(tab);
        }
    };

    FirefoxBrowserActions.prototype.activateTab = function(tab)
    {
        tab.activate();
    };

    FirefoxBrowserActions.prototype.reloadTab = function(tab)
    {
        tab.reload();
    };

    FirefoxBrowserActions.prototype.setButtonClickHandler = function(fn)
    {
        this._badge.onClicked.addListener(fn);
    };

    FirefoxBrowserActions.prototype.setBadgeText = function(text)
    {
        if (text == 0)
        {
            this._badge.setBadgeBackgroundColor({color: [0,0,0,0]});
        }
        else
        {
            this._badge.setBadgeText({text: text.toString()});
            this._badge.setBadgeBackgroundColor({color: "#FF0000"});
        }
    };
    
    FirefoxBrowserActions.prototype.setAlarm = function(name, interval, fn)
    {
        // Trigger initial alarm immediately.
        fn();
        
        var tmr = require('timer');
        return tmr.setInterval(fn, interval*1000*60);
    };
    
    FirefoxBrowserActions.prototype.makeHttpRequest = function(url, headers, fn)
    {
        var Request = require("sdk/request").Request;
        
        var req = Request({
            url: url,
            headers: headers,
            onComplete: fn
        });
        req.get();
    };
    
    return FirefoxBrowserActions;
})();

exports.cls = FirefoxBrowserActions;