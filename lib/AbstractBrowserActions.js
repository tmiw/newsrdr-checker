export class AbstractBrowserActions {
    constructor() { }

    async makeHttpRequest(url, headers, fn)
    {
        const response = await fetch(url, {
            "method": "GET",
            "credentials": "include",
            "headers": headers});
        response.json().then( (json_val) => {
            fn({"json": json_val, "status": response.status });
        });
    };
};
