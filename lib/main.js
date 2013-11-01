var controller = new ExtensionController;
if (controller.getBrowserType() != ExtensionController.FIREFOX_BROWSER)
{
    controller.initialize();
}
else
{
    var widgets = require("sdk/widget");
    var tabs = require("sdk/tabs");

    var widget = widgets.Widget({
      id: "mozilla-link",
      label: "Mozilla website",
      contentURL: "http://www.mozilla.org/favicon.ico",
      onClick: function() {
        tabs.open("http://www.mozilla.org/");
      }
    });
}