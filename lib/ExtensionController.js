ExtensionController = (function() {
    function ExtensionController()
    {
        return this;
    };
    
    ExtensionController.prototype.goToSite = function()
    {
        var tabUrl = "http://newsrdr.us/news";
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

    ExtensionController.prototype.clearBadge = function()
    {
        this._browserInterface.setBadgeText(0);
    };

    ExtensionController.prototype.onAlarm = function()
    {
        var self = this;
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
        };

        xhr.open("GET", "http://newsrdr.us/feeds/", true);
        xhr.withCredentials = true;
        if (self.getBrowserType() == ExtensionController.prototype.SAFARI_BROWSER)
        {
            // Safari only: since XMLHttpRequest doesn't send cookies, this nasty workaround
            // ensures that the plugin behaves as expected. Requires the user to click the button
            // to retrieve the user ID, though.
            xhr.setRequestHeader("X-newsrdr-userId", self._browserInterface.uid);
        }
        xhr.send();
    };
    
    ExtensionController.prototype.SAFARI_BROWSER = 1;
    ExtensionController.prototype.CHROME_BROWSER = 2;
    ExtensionController.prototype.FIREFOX_BROWSER = 3;
    
    ExtensionController.prototype.getBrowserType = function()
    {
        if (typeof chrome !== "undefined")
        {
            return ExtensionController.prototype.CHROME_BROWSER;
        }
        else if (typeof safari !== "undefined")
        {
            return ExtensionController.prototype.SAFARI_BROWSER;
        }
        else if (typeof require !== "undefined")
        {
            return ExtensionController.prototype.FIREFOX_BROWSER;
        }
        else
        {
            throw new Error("Unsupported browser.")
        }
    };
    
    ExtensionController.prototype.makeBrowserInterface = function()
    {
        var type = this.getBrowserType();
        if (type == ExtensionController.prototype.SAFARI_BROWSER)
        {
            this._browserInterface = new SafariBrowserActions;
        }
        else if (type == ExtensionController.prototype.CHROME_BROWSER)
        {
            this._browserInterface = new ChromeBrowserActions;
        }
        else if (type == ExtensionController.prototype.FIREFOX_BROWSER)
        {
            throw new Error("Firefox is currently unsupported.");
        }
        else
        {
            // Should not reach here.
            throw new Error("Unexpected end of function.");
        }
    };
    
    ExtensionController.prototype.initialize = function()
    {
        this.makeBrowserInterface();
        
        if (this.getBrowserType() == ExtensionController.prototype.SAFARI_BROWSER)
        {
            // Every second, we should be checking to see what the current newsrdr UID is.
            // Would be unnecessary if cookies actually worked in XMLHttpRequests.
            var self = this;
            _safariUrlAlarm = setInterval(function() {
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
        
        this._browserInterface.setAlarm("fetch", 1, this.onAlarm.bind(this));
        this._browserInterface.setButtonClickHandler(this.goToSite.bind(this));
    };
    
    return ExtensionController;
})();