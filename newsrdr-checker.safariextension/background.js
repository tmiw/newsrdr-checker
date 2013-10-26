function ChromeBrowserActions() 
{
    return this;
}

ChromeBrowserActions.prototype.newTab = function(url)
{
    chrome.tabs.create({url: url});
}

ChromeBrowserActions.prototype.allTabsInWindow = function(fn)
{
    chrome.tabs.getAllInWindow(undefined, fn);
}

ChromeBrowserActions.prototype.activateTab = function(tab)
{
    chrome.tabs.update(tab.id, {selected: true});
}

ChromeBrowserActions.prototype.reloadTab = function(tab)
{
    chrome.tabs.reload(tab.id);
}

ChromeBrowserActions.prototype.setButtonClickHandler = function(fn)
{
    chrome.browserAction.onClicked.addListener(fn);
}

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
}

function SafariBrowserActions() 
{
    return this;
}

SafariBrowserActions.prototype.newTab = function(url)
{
    var newTab = safari.application.activeBrowserWindow.openTab();
    newTab.url = url;
}

SafariBrowserActions.prototype.allTabsInWindow = function(fn)
{
    var tabs = safari.application.activeBrowserWindow.tabs;
    fn.call(this, tabs);
}

SafariBrowserActions.prototype.activateTab = function(tab)
{
    tab.activate();
}

SafariBrowserActions.prototype.reloadTab = function(tab)
{
    tab.url = tab.url;
}

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
}

SafariBrowserActions.prototype.setButtonClickHandler = function(fn)
{
    safari.application.addEventListener("command", fn);
}

function findUid()
{
    // Safari only function; grabs UID for cookieless workaround method.
    var tabUrl = "/news/";
    var uid = 0;
    _browserInterface.allTabsInWindow(function(tabs) 
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
}

function goToSite()
{
    var tabUrl = "http://newsrdr.us/news";
    _browserInterface.allTabsInWindow(function(tabs) 
    {
        for (var i = 0, tab; tab = tabs[i]; i++) 
        {
            if (tab.url && tab.url.indexOf(tabUrl) >= 0) 
            {
                // Update known UID as needed.
                _browserInterface.activateTab(tab);
                _browserInterface.reloadTab();
                return;
            }
        }
        _browserInterface.newTab(tabUrl);
    });
}

function clearBadge()
{
    _browserInterface.setBadgeText(0);
}

function onAlarm()
{
    xhr = new XMLHttpRequest;
    xhr.onreadystatechange = function() 
    {
        if (xhr.readyState != 4) 
        {
            return;
        }

        if (xhr.status == 200) 
        {
            var responseJson = JSON.parse(xhr.responseText);
            if (responseJson.success == true)
            {
                var feedList = responseJson.data;
                var totalUnread = 0;
                for(var i = 0; i < feedList.length; i++)
                {
                    totalUnread = totalUnread + feedList[i].numUnread;
                }
                if (totalUnread > 0)
                {
                    _browserInterface.setBadgeText(totalUnread);
                }
                else
                {
                    clearBadge();
                }
            }
            else 
            {
                clearBadge();
            }
        }
        else
        {
            clearBadge();
        }
    };

    xhr.open("GET", "http://newsrdr.us/feeds/", true);
    xhr.withCredentials = true;
    if (typeof chrome === "undefined")
    {
        // Safari only: since XMLHttpRequest doesn't send cookies, this nasty workaround
        // ensures that the plugin behaves as expected. Requires the user to click the button
        // to retrieve the user ID, though.
        xhr.setRequestHeader("X-newsrdr-userId", _browserInterface.uid);
    }
    xhr.send();
}

if (typeof chrome !== "undefined")
{
    _browserInterface = new ChromeBrowserActions;
    chrome.runtime.onInstalled.addListener(function() 
    {
        chrome.alarms.create("fetch", {periodInMinutes: 1, when: 0})
    });
    chrome.alarms.onAlarm.addListener(onAlarm);
}
else
{
    _browserInterface = new SafariBrowserActions;
    _safariAlarm = setInterval(onAlarm, 1000*60);
    
    // Every second, we should be checking to see what the current newsrdr UID is.
    // Would be unnecessary if cookies actually worked in XMLHttpRequests.
    _safariUrlAlarm = setInterval(function() {
        var foundUid = findUid();
        if (foundUid > 0)
        {
            _browserInterface.uid = foundUid;
            // Attempt save to local storage. Will fail silently if Private Browsing is enabled.
            try {
                localStorage.lastSeenUid = _browserInterface.uid;
            } catch(err) {
                // ignore
            }
        }
    }, 1000);
    
    // Restore last seen UID from storage.
    try {
        _browserInterface.uid = parseInt(localStorage.lastSeenUid);
    } catch(err) {
        // ignore
    }
    
    // Trigger initial alarm immediately.
    onAlarm();
}

_browserInterface.setButtonClickHandler(goToSite);
