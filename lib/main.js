import { ExtensionController } from "./ExtensionController.js";

var mainFn = function(options, callbacks) {
    var controller = new ExtensionController;
    
    controller.makeBrowserInterface();
    
    if (typeof require !== "undefined")
    {
        var self = require("sdk/self");

        // Button creation should only take place on install.
        controller._browserInterface._badge = require('sdk/ui').ActionButton({
            id: 'newsrdr-icon',
            icon: self.data.url('icon_16.png'),
            label: 'newsrdr.us'
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
