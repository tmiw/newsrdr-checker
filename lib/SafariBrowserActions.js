SafariBrowserActions = (function() {
    SafariBrowserActions.prototype = new AbstractBrowserActions;
    SafariBrowserActions.prototype.constructor = SafariBrowserActions;
    
    function SafariBrowserActions() 
    {
        return this;
    };

    SafariBrowserActions.prototype.newTab = function(url)
    {
        var newTab = safari.application.activeBrowserWindow.openTab();
        newTab.url = url;
    };

    SafariBrowserActions.prototype.allTabsInWindow = function(fn)
    {
        var tabs = safari.application.activeBrowserWindow.tabs;
        fn.call(this, tabs);
    };

    SafariBrowserActions.prototype.activateTab = function(tab)
    {
        tab.activate();
    };

    SafariBrowserActions.prototype.reloadTab = function(tab)
    {
        tab.url = tab.url;
    };

    SafariBrowserActions.prototype.setBadgeText = function(text)
    {
        var itemArray = safari.extension.toolbarItems;
        for (var i = 0; i < itemArray.length; ++i) 
        {
            var item = itemArray[i];
            if (item.identifier == "newsrdr-checker")
            {
                item.badge = text;
            }
        }
    };

    SafariBrowserActions.prototype.setButtonClickHandler = function(fn)
    {
        safari.application.addEventListener("command", fn);
    };

    SafariBrowserActions.prototype.findUid = function()
    {
        // Safari only function; grabs UID for cookieless workaround method.
        var tabUrl = "/news/";
        var uid = 0;
        this.allTabsInWindow(function(tabs) 
        {
            for (var i = 0, tab; tab = tabs[i]; i++) 
            {
                if (tab.url && tab.url.indexOf(tabUrl) >= 0) 
                {
                    uid = parseInt(tab.url.substr(tab.url.indexOf(tabUrl) + tabUrl.length))
                }
            }
        });

        return uid;
    };
    
    SafariBrowserActions.prototype.setAlarm = function(name, interval, fn)
    {
        // Trigger initial alarm immediately.
        fn();
        
        var timeoutFn = function() {
            setTimeout(function() { timeoutFn(); }, interval*1000*60);
            fn();
        };
        
        return setTimeout(timeoutFn, interval*1000*60);
    };
    
    return SafariBrowserActions;
})();
