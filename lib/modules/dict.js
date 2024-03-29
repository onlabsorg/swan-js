/**
 *  dict module
 *  ============================================================================
 *  
 *  The `dict` module exports functions to create and detect Namespace item that 
 *  behaves like a dictionary. 
 */


const DATA = Symbol("Swan Dictionary Map");

module.exports = types => ({

   /**
    *  `dict.create: List Tuple kv -> Namespace d`
    *  ----------------------------------------------------------------------------
    *   This function takes a tuple of `[key,value]` pairs as input and returns
    *   a dictionary namespace.
    *  
    *  ```
    *  d = dict(['key1','val1'], [22, 'val2'], ['key3', 30])
    *  ```
    *  
    *  The returned dictionary Namespace `d` contains the following items:
    *  
    *  - `d.size` is a `Numb` item that contains the number of items in the dictionary
    *    (3 in the example above)
    *  - `d.keys` is the Tuple of keys of the dictionaty (`('key1',22,'key2')` in 
    *    the example above)
    *  - `d.values` is the Tuple of values of the dictionaty (`('val1',val2,30)` in 
    *    the example above)
    *  - `d.entries` is the Tuple of `[key,value]` pairs of the dictionaty (
    *    `(['key1','val1'], [22, 'val2'], ['key3', 30])` in the example above)
    *  - `d.get` is a Func that takes a key as argument and returns the 
    *    corresponding value, or `Undefined('Mapping')` if the key doesn't exist.
    *  - `d.has` is a Func that takes a key as argument and returns `TRUE` if
    *    the dictionary contains that key, otherwise it returns `FALSE`.
    */
    create (...pairs) {
        
        const map = new Map(pairs);
        
        return {
            
            [DATA] : map,
            
            size   : map.size,
            keys   : new types.Tuple(...map.keys()),
            values : new types.Tuple(...map.values()),
            entries: new types.Tuple(...map.entries()),
            
            get: key => map.has(key) ? map.get(key) : new types.Undefined('Mapping', key),
            has: key => map.has(key),
        }
    },
    
    
    /**
     *  `dict.isDIct: Namespace d -> Bool b`
     *  ----------------------------------------------------------------------------
     *  This function returns `TRUE` if the passed item is a dictionary
     *  namespace.
     */
    isDict (dict) {
        if (types.wrap(dict) instanceof types.Namespace) {
            return dict[DATA] instanceof Map;
        } else {
            return false;
        }
    }
});
