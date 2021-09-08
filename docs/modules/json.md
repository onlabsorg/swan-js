json - swan stdlib module
============================================================================
This module contains function to work with the json data format.
  
json.parse - function
----------------------------------------------------------------------------
Takes a json-formatted text as input and returns a swan dictionary.

```
dictObj = json.parse(jsonStr)
```
  
json.stringify - function
----------------------------------------------------------------------------
Takes a number as input and returns a stringify function:
```
stringifyFn = json.stringify(n)
```
- `n` is the number of indentation spaces to be used in the serialization
- `stringifyFn` is a function that takes a swan dictionary as input and 
  returns its json-string representation.
```
jsonStr = stringifyFn(dictObj)
```
  

