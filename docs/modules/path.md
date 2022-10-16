path module
============================================================================

The `path` module contains functions for manipulating file paths.
  

  
`path.join: Tuple chunks -> Text p`
------------------------------------------------------------------------
Given a tuple of path chunks, joins them together in a single path and
resolves `.` and `..` segments.
  
`path.join: Tuple chunks -> Tuple segments`
------------------------------------------------------------------------
Given a path, returns all its segments, after normalizing it. If a 
chunk of partial paths is passed, it joins the chunks first.
  

