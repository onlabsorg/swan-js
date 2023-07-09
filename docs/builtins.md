Swan Builtins
============================================================================

The swan builtins is a collection of functions and constants that are
always present in a swan context.
  
`require: Text id -> Namespace m`
----------------------------------------------------------------------------
This function loads the swan standard module identified by `id` and returns
it as a Namespace item.
If `id` is a tuple, it returns the corresponding tuple of modules.
  
`type: Item x -> Text t`
----------------------------------------------------------------------------
Given any item, it returns the name of its type; i.e.:

- it returns`"Bool"` if x is a Bool item
- it returns`"Numb"` if x is a Numb item
- it returns`"Text"` if x is a Text item
- it returns`"List"` if x is a List item
- it returns`"Namespace"` if x is a Namespace item
- it returns`"Func"` if x is a Func item
- it returns`"Undefined"` if x is an Undefined item

If `x` is a tuple, it returns a tuple of type names. As a consequence of
this behavior, it returns `()` if `x` is an empty Tuple.
  
`this: Namespace`
----------------------------------------------------------------------------
This name always maps to the current context.
  
`TRUE: Bool`
----------------------------------------------------------------------------
This constant represent the boolean true value in swan.
  
`FALSE: Bool`
----------------------------------------------------------------------------
This constant represent the boolean false value in swan.
  
`bool: Term x -> Bool b`
----------------------------------------------------------------------------
Given a swan term `x`, the `bool` function returns:
- `FALSE` if x is `FALSE`
- `FALSE` if x is `0`
- `FALSE` if x is `""`
- `FALSE` if x is `[]`
- `FALSE` if x is `{}`
- `FALSE` if x is `()`
- `FALSE` if x is an `Undefined` item
- `FALSE` if x is a tuple containing only items that booleanize to `FALSE`
- `TRUE` in any other case
  
`not: Term x -> Bool b`
----------------------------------------------------------------------------
Given a swan term `x`, the `not` function returns:
- `FALSE` if `bool x` returns `TRUE`
- `TRUE` if `bool x` returns `FALSE`
  
enum: Term x -> Tuple t
-------------------------------------------------------------------------
Converts the term `x`` to a tuple, according to the tollowing rules:
- if x is a Numb item, it returns (0, 1, 2, ...) up to the first integer smaller than x
- if x is a Text item, it returns the tuple of all the characters of x
- if x is a List item, it returns the tuple of all the items of x
- if x is a Namespace item, it returns the tuple of all the names of x
For any other type, it returns Undefined Enumeration.
If x is a tuple `(x1, x2, ...)` it returns `(enum x1, enum x2, ...)`.
  
tsize: Term t -> Numb n
-------------------------------------------------------------------------
Given a tuple `t` it returns the number of items it contains. Consistently,
it returns `1` if `t` is an item and `0` if `t` is the empty tuple.
  
msize: Mapping m -> Numb n
-------------------------------------------------------------------------
Given a Mapping item `m` it returns the number of items it contains, or
undefined("Size") if m is not a Mapping item.
If `m` is a tuple, it returns a tuple of mapping sizes.
  
`str: Term X -> Text s`
------------------------------------------------------------------------
The `str` function takes any term `X` as argument and converts it
to a Text item according to the following rules:
- if `X` is a `Bool` item it either returns `"TRUE"` or `"FALSE"`
- if `X` is a `Numb` item it returns the number as a string
- if `X` is a `Text` item it teturns `X`
- if `X` is a `List` item it returns `"[[List of <n> items]]"` where
    . *    `<n>` is the size of `X`
- if `X` is a `Namespace` item it returns `"[[Namespace of <n> items]]"`
  where `<n>` is the size of `X`.
- if `X` is a `Namespace` item and `X.__str__` is a Text item, it
  returns `X.__str__`.
- if `X` is a `Namespace` item and `X.__str__` is a Func item, it
  returns `X.__str__(X)`.
- if `X` is a `Func` item, it returns `"[[Func]]"`
- if `X` is an `Undefined` item it returns `"[[Undefined <type>]]"`,
  where `<type>` is the Undefined operaton type.
- if `X` is a `Tuple` term, it returns the concatenation of all its
  items stringified with `Text`. As a particular case, if `X` is an
  empty tuple, it returns `""`
  
`parent: Namespace x -> Namespace p`
------------------------------------------------------------------------
Given a Namespace `x`, returns its parent namespace or `Undefined Namespace`
if the `x` has no parent or if `x` is not a Namespace item. If `x`
is a tuple, it applies to all its items.
  
`own: Namespace x -> Namespace o`
------------------------------------------------------------------------
Given a namespace `x`, returns a copy of its own names, enclosed in a
parent-less namespace. It returns Undefined Namespace if `x` is not
a namespace. If `x` is a tuple, it applies to all its items.
  
`undefined: (Text t, Tuple a) -> Undefined u`
----------------------------------------------------------------------------
This function returns an `Undefined` item with type `t` and arguments `a`.
  

