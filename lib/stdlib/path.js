/**
 *  path - swan stdlib module
 *  ============================================================================
 *  This module contains functions to manipulate file path strings.
 */

const pathlib = require("path");

module.exports = {

    /**
     *  path.dir - function
     *  ------------------------------------------------------------------------
     *  Given a path `p`, it returns the path without the terminal segment.
     *  ```
     *  dirPath = path.dir(p)
     *  ```
     */
    dir (path) {
        return pathlib.dirname(path);
    },


    /**
     *  path.fullName - function
     *  ------------------------------------------------------------------------
     *  Given a path `p`, it returns the terminal segment.
     *  ```
     *  name = path.fullName(p)
     *  ```
     */
    fullName (path) {
        return pathlib.basename(path);
    },


    /**
     *  path.ext - function
     *  ------------------------------------------------------------------------
     *  Given a path `p`, it returns the terminal segment, without extension.
     *  ```
     *  pathName = path.name(p)
     *  ```
     */
    name (path) {
        const fullName = this.fullName(path);
        const ext = this.ext(path);
        return fullName.slice(0, ext.length+1);
    },


    /**
     *  path.ext - function
     *  ------------------------------------------------------------------------
     *  Given a path `p`, it returns the extension of the terminal segment.
     *  ```
     *  pathExt = path.ext(p)
     *  ```
     */
    ext (path) {
        return pathlib.extname(path);
    },


    /**
     *  path.normalize - function
     *  ------------------------------------------------------------------------
     *  Given a path `p`, it returns an equivalent path, after resolving `.`,
     *  `..` and multiple `/`.
     *  ```
     *  nPath = path.normalize(p)
     *  ```
     */
    normalize (path) {
        return pathlib.normalize(path);
    },


    /**
     *  path.join - function
     *  ------------------------------------------------------------------------
     *  Given a tuple of paths, it returns a signle path obtained by
     *  concatenating them.
     *  ```
     *  jPath = path.join(p1, p2, p3, ...)
     *  ```
     */
    join (...paths) {
        return pathlib.join(...paths);
    },


    /**
     *  path.normalize - function
     *  ------------------------------------------------------------------------
     *  Given a tuple of paths, it resolves a sequence of paths or path segments
     *  into an absolute path.
     *  ```
     *  absPath = path.resolve(p1, p2, p3, ...)
     *  ```
     */
    resolve (...paths) {
        return pathlib.resolve("/", ...paths);
    }
};
