Swan built-in functions
============================================================================
  
bool x
----------------------------------------------------------------------------
It returns `FALSE` if `x` is one of `()`, `FALSE`, `0`, `""`, `[]`, `{}` or
a tuple containing only items that bool to false.
In all the other cases it returns `TRUE`.
  
enum x
----------------------------------------------------------------------------
It returns the tuple of the items contained in x. In particular:
- if x is a list like `[x1, x2, x3, ...]`, it returns the tuple `(x1, x2, x3, ...)`
- if x is a string like `"abc..."`, it returns the tuple `('a', 'b', 'c', ...)`
- if x is a namespace like `{name1:val1, name2:val2, ...}`, it returns the tuple `('name1', 'name2', ...)`
It throws an error if x in not a string, a list or a namespace.
  
error msg
----------------------------------------------------------------------------
Throws an error with the given message.
If message is not a string, it throws a type error.
  
filter f [x1, x2, x3, ...]
----------------------------------------------------------------------------
Returns a sub-listnof the passed list, containing only the items `xi` that
verify the condition `bool(f xi) == TRUE`.
For example, `filter (x -> x>0) [0,1,-3,7,-12, 3]` returns `[1,7,3]`.
  
iter f x
----------------------------------------------------------------------------
The iter function takes a function as argument and return another function
`fn x` that takes a tuple `(a, b, c, ...)` as argument and returns
`(f(a), f(b), f(c) ...)`.
If the parameter passed to map is not a function, it throws an error.
  
map f x
----------------------------------------------------------------------------
The map function takes a function as argument and return another function
`fn x` that be have as follows:
- when `x = [x1, x2, x3, ...]` returns `[f(x1), f(x2), f(x3), ...]`
- when `x = {name1:val1, name2:val2, ...}` returns `{name1:f(val1), name2:f(val2), ...}`
- when `x` is of any other type, it trows an error
If the parameter passed to map is not a function, it throws an error.
  
not x
----------------------------------------------------------------------------
It returns `FALSE` if `bool x` is `TRUE` and vice-versa.
  
range n
----------------------------------------------------------------------------
Given a number `n`, it returns a tuple containing all the integers between
`0` (included) and `n` (excluded).
For example:
- `range 4` returns `(0, 1, 2, 3)`
- `range 3.2` returns `(0, 1, 2)`
- `range -6` returns `(0, -1, -2, -3, -4, -5)`
- `range -3.9` returns `(0, -1, -2)`
It throws an error if `n` is not a number.
  
reduce f
----------------------------------------------------------------------------
Takes a function of two parameters `f(a,b)` and returns a reducer function `r`.
The reducer function `r` takes a tuple of parameters `(x1, x2, x3, ...)` and
reduces them to a single value as follows:
- accumulator = x1
- accumulator = f(accumulator, x2)
- accumulator = f(accumulator, x3)
- ...
The value of `accumulator` after iterating over all the `r` arguments, is
the return value of `r`.
If a single value `x` is passed to `r`, `r(x)` will return x.
If `r` is called with no arguments, `r()` will return `()`.
  
size x
----------------------------------------------------------------------------
Returns the number of items contained in the passed object x.
- if `x` is a string, it returns the number of characters of the string
- if `x` is a list, it returns the number of items in the list
- if `x` is a namespace, it returns the number of names it contains
- if `x` is of any other type, it throws an error
  
str x
----------------------------------------------------------------------------
The `str` function convers `x` to a string as follows:
- if `x` is an empty tuple, it resolves to an empty string `""`
- if `x` is `TRUE`, it resolves to `"TRUE"`
- if `x` is `FALSE`, it resolves to `"FALSE"`
- if `x` is a number, it stringifies the number (e.g. `str 1.23` resolves to `"1.23"`)
- if `x` is a string, it resolves to `x` itself
- if `x` is a list, it resolves to `"[[List of n items]]"`, where `n` is the number
  of items in the list
- if `x` is a namespace, it resolves to `"[[Namespace of n items]]"`, where
  `n` is the number of names contained in the namespace
- if `x` is a namespace and `x.__str__` is a function, it returns `x.__str__(x)`
- if `x` is a Swan function, it resolves to the function source
- if `x` is a javascript function, it resolves to `"[[Function]]"`
- if `x` is a tuple `(x1,x2,x3,...)`, it resolves to `(str x1) + (str x2) +
  (str x3) + ...`
  
type x
----------------------------------------------------------------------------
This function returns a string containing the type name of the passed object.
In detail, it returns:
- It returns `"Nothing"` if x is `()` or a JavaScript `null`, `undefined` or `NaN`
- It returns `"Boolean"` if x is true or false
- It returns `"Number"` if x is a number
- It returns `"String"` if x is a string
- It returns `"List"` if x is an list or a javascript array
- It returns `"Namespace"` if x is a swan namespace or a JavasCript object
- It returns `"Function"` if x is a function
- It returns `"Tuple"` if x is a tuple containing more than one item
  

