ChromeBrowserActions = (function() {
    
    ChromeBrowserActions.prototype = new AbstractBrowserActions;
    ChromeBrowserActions.prototype.constructor = ChromeBrowserActions;
    
    function ChromeBrowserActions() 
    {
        return this;
    };

    
    ChromeBrowserActions.prototype.newTab = function(url)
    {
        chrome.tabs.create({url: url});
    };

    ChromeBrowserActions.prototype.allTabsInWindow = function(fn)
    {
        if (typeof browser !== "undefined")
        {
            browser.tabs.query({currentWindow: true}).then(function(all_tabs) {
                var result = [];
                for (let tab of all_tabs) 
                {
                    result.push(tab);
                }
                fn(result);
            }, function(e) { console.log(e); });
        }
        else
        {
            chrome.tabs.getAllInWindow(undefined, fn);
        }
    };

    ChromeBrowserActions.prototype.activateTab = function(tab)
    {
        chrome.tabs.update(tab.id, {highlighted: true});
    };

    ChromeBrowserActions.prototype.reloadTab = function(tab)
    {
        chrome.tabs.reload(tab.id);
    };

    ChromeBrowserActions.prototype.setButtonClickHandler = function(fn)
    {
        chrome.browserAction.onClicked.addListener(fn);
    };

    ChromeBrowserActions.prototype.setBadgeText = function(text)
    {
        if (text == 0)
        {
            chrome.browserAction.setBadgeText({text: ''});
            chrome.browserAction.setBadgeBackgroundColor({color: [0,0,0,0]});
        }
        else
        {
            chrome.browserAction.setBadgeText({text: text.toString()});
            chrome.browserAction.setBadgeBackgroundColor({color: "#FF0000"});
        }
    };
    
    ChromeBrowserActions.prototype.setAlarm = function(name, interval, fn)
    {
        chrome.alarms.create(name, {periodInMinutes: interval});
        chrome.alarms.onAlarm.addListener(fn);
        fn();
    };
    
    return ChromeBrowserActions;
})();
