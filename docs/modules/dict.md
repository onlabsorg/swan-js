dict - swan stdlib module
============================================================================
The swan standard associative array library.
  
dict.\_\_apply\_\_ - asynchronous function
----------------------------------------------------------------------------
Creates a dictionary given a tuple of `[key, value]` pairs.

```js
d = dict.__apply__(['x',10], ['y',20], ['z',30])
```

The returned namespace contains the following items:

- `d.size` - number : the number of entries contained in the dictionary
- `d.has(key)` - function : returns true if `key` is contained in the dictionary
- `d.get(key)` - function : returns the value mapped to `key`
- `d.keys()` - function : returns the tuple of `keys` contained in the dicionary
- `d.values()` - function : returns the tuple of `values` contained in the dicionary
- `d.entries()` - function : returns the tuple of `[key, value]` pairs
  contained in the dictionary
  
dict.merge - asynchronous function
----------------------------------------------------------------------------
Merges two or more dictionaries together and returns a new dictionary.

```js
d = dict.merge(
    dict.__apply__(['a',10], ['b',20]),
    dict.__apply__(['c',30], ['d',40]),
    dict.__apply__(['e',40], ['f',60]) )
``` 

The entries of the dictionary in the above example are 
`(['a',10], ['b',20], ['c',30], ['d',40], ['e',40], ['f',60])`
  

