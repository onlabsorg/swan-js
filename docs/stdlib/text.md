text - swan stdlib module
============================================================================
This module contains functions to manupulate strings of text.
  
text.find - function
----------------------------------------------------------------------------
Returns the index of the first occurrence of a sub-string inside a given
string. It returns -1 if the sub-string is not contained in the given string.
```
index = text.find(str, subStr)
```
  
text.rfind - function
----------------------------------------------------------------------------
Returns the index of the last occurrence of a sub-string inside a given
string. It returns -1 if the sub-string is not contained in the given string.
```
index = text.rfind(str, subStr)
```
  
text.lower - function
----------------------------------------------------------------------------
Returns the lower-case transformation of a given string.
```
loStr = text.lower(str)
```
  
text.upper - function
----------------------------------------------------------------------------
Returns the upper-case transformation of a given string.
```
upStr = text.upper(str)
```
  
text.char - function
----------------------------------------------------------------------------
Returns a string given the numeric code of its characters.
```
str = text.char(ch1, ch2, ch3, ...)
```
  
text.code - function
----------------------------------------------------------------------------
Returns the list of the numeric codes of the characters composing a string.
```
cList = text.code(str)
```
  
text.slice - function
----------------------------------------------------------------------------
Given a string, it returns the sub-string between a start index and an end index.
```
subStr = text.slice(str, startIndex, endIndex)
```
- The character at the end index is not included in the sub-string
- Negative indexes are assumed to be relative to the end of the sting
- If the end index is missing, it slices up to the and of the string
  
text.split - function
----------------------------------------------------------------------------
Given a string and a separator, it returns the list of the strings between the
separator.
```
subStr = text.split(str, separator)
```
  
text.replace - function
----------------------------------------------------------------------------
Given a string `s`, it returns a new string obtained by replacing all the
occurrencies of a `searchStr` with a `replacementStr`.
```
rStr = text.replace(s, searchStr, replacentStr)
```
  
text.trim - function
----------------------------------------------------------------------------
Given a string `s`, it returns a new string obtained by replacing both the
leading and trailing spaces.
```
ts = text.trim(s)
```
  
text.trimStart - function
----------------------------------------------------------------------------
Given a string `s`, it returns a new string obtained by replacing the leading
spaces.
```
ts = text.trimStart(s)
```
  
text.trimEnd - function
----------------------------------------------------------------------------
Given a string `s`, it returns a new string obtained by replacing the trailing
spaces.
```
ts = text.trimEnd(s)
```
  

