/**
 *  http - swan stdlib module
 *  ============================================================================
 *  The http library exposes methods to use the HTTP protocol.
 */

require("isomorphic-fetch");




/**
 *  http.get - asynchronous function
 *  ----------------------------------------------------------------------------
 *  Sends an HTTP GET request to the given URL and returns the response body as
 *  text. In case of error, it throws the HTTP status code.
 *  ```
 *  text = await http.get(url, options)
 *  ```
 *  - `url` is the URL of the resource to be fetched
 *  - `options` is the second parameter of the JavaScript
 *    [fetch](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch)
 *    function.
 */
exports.get = async function (url, options={}) {
    ensureString(url);
    options = Object(options);
    options.method = "get";

    const response = await fetch(url, options);
    if (!response.ok) throw new Error(response.status);
    return await response.text();
}


function ensureString (string) {
    if (typeof string !== "string") throw new Error("String type expected");
}
