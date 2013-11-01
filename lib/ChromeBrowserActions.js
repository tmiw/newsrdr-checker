ChromeBrowserActions = (function() {
    
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
        chrome.tabs.getAllInWindow(undefined, fn);
    };

    ChromeBrowserActions.prototype.activateTab = function(tab)
    {
        chrome.tabs.update(tab.id, {selected: true});
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
        chrome.runtime.onInstalled.addListener(function() 
        {
            chrome.alarms.create(name, {periodInMinutes: interval, when: 0});
        });
        chrome.alarms.onAlarm.addListener(fn);
    };
    
    return ChromeBrowserActions;
})();