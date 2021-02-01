path - swan stdlib module
============================================================================
This module contains functions to manipulate file path strings.
  
path.dir - function
------------------------------------------------------------------------
Given a path `p`, it returns the path without the terminal segment.
```
dirPath = path.dir(p)
```
  
path.fullName - function
------------------------------------------------------------------------
Given a path `p`, it returns the terminal segment.
```
name = path.fullName(p)
```
  
path.name - function
------------------------------------------------------------------------
Given a path `p`, it returns the terminal segment, without extension.
```
pathName = path.name(p)
```
  
path.ext - function
------------------------------------------------------------------------
Given a path `p`, it returns the extension of the terminal segment.
```
pathExt = path.ext(p)
```
  
path.normalize - function
------------------------------------------------------------------------
Given a path `p`, it returns an equivalent path, after resolving `.`,
`..` and multiple `/`.
```
nPath = path.normalize(p)
```
  
path.join - function
------------------------------------------------------------------------
Given a tuple of paths, it returns a signle path obtained by
concatenating them.
```
jPath = path.join(p1, p2, p3, ...)
```
  
path.resolve - function
------------------------------------------------------------------------
Given a tuple of paths, it resolves a sequence of paths or path segments
into an absolute path.
```
absPath = path.resolve(p1, p2, p3, ...)
```
  

