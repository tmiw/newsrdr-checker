AbstractBrowserActions = (function() {
    function AbstractBrowserActions()
    {
        return this;
    };
    
    AbstractBrowserActions.prototype.makeHttpRequest = function(url, headers, fn)
    {
        xhr = new XMLHttpRequest;
        xhr.onreadystatechange = function() 
        {
            if (xhr.readyState != 4) 
            {
                return;
            }

            var jsonObj = null;
            try
            {
                jsonObj = JSON.parse(xhr.responseText);
            }
            catch (exc)
            {
                // ignore
            }
            
            var res = {json: jsonObj, status: xhr.status};
            fn(res);
        };
        
        xhr.open("GET", url, true);
        xhr.withCredentials = true;
        for (var i in headers)
        {
            xhr.setRequestHeader(i, headers[i]);
        }
        xhr.send();
    };
    
    return AbstractBrowserActions;
})();

if (typeof exports !== "undefined")
{
    exports.cls = AbstractBrowserActions;
}