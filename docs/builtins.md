Swan Builtins
============================================================================

The swan builtins is a collection of functions and constants that are
always present in a swan context.
  
dom: Mapping m -> Tuple t
------------------------------------------------------------------------
Returns the domain of the passed mappings m, which is:

- The tuple (0,1,2,...,size(m)-1) if m is a Text item
- The tuple (0,1,2,...,size(m)-1) if m is a List item
- The tuple of the name mapped by m if m is a Namespace item

If m is not a Mapping item, it returns Undefined Term.
If the argument is a tuple, it applies only to its first item.
  
require: Text id -> Namespace m
----------------------------------------------------------------------------
This function loads the swan standard module identified by `id` and returns
it as a Namespace item.

If `id` is a tuple, it applies only to its first item.
  
size: Mapping m -> Numb n
------------------------------------------------------------------------
Returns the number of mappings in m, which is:

- The number of characters if m is a Text item
- The number of items if m is a List item
- The number of names:value pairs if m is a Namespace item

If m is not a Mapping item, it returns Undefined Number.
If the argument is a tuple, it applies only to its first item.
  
type: Item x -> Text t
----------------------------------------------------------------------------
Given any item it returns the name of its type: `"Bool"` for Bool items,
`"Numb"` for Numb items, etc.

If `x` is a tuple, it returns a tuple of type names.
  
this: Namespace
----------------------------------------------------------------------------
This function returns the current context.
  
Bool: Term t -> Bool b
----------------------------------------------------------------------------

Given a swan term X, the `bool.from` function returns TRUE if the
term is truty, otherwise it returns FALSE.

Falsy elements are: `FALSE`, `0`, `""`, `[]`, `{}`, `()`, an any 
Undefined item and any tuple containing only falsy elements.

Any other term is truty.
  
Bool.not: Term t -> Bool b
----------------------------------------------------------------------------

Given a swan term X, the `Bool.not` function returns FALSE if the
term is truty, otherwise it returns TRUE.

For the definition of truty and falsy terms, see `Bool`.
  
Bool.TRUE: Bool
----------------------------------------------------------------------------
This constant represent the boolean true value in swan.
  
Bool.FALSE: Bool
----------------------------------------------------------------------------
This constant represent the boolean false value in swan.
  
Numb.parse: Text s -> Numb n
------------------------------------------------------------------------
Converts a string to a number. It accepts also binary (0b...), octal
(0o...) and exadecimal (0x...) string representations of numbers.

If the argument is not a valid string, this function returns Undefined Number.
If the argument is a tuple, only the first item will be considered.
  
Numb.tuple: Numb n -> Numb Tuple r
----------------------------------------------------------------------------
Given a number `n`, this function returns the tuple of integers
(0, 1, 2, ..., m), where m is the highest integer lower than m.

For example:
- `Numb.tuple 4` returns `(0,1,2,3)`
- `Numb.tuple 5.1` return `(0,1,2,3,4,5)`

If `n` is not a number, this function returns Undefined Tuple.
If `n` is a tuple, only its first item will be considered.
  
Text: Term t -> Text s
------------------------------------------------------------------------
The `Text` function takes any term `X` as argument and converts it into a Text
item according to the following rules:
- if `X` is a `Bool` item it either returns `"TRUE"` or `"FALSE"`
- if `X` is a `Numb` item it returns the number as a string
- if `X` is a `Text` item it teturns `X`
- if `X` is a `List` item it returns `"[[List of <n> items]]"` where 
  `<n>` is the size of `X`
- if `X` is a `Namespace` item it returns `"[[Namespace if <n> items]]"` where
  `<n>` is the size of `X`.
- if `X` is a `Namespace` item and `X.__text__` is a Text item, it returns 
  `X.__text__(X)`.
- if `X` is a `Func` item, it returns `"[[Func]]"`
- if `X` is an `Undefined` item it returns `"[[Undefined <type>]]"`,
  where `<type>` is the Undefined operaton type.
- if `X` is a `Tuple` term, it returns the concatenation of all its
  items stringified with `Text.from`.
    - As a particular case, if `X` is an empty tuple, it returns `""`
  
Text.find: Text s -> Text S -> Numb k
------------------------------------------------------------------------
Takes a string `s` as argument and returns a function `f`. 
If the argument is a tuple, it applies only to its first item.

The returned function `f`: 
- takes a string `S` as argument and returns the first position of `s` 
  in `S` or `-1` if `s` is not contained in `S`.
- returns Undefined Number if the argument of `f` is not a Text item
- applies only on the first item if the parameter of `f` is a tuple
  
Text.rfind: Text s -> Text S -> Numb k
------------------------------------------------------------------------
Takes a string `s` as argument and returns a function `f`.
If the argument is a tuple, it applies only to its first item.

The returned function `f`: 
- takes a string `S` as argument and returns the last position of `s` 
  in `S` or `-1` if `s` is not contained in `S`.
- returns Undefined Number if the argument of `f` is not a Text item
- applies only on the first item if the parameter of `f` is a tuple
  
Text.lower: Text S -> Text s
------------------------------------------------------------------------
Returns the passed string in lower-case. 
If the argument is not a Text item, this functions return Undefined text.
If the parameter is a tuple, this function applies to its first item only.
  
Text.upper: Text s -> Text S
------------------------------------------------------------------------
Returns the passed string in upper-case. 
If the argument is not a Text item, this functions return Undefined text.
If the parameter is a tuple, this function applies to its first item only.
  
Text.trim: Text S -> Text s
------------------------------------------------------------------------
Removed the leading and trailing spaces from the given string.
If the argument is not a Text item, this functions return Undefined Text.
If the parameter is a tuple, this function applies to its first item only.
  
