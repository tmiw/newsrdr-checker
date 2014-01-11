// Required for Firefox to make sure we load everything.
if (typeof require !== "undefined")
{
    ExtensionController = require("./ExtensionController").cls;
}

var mainFn = function(options, callbacks) {
    var controller = new ExtensionController;
    
    controller.makeBrowserInterface();
    
    if (typeof require !== "undefined")
    {
        // Use BrowserAction package to simulate Chrome behavior on Firefox.
        // Button creation should only take place on install.
        controller._browserInterface._badge = require('browserAction').BrowserAction({
            default_icon: 'icon_16.png',
            default_title: 'newsrdr.us'
        });
    }
    
    controller.initialize();
};

if (typeof exports !== "undefined")
{
    exports.main = mainFn;
}
else
{
    mainFn();
}
