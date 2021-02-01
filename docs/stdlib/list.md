list - swan stdlib module
============================================================================
This modules contains functions to manipulate swan lists.
  
list.find - function
----------------------------------------------------------------------------
Returns the index of the fists occurrence of an item inside a list. It
returns -1 if the given item is not contained in the list.
```
index = list.find(lst, item)
```
  
list.rfind - function
----------------------------------------------------------------------------
Returns the index of the last occurrence of an item inside a list. It
returns -1 if the given item is not contained in the list.
```
index = list.rfind(lst, item)
```
  
list.join - function
----------------------------------------------------------------------------
Given a list of strings, returns the string obtained by concatenating
all the item, optionally with an interposed separator.
```
str = list.join(strList, separator)
```
  
list.reverse - function
----------------------------------------------------------------------------
Returns a list containing all the item of a given list, but in reversed
oredr.
```
rList = list.reverse(lst)
```
  
list.slice - function
----------------------------------------------------------------------------
Returns the portion of a given list, between a startIndex (included) and
an endIndex (not included). Negative indexes are computed from the end
of the list.
```
subList = list.slice(lst, startIndex, endIndex)
```
If `endIndex` is omitted, it slices up to the end of `lst`.
  

