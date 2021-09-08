/**
 *  dict - swan stdlib module
 *  ============================================================================
 *  The swan standard associative array library.
 */



module.exports = swan => ({    
    create : (...entries) => createDict(swan, ...entries),
    merge  : (...dicts) => mergeDicts(swan, ...dicts),
});



/**
 *  dict.\_\_apply\_\_ - asynchronous function
 *  ----------------------------------------------------------------------------
 *  Creates a dictionary given a tuple of `[key, value]` pairs.
 *  
 *  ```js
 *  d = dict.__apply__(['x',10], ['y',20], ['z',30])
 *  ```
 *  
 *  The returned namespace contains the following items:
 *  
 *  - `d.size` - number : the number of entries contained in the dictionary
 *  - `d.has(key)` - function : returns true if `key` is contained in the dictionary
 *  - `d.get(key)` - function : returns the value mapped to `key`
 *  - `d.keys()` - function : returns the tuple of `keys` contained in the dicionary
 *  - `d.values()` - function : returns the tuple of `values` contained in the dicionary
 *  - `d.entries()` - function : returns the tuple of `[key, value]` pairs
 *    contained in the dictionary
 */
function createDict (swan, ...entries) {
    const context = this;
    
    const map = new Map();
    for (let [key, value] of entries) {
        map.set(key, value);
    }
    
    return {
        size    : map.size,
        has     : key => map.has(key),
        get     : key => map.get(key) || null,
        keys    : () => swan.Tuple(...map.keys()),
        values  : () => swan.Tuple(...map.values()),
        entries : () => swan.Tuple(...map.entries()),
    }
}


/**
 *  dict.merge - asynchronous function
 *  ----------------------------------------------------------------------------
 *  Merges two or more dictionaries together and returns a new dictionary.
 *  
 *  ```js
 *  d = dict.merge(
 *      dict.__apply__(['a',10], ['b',20]),
 *      dict.__apply__(['c',30], ['d',40]),
 *      dict.__apply__(['e',40], ['f',60]) )
 *  ``` 
 *  
 *  The entries of the dictionary in the above example are 
 *  `(['a',10], ['b',20], ['c',30], ['d',40], ['e',40], ['f',60])`
 */
function mergeDicts (swan, ...dicts) {
    const entries = [];
    
    for (let dict of dicts) {
        for (let entry of dict.entries()) {
            entries.push(entry);
        }
    }
    
    return createDict(swan, ...entries);
}
