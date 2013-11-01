// Required for Firefox to make sure we load everything.
if (typeof require !== "undefined")
{
    ExtensionController = require("./ExtensionController").cls;
}

var controller = new ExtensionController;
controller.initialize();