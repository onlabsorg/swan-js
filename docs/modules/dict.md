dict module
============================================================================

The `dict` module exports a function that takes as input a tuple of 
`[key,value]` pairs and returns a dictionary Namespace.

```
d = dict(['key1','val1'], [22, 'val2'], ['key3', 30])
```

The returned dictionary Namespace `d` contains the following items:

- `d.size` is a `Numb` item that contains the number of items in the dictionary
  (3 in the example above)
- `d.keys` is the Tuple of keys of the dictionaty (`('key1',22,'key2')` in 
  the example above)
- `d.values` is the Tuple of values of the dictionaty (`('val1',val2,30)` in 
  the example above)
- `d.entries` is the Tuple of `[key,value]` pairs of the dictionaty (
  `(['key1','val1'], [22, 'val2'], ['key3', 30])` in the example above)
- `d.get` is a Func that takes a key as argument and returns the 
  corresponding value, or `Undefined('Mapping')` if the key doesn't exist.
- `d.has` is a Func that takes a key as argument and returns `Bool.TRUE` if 
  the dictionary contains that key, otherwise it returns `Bool.FALSE`.
  

