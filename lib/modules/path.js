/**
 *  path module
 *  ============================================================================
 *  
 *  The `path` module contains functions for manipulating file paths.
 *
 */
 
const pathlib = require('path');

module.exports = types => {
    const path = {};
    
    const isNumb = x => types.wrap(x) instanceof types.Numb;
    const isText = x => types.wrap(x) instanceof types.Text;


    /**
     *  `path.join: Tuple chunks -> Text p`
     *  ------------------------------------------------------------------------
     *  Given a tuple of path chunks, joins them together in a single path and
     *  resolves `.` and `..` segments.
     */
    path.join = (...chunks) => {
        const textChunks = chunks.map(chunk => types.wrap(chunk).toString());
        return pathlib.normalize(textChunks.join('/'));
    };    
    

    /**
     *  `path.split: Tuple chunks -> Tuple segments`
     *  ------------------------------------------------------------------------
     *  Given a path, returns all its segments, after normalizing it. If a 
     *  chunk of partial paths is passed, it joins the chunks first.
     */
    path.split = (...chunks) => {
        const fullPath = path.join(...chunks).slice(1);
        return new types.Tuple(...fullPath.split('/')).normalize();
    };
    
    return path;  
}
