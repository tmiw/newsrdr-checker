import { ChromeBrowserActions } from "./ChromeBrowserActions.js";
import { SafariBrowserActions } from "./SafariBrowserActions.js";

export class ExtensionController {
    constructor() { }
    
    goToSite()
    {
        var tabUrl = "https://newsrdr.us/news";
        var self = this;
        this._browserInterface.allTabsInWindow(function(tabs) 
        {
            for (var i = 0, tab; tab = tabs[i]; i++) 
            {
                if (tab.url && tab.url.indexOf(tabUrl) >= 0) 
                {
                    // Update known UID as needed.
                    self._browserInterface.activateTab(tab);
                    self._browserInterface.reloadTab();
                    return;
                }
            }
            self._browserInterface.newTab(tabUrl);
        });
    }

    clearBadge()
    {
        this._browserInterface.setBadgeText(0);
    };

    onAlarm()
    {
        var self = this;
        var headers = {};
        if (self.getBrowserType() == ExtensionController.prototype.SAFARI_BROWSER)
        {
            // Safari only: since XMLHttpRequest doesn't send cookies, this nasty workaround
            // ensures that the plugin behaves as expected. Requires the user to click the button
            // to retrieve the user ID, though.
            headers["X-newsrdr-userId"] = self._browserInterface.uid;
        }
        
        self._browserInterface.makeHttpRequest("https://newsrdr.us/feeds/", headers, function(result) 
        {
            if (result.status == 200) 
            {
                var responseJson = result.json;
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
                        self._browserInterface.setBadgeText(totalUnread);
                    }
                    else
                    {
                        self.clearBadge();
                    }
                }
                else 
                {
                    self.clearBadge();
                }
            }
            else
            {
                self.clearBadge();
            }
        });
    };
    
    SAFARI_BROWSER = 1;
    CHROME_BROWSER = 2;
    FIREFOX_BROWSER = 3;
    
    getBrowserType()
    {
        if (typeof chrome !== "undefined")
        {
            return this.CHROME_BROWSER;
        }
        else if (typeof safari !== "undefined")
        {
            return this.SAFARI_BROWSER;
        }
        else if (typeof require !== "undefined")
        {
            return this.FIREFOX_BROWSER;
        }
        else
        {
            throw new Error("Unsupported browser.")
        }
    };
    
    makeBrowserInterface()
    {
        var type = this.getBrowserType();
        var self = this;
        if (type == this.SAFARI_BROWSER)
        {
            this._browserInterface = new SafariBrowserActions;
        }
        else if (type == this.CHROME_BROWSER)
        {
            this._browserInterface = new ChromeBrowserActions;
        }
        else if (type == this.FIREFOX_BROWSER)
        {
            var cls = require("./FirefoxBrowserActions").cls;
            this._browserInterface = new cls;
        }
        else
        {
            // Should not reach here.
            throw new Error("Unexpected end of function.");
        }
    };
    
    initialize()
    {   
        if (this.getBrowserType() == ExtensionController.prototype.SAFARI_BROWSER)
        {
            // Every second, we should be checking to see what the current newsrdr UID is.
            // Would be unnecessary if cookies actually worked in XMLHttpRequests.
            var self = this;
            self._safariUrlAlarm = setInterval(function() {
                var foundUid = self._browserInterface.findUid();
                if (foundUid > 0)
                {
                    self._browserInterface.uid = foundUid;
                    // Attempt save to local storage. Will fail silently if Private Browsing is enabled.
                    try {
                        localStorage.lastSeenUid = self._browserInterface.uid;
                    } catch(err) {
                        // ignore
                    }
                }
            }, 1000);

            // Restore last seen UID from storage.
            try {
                self._browserInterface.uid = parseInt(localStorage.lastSeenUid);
            } catch(err) {
                // ignore
            }
        }
        
        this._browserInterface.setAlarm("fetch", 5, this.onAlarm.bind(this));
        this._browserInterface.setButtonClickHandler(this.goToSite.bind(this));
    };

    #_safariUrlAlarm;
};
