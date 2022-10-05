json module
============================================================================

This module contains functions for parsing and serializing JSON data.
  
`json.parse: Text t -> Dict Namespace d`
------------------------------------------------------------------------
Converts a JSON string to a Dict Namespace (see dict module).
  
`json.parse: Term t -> Text s`
------------------------------------------------------------------------
Converts a term to a JSON string. It returns `Undefined('Text')` if `t` 
is a `Func` or an `Undefined` item.
  

