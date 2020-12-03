require("isomorphic-fetch");


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
