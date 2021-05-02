swan standard library
================================================================================

The standard library contains javascript modules that can be imported in the
expression scope as namespaces using the `require` function. For example,
the swan expression `require 'math'` returns the exports of the standard-lib
`math` JavaScript module.

The standard library contains the following modules:

- [date](./modules/date.md): contains functions to operate with dates and time
- [http](./modules/http.md): contains functions for data transfer over HTTP
- [json](./modules/json.md): contains functions to serialize and deserialize json objects
- [list](./modules/list.md): contains functions to manipulate swan lists
- [math](./modules/math.md): contains mathematical functions
- [path](./modules/path.md): contains functions to manipulate unix-like file paths
- [text](./modules/text.md): contains functions to manipulate strings
