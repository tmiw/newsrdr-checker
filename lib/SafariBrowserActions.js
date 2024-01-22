import { AbstractBrowserActions } from "./AbstractBrowserActions.js";

export class SafariBrowserActions extends AbstractBrowserActions {
    newTab(url)
    {
        var newTab = safari.application.activeBrowserWindow.openTab();
        newTab.url = url;
    };

    allTabsInWindow(fn)
    {
        var tabs = safari.application.activeBrowserWindow.tabs;
        fn.call(this, tabs);
    };

    activateTab(tab)
    {
        tab.activate();
    };

    reloadTab(tab)
    {
        tab.url = tab.url;
    };

    setBadgeText(text)
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

    setButtonClickHandler(fn)
    {
        safari.application.addEventListener("command", fn);
    };

    findUid()
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
    
    setAlarm(name, interval, fn)
    {
        // Trigger initial alarm immediately.
        fn();
        
        var timeoutFn = function() {
            setTimeout(function() { timeoutFn(); }, interval*1000*60);
            fn();
        };
        
        return setTimeout(timeoutFn, interval*1000*60);
    };
    
};