Text.trim_head: Text S -> Text s
------------------------------------------------------------------------
Removed the leading spaces from the given string.
If the argument is not a Text item, this functions return Undefined Text.
If the parameter is a tuple, this function applies to its first item only.
  
Text.trim_tail: Text S -> Text s
------------------------------------------------------------------------
Removed the trailing spaces from the given string.
If the argument is not a Text item, this functions return Undefined Text.
If the parameter is a tuple, this function applies to its first item only.
  
Text.head: Numb n -> Text S -> Text s
------------------------------------------------------------------------
Takes a number `n` as argument and returns a function `f`.
If the argument is a tuple, it applies only to its first item.

The returned function `f`: 
- takes a string `s` as argument and returns the substring at the 
  left-side of the n-th character. If n is negative, the character 
  position is computed as relative to the end of `L`.
- returns Undefined Text if the argument of `f` is not a Text item
- applies only on the first item if the parameter of `f` is a tuple
  
Text.tail: Numb n -> Text S -> Text s
------------------------------------------------------------------------
Takes a number `n` as argument and returns a function `f`.
If the argument is a tuple, it applies only to its first item.

The returned function `f`: 
- takes a string `s` as argument and returns the substring at the 
  right-side of the n-th character (including the latter). If n is 
  negative, the character position is computed as relative to the 
  end of `S`.
- returns Undefined Text if the argument of `f` is not a Text item
- applies only on the first item if the parameter of `f` is a tuple
  
Text.split: Text s -> Text S -> List l
------------------------------------------------------------------------
Takes a string `s` as argument and returns a function `f`.
If the argument is a tuple, it applies only to its first item.

The returned function `f`: 
- takes a string `S` as argument and returns the list of substring 
  separated by s. For example, if the divider is `s=":"` and the string 
  is `S="a:b:c"`, the function `f` returns `["a","b","c"]`.
- returns Undefined Text if the argument of `f` is not a Text item
- applies only on the first item if the parameter of `f` is a tuple
  
Text.join: Text s -> List L -> Text S
------------------------------------------------------------------------
Takes a separator `s` as argument and returns a function `f`.
If the argument is a tuple, it applies only to its first item.

The returned function `f` takes a Tuple `t` of Text items as 
argument and returns the string obtained by joining all the items 
with interposed  sparator.
  
List.reverse: List l1 -> List l2
------------------------------------------------------------------------
Given a list l1, returns a new list l2, containing the items of l1 in
reversed order.
If the argument is not a List item, this function returns Undefined List.
If the parameter is a tuple, this function applies only to the first
item and ignore the others.
  
List.find: Item x -> List L -> Numb k
------------------------------------------------------------------------
Takes an item `x` as argument and returns a function `f`. If the 
argument is a tuple, it applies only to its first item.

The returned function `f`: 
- takes a list `L` as argument and returns the first position of `x` in 
  `L` or `-1` if `x` is not contained in `L`.
- returns Undefined List if the argument of `f` is not a List item
- applies only on the first item if the parameter of `f` is a tuple
  
List.rfind: Item x -> List L -> Numb k
------------------------------------------------------------------------
Takes an item `x` as argument and returns a function `f`. 
If the argument is a tuple, it applies only to its first item.

The returned function `f`: 
- takes a list `L` as argument and returns the last position of `x` in 
  `L` or `-1` if `x` is not contained in `L`.
- returns Undefined List if the argument of `f` is not a List item
- applies only on the first item if the parameter of `f` is a tuple
  
List.head: Numb n -> List L -> List l
------------------------------------------------------------------------
Takes a number `n` as argument and returns a function `f`. 
If the argument is a tuple, it applies only to its first item.

The returned function `f`: 
- takes a list `L` as argument and returns the sub-list at the left-side 
  of the n-th item. If n is negative, the item position is computed as 
  relative to the end of `L`.     
- returns Undefined List if the argument of `f` is not a List item
- applies only on the first item if the parameter of `f` is a tuple
  
List.tail: Numb n -> List L -> List l
------------------------------------------------------------------------
Takes a number `n` as argument and returns a function `f`. 
If the argument is a tuple, it applies only to its first item.

The returned function `f`: 
- takes a list `L` as argument and returns the sub-list at the 
  right-side of the n-th item (including the latter). If n is negative, 
  the item position is computed as relative to the end of `L`.     
- returns Undefined List if the argument of `f` is not a List item
- applies only on the first item if the parameter of `f` is a tuple
  
Namespace.parent: Namespace x -> Namespace p
------------------------------------------------------------------------
Given a namespace, returns its parent namespace or Undefined Namespace 
if the given namespace has no parent or if `x` is not a namespace.

If `x` is a tuple, it returns a tuple of parent namespaces.
  
Namespace.own: Namespace x -> Namespace o
------------------------------------------------------------------------
Given a namespace `x`, returns a copy of its own names, enclosed in a 
parent-less namespace. It returns Undefined Namespace if `x` is not 
a namespace.

If `x` is a tuple, it returns a tuple of own namespaces.
  
Func.ID: Term t -> Term t
--------------------------------------------------------------------
Takes any term and returns it unchanged.
  
Undefined: (Text t, Tuple a) -> Undefined u
----------------------------------------------------------------------------
This function returns an `Undefined` item with type `t` and arguments `a`.
  
Undefined.type: Undefined u -> Text t
--------------------------------------------------------------------
Given an undefined item, it returns its type as Text.

If `u` is not undefined returns Undefined Text
  
Undefined.args: Undefined u -> Tuple t
--------------------------------------------------------------------
Given an undefined item, it returns its arguments Tuple.

If `u` is not undefined returns Undefined Undefined
  

