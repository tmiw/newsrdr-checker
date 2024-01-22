import { AbstractBrowserActions } from "./AbstractBrowserActions.js";

export class ChromeBrowserActions extends AbstractBrowserActions {
    newTab(url)
    {
        chrome.tabs.create({url: url});
    };

    allTabsInWindow(fn)
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
            chrome.tabs.query({"currentWindow": true}, fn);
        }
    };

    activateTab(tab)
    {
        chrome.tabs.update(tab.id, {highlighted: true});
    };

    reloadTab(tab)
    {
        chrome.tabs.reload(tab.id);
    };

    setButtonClickHandler(fn)
    {
        chrome.action.onClicked.addListener(fn);
    };

    setBadgeText(text)
    {
        if (text == 0)
        {
            chrome.action.setBadgeText({text: ''});
            chrome.action.setBadgeBackgroundColor({color: [0,0,0,0]});
        }
        else
        {
            chrome.action.setBadgeText({text: text.toString()});
            chrome.action.setBadgeBackgroundColor({color: "#FF0000"});
            chrome.action.setBadgeTextColor({color: "#FFFFFF"});
        }
    };
    
    setAlarm(name, interval, fn)
    {
        chrome.alarms.create(name, {periodInMinutes: interval});
        chrome.alarms.onAlarm.addListener(fn);
        fn();
    };
};
