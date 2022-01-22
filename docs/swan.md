# Swan language

`Swan` is a an interpreted expression language. 

Syntactically speaking, a swan expression is a sequence of binary operations
`(operand operator operand operator operand ...)`, eventually grouped with 
parenthesis `(...)`, square braces `[...]` or curly braces `{...}`. Finally,
there are [line comments](#comments): `# any text at the end of the line`.

For example:
```
(12 + 2) * 3 - 4   # expression resolving to 38
```

Each operand of a swan expression is a `Term`, which can be either an `Item` or 
a [Tuple](#tuple-data-type-and-pairing-operator). An Item holds a single value, 
while a Tuple is a sequence of Items: a product type. Any Item is also isomorphic 
to a 1-d Tuple, while the empty Tuple `()` is the swan unit type, used to
represent the concept of nothingness. 

The Item types defined in swan are:

- [Bool](#boolean-data-type) type, representing booleans (either `TRUE` or `FALSE`) 
- [Numb](#numeric-data-type) type, representing real numbers (e.g. `-123.4e3`)
- `Applicable` type, an abstract data type representing any Item for which an 
  apply operation is defined
- `Mapping` type, an abstract Applicable representing discrete mappings
- [Text](#string-data-type) type, a Mapping between integer numbers and 
  characters (e.g. `"abc"`).
- [List](#list-data-type) type, a Mapping between integer numbers and Items
- [Namespace](#namespace-data-type) type, a Mapping between identifiers and
  Terms
- [Func](#function-data-type) type, an Applicable representing a function
- [Undefined](#undefined-data-type) type, an Item representing an undefined
  operation or value (swan expressions never fail; they rather return undefined 
  values)

The following operators are defined in swan (see also the 
[operators precedence](#operators-precedence)): 

- [Arithmetic operators](#arithmetic-operators): `+`, `-`, `*`, `/`, `%`, `**`
- [Comparison operators](#comparison-operators): `==`, `!=`, `>`, `>=`, `<`, `<=`
- [Logic operators](#logic-operators): `&`, `|`
- [Selection operators](#selection-operators): `?`, `;`
- [Pairing operator](#tuple-data-type-and-pairing-operator): `,`
- [Application operator](#application-operator) (empty operator): ` `
- [Function definition operator](#function-data-type): `->`
- [Function composition operators](#composition-operators): `<<`, `>>`
- [Mapping operator](#mapping-operator): `=>`
- [Assignment operators](#names-and-assignment-operators): `=`, `:`
- [Subcontexting operator](#subcontexting-operator): `.`
- [Unary operators](#unary-operators): `+`, `-`

The swan built-in functions are:

- [bool](#bool-function): converts a value to boolean
- [not](#not-function): returns `FALSE` if `bool x` is true, otherwise `TRUE`
- [enum](#enum-function): enumerates its argument to a tuple
- [size](#size-function): returns the number of items in a container (String, List or Namespace)
- [str](#str-function): converts its argument to a string
- [type](#type-function): returns the type name of its argument
- [undefined](#undefined-data-type): generates an undefined value
- [require](#require-function): loads a [standard library](./modules.md) module

The built-in constants are:

- `TRUE`: ...
- `FALSE`: ...


## Boolean data type
An Boolean item can be either true or false. Booleans can be created either
- by referencing the built-in constants `TRUE` and `FALSE`
- as return value of comparison expressions
- as result of calling the [bool](#bool-function) function or the 
  [not](#not-function) function


## Numeric data type
A number can be created either 

- by explicitly defining it as a literal (e.g `10`, `13.14`, `-2.5e3`, ...)
- as return value of an arithmetic operation
- as result of the `size` function

The `INFINITY` constant is also a number an behaves like an infinity.


## String data type
A string is any sequence of characters, enclosed between one of the following
three types of quote:

* `"double quotes string"`
* `'single quotes string'`
* `` `accent quotes string` ``

A string within accent quotes is a template string. Within a template strings,
expressions eventually enclosed between `${` and `}` get evaluated and replaced. 
For example, the expression `` `2*10 = ${2*10}` `` returns the string `2*10 = 20`.


## Tuple data type and pairing operator
Tuples are an ordered sequence of values. They are created using the comma 
operator `,`. The following example shows a tuple made of three items: `1`, `2` 
and `"abc"`

```
1, 2, "abc"
```

Tuples can contain any other data type as items, except another tuple. If you
try to create a tuple of tuples, you get a flattened tuple as result: 
`(1,2),(3,4),5` is equivalent to `1,2,3,4,5`.

Any value in swan (e.g. `10` or `"abc"` or a list, etc.) is also seen as a
tuple made of only one item.

A special type of tuple is the empty tuple `()` which is used in swan to 
represent the concept of nothingness.


## List data type
A list is an ordered sequence of values, just like a tuple, but it behaves
like an item (one-element tuple). For this reason, it allows nesting and behaves 
differently from tuples.

A list is created as `[tuple]`. Examples of valid list literals are:

* `[1,2,"abc"]` list with three elements
* `[1]` list with only one element
* `[]` empty list
* `[[1,2],[3,4,5]]` list of lists


## Names and assignment operators
The **assignment operator** binds a name to an expression value:

```
x = 10 + 1
```

After this expression, the context will contain a name `x` with its associated 
value `11`. After defining `x` we can reuse it as follows:

```
x * 2
```

which will resolve to `22`.

Valid names can contain letters (`a..z` and `A..Z`), numbers (`0..9`) and the
underscore character (`_`), but they cannot start with a numeric character.

Every expression has a return value; in particular an assignment expression
`x = 10` returns `NOTHING` (the empty tuple in swan, equivalent to `null` in
JavaScript). 

Multiple values (a tuple of values) can be assigned to multiple names (a tuple 
of names) as follows:

```
(a, b, c) = (1, 2, 3)
```

After this expression, `a` will hold the value `1`, `b` will hold the value `2`
and `c` will hold the value `3`.

If the tuple of values contains less items than the tuple of names, the exceeding
names will be assigned nothing (empty tuple): `(a,b,c,d) = (1,2)` will result in
`a=1`, `b=2`, `c=()` and `d=()`.

If the tuple of values contains more items than the tuple of names, the last name
will be assigned the tuple of the remaining values: `(a,b,c) = (1,2,3,4,5)` will
result in `a=1`, `b=2` and `c=(3,4,5)`.

If the tuple of names is empty, no assignment will take place.

If any of the left-hand items is not a name or not a valid name, it will be
ignored. For example: 

- the expression `(a, 1, b) = (10, 20, 30)` will be equivalent to `(a,b) = (10,20,30)`
- the expression `[] = 3+2` will be equivalent to `() = 3+2`: it will return `()` 
  and result in no assignment at all


The **labeling operator** `:` works exactly as the assignment operator `=`, with
the only exception that the operation returns the right-hand value instead of
`NOTHING`. For example, the expression `x: 10 + 1` binds `11` to `x` and returns
`11`.


## Namespace data type
A namespace is a set of name-value pairs defined as `{tuple}`.

```
{
    x = 10,
    y = 20,
    z = 30
}
```

We basically assigned three values to three names, but those names are not 
available in the global context, but wrapped in the namespace object instead.

In order to access the names inside a namespace, you can use either the 
[referencing operator](#referencing-operator) `@` or the 
[subcontexting operator](#subcontexting-operator) `.`. For example: 

* `ns = {a=1, b=2, c=3}` defines a namespace and maps it to the name `ns`
* `ns.a` resolves to `1`
* `ns @ "b"` resolves to `2`


## Function data type
A function is a parametric expression, defined as `names -> expression`.
For example, the expression:

```
(x,y) -> x+y
```

defines a function that takes two parameters `x` and `y` as input and produces
their sum as output.

In order to execute a function, you use the [application operator](#Application-operator);
for example:

* `f = x -> 2*x` defines a function that takes one parameter and doubles it
* `f 4` resolves to `8`
* `f(5)` resolves to `10`


## Undefined data type
The undefined data type represents an operation that is not defined; for 
example the sum of a number and a list. 

An undefined value can be created using the `undefined` function which takes as
input a tuple of arguments that describe the undefined value.

```
u = undefined('demo', 10, 'abc', [1,2,3])
```

The `u` value returned by the above `undefined` function call is described by 
the tuple of arguments `('demo', 10, 'abc', [1,2,3])`. 

The undefined arguments can be totally arbitrary, but normally the first argument
is an operation identifier and it is followed by a tuple of operands.
For example, an undefined sum `X+Y` will return `undefined('sum', X, Y)`.

The arguments of an undefined value can be accessed via the selective undefined 
mapping operator `?>`. The `X ?> F` operation returns `X` if it is not undefined,
otherwise it calls the function `F` with the arguments of `X`. For example:

```
x+y ?> (op, x, y) -> str(op) + " between " + str x + " and " + str y + " failed!"
```

The `%>` operator can be used to *look inside* an undefined value or as a sort 
of try-catch expression. For example, the following expression tries a sum and 
returns 0 if the sum operation is undefined.

```
x + y %> args -> 0
```

If `X` is a tuple `(x1, x2, ...)`, the `X ?> F` operation resolves to  
`(x1 ?> F, x2 ?> F, ...)`.


## Application operator
A missing operator (two operands next to each other: `F X`), defines an 
application operation: `F` applied to `X`.

**When F is a function**, the application operation corresponds to a function 
call. Given a function `f: x -> 2*x`, the expression `f 5` is an application
operation (`f` applied to `5`) that resolves to `10`.

Since the expression `(5)` is equivalent to the expression `5`, you could also 
write the application operation in the more familiar form `f(5)`.

When the function parameter `x` is a tuple (e.g. `f: (x,y) -> x+y`), the 
application will look like `f(x,y)`. In this case the parenthesis are necessary, 
because `f x,y` would resolve to the tuple `(f x), y` instead.

Notice that assigning parameter values to tuple arguments works the same as 
tuple-values to tuple-names assignment:

* in `((x,y,z)->x+y+z)(1,2)` the parameter `x` will be `1`, the parameter `y` 
  will be `2` and the parameter `z` will be `()`
* in `((x,y)->x+y)(1,2,3)` the parameter `x` will be `1` and the parameter `y` 
  will be `(2,3)`
  
If the function `F` throws an error, the application operation resolves to
`undefined('failure', error)`.
  
**When F is a namespace and `F.__apply__` is a function**, the application
operation will call the `F.__apply__` function and resolve its return value or
`undefined('failure', error)` in case of error.
  
**When F is not a function**, the `F X` operation returns `undefined('application', F)`.

**When F is a tuple `(f1, f2, ...)`**, the `F X` operation returns the tuple
`(f1 X, f2 X, ...)`


## Referencing operator
Given a container `C` (namely a String, a List or a Namespace) and a reference 
`R` to one of the items it contains, the referencing operation `C @ R` returns 
the value of the referenced item.

**When C is a list and R is a number**, the `C @ R` operation returns the list 
item at position `R`. For example:

- `['a','b','c'] @ 0` will return `'a'`
- `['a','b','c'] @ 1` will return `'b'`
- `['a','b','c'] @ 2` will return `'c'`

If `R` is a negative number, it will be interpreted as relative to the end of the
list:

* `['a','b','c'] @ (-1)` will return `'c'`
* `['a','b','c'] @ (-2)` will return `'b'`
* `['a','b','c'] @ (-3)` will return `'a'`

If `R` is an out-of-range number or not a number, `C @ R` will return the empty 
tuple `()`.

**When C is a string and R is a number**, the `C @ R` operation returns the 
character at position `R`. For example:

- `"abc" @ 0` will return `'a'`
- `"abc" @ 1` will return `'b'`
- `"abc" @ 2` will return `'c'`

If `R` is a negative number, it will be interpreted as relative to the end of the
string:

* `"abc" @ (-1)` will return `'c'`
* `"abc" @ (-2)` will return `'b'`
* `"abc" @ (-3)` will return `'a'`

If `R` is an out-of-range number or not a number, `C @ R` will return the empty 
string `""`.

**When C is a namespace and R is a string**, the `C @ R` operation returns the 
item of `C` mapped to the name `R`. For example:

* `{a=1, b=2} @ "a"` will return `1`
* `{a=1, b=2} @ "b"` will return `2`

If `R` is a non-mapped name or not a name at all, `C @ R` will return the empty 
tuple `()`.

**When C and R are of any other type**, the `C @ R` operation returns 
`undefined('referencing', C, R)`.


## Unary operators
Swan defines two unary operators: `+` and `-`. 

The `+X` expression is equivalent to just `X`. 

The `-X` expression returns `-1*X` is X is a number and Undefined in all the 
other cases. If `X` is a tuple `(x1, x2, ...)`, the `-X` operation returns
`(-x1, -x2, ...)`.


## Arithmetic operators
The arithmetic operators are sum (`+`), subtraction (`-`), product (`*`),
division (`/`), modulo (`%`) and exponentiation (`^`).

#### Arithmetic operations between booleans
* `B1 + B2` returns the logic `or` between `B1` and `B2`
* `B1 * B2` returns the logic `and` between `B1` and `B2`

#### Arithmetic operations between numbers
The arithmetic operations between numbers work as expected:

* `5 + 2` returns `7`
* `5 - 2` returns `3`
* `5 * 2` returns `10`
* `5 / 2` returns `2.5`
* `5 % 2` returns `1`
* `5 ^ 2` returns `25`

#### Arithmetic operations on strings
The string type implements the sum operation between two strings and the product 
between a number and a string.

The sum `s1 + s2` between two strings returns the concatenation of the two 
strings. For example `"abc" + "def"` returns `"abcdef"`.

The product `n * s` between a number `n` and a string `s` is equivalent to 
`s * n` and returns the string `s` repeated `n` times. For example `3 * "Abc"`, 
as well as `"Abc" * 3` returns `"AbcAbcAbc"`.

#### Arithmetic operations on lists
The list type implements the sum operation between two lists and the product 
between a number and a list.

The sum `L1 + L2` between two lists returns the concatenation of the two lists.
For example `[1,2,3] + [4,5,6]` returns `[1,2,3,4,5,6]`.

The product `n * L` between a number `n` and a list `L` is equivalent to `L * n`
and returns the list `L` repeated `n` times. For example `3 * [1,2,3]`, as well 
as `[1,2,3] * 3` returns `[1,2,3,1,2,3,1,2,3]`.

#### Arithmetic operations between namespaces
The Namespace type implements only the sum operation.

The sum `ns1 + ns2` between two namespaces returns a new namespace obtained by
merging `ns1` and `ns2`. For example `{a=1,b=2} + {c=3,d=4}` returns 
`{a=1, b=2, c=3, d=4}`.

If `ns1` and `ns2` contain the same name, the value of `ns2` prevails. For
example `{a=1,b=2} + {b=3, c=4}` returns `{a=1, b=3, c=4}`.

#### Arithmetic operations between tuples
The sum of a tuple `t1=(x1,x2,x3)` and a tuple `t2=(y1,y2,y3)` is the tuple
`(x1+y1, x2+y2, x3+y3)`. The same goes for subtraction, product, division,
modulo and exponentiation.

If the two tuples have different number of items, the missing items are assumed
to be `()`. The empty tuple follows the rules listed below:

* `() + x` as well as `x + ()` resolves to `x`
* `x - ()` resolves to `x`
* `() - x` resolves to `undefined('subtraction', (), x)`, unless `x` is `()`
* `() * x` as well as `x * ()` resolves to `()`
* `() / x` resolves to `()`
* `x / ()` resolves to `undefined('division', x, ())`, unless `x` is `()`
* `() % x` resolves to `()`
* `x % ()` resolves to `undefined('modulo', x, ())`, unless `x` is `()`
* `() ^ x` resolves to `()`
* `x ^ ()` resolves to `undefined('exponentiation', x, ())`, unless `x` is `()`

#### Undefined arithmetic operations
For any other combination of types not mentioned above, the arithmetic operation
resolves to an undefined value:

- `x + y` resolves to `undefined('sum',x,y)`
- `x - y` resolves to `undefined('subtraction',x,y)`
- `x * y` resolves to `undefined('product',x,y)`
- `x / y` resolves to `undefined('division',x,y)`
- `x % y` resolves to `undefined('modulo',x,y)`
- `x ^ y` resolves to `undefined('exponentiation',x,y)`



## Comparison operators
The comparison operations compare two values and return `TRUE` or `FALSE`. 
Swan defines the following comparison operators:
* Equal: `==`
* Not equal: `!=` 
* Less than: `<`
* Less than or equal to: `<=`
* Greater than: `>`
* Greater than or equal to: `>=`

#### Comparison operations between booleans
Two booleans are equal if they are both true or both false. Furthermore false
is less than true.

#### Comparison operations between numbers
The comparison between numbers works as expected. For example, the following
expressions resolve to true:

* `10 == 10`
* `10 != 11`
* `10 < 11`
* `10 <= 11`
* `10 <= 10`

#### Comparison operations between strings
Two strings are equal if they contain the same sequence of characters. For
example `"abc" == "abc"` is true.

A string `s1` is less than a string `s2` if `s1` precedes `s2` alphabetically.
For example, the following expressions return true:

* `"abc" < "xyz"`
* `"zzz" > "aaa"`

#### Comparison operations between lists
Two lists are equal if they contain the same sequence of items. For
example `[1,2,3] == [1,2,3]` is true, but `[1,2,3] == [1,2]` is false.

A list `L1` is less than a list `L2` if `L1` precedes `L2` lexicographically.
For example, the following expressions return true:

* `[1,2,3] < [4,5,6]`
* `[1,2,3] < [1,2,4]`
* `[1,3,4] > [1,2,4]`

#### Comparison operations between namespaces
Two namespaces are equal if they contain the same set of name-value pairs.
For example `{a=1,b=2} == {a=1,b=2}` is true, but `{a=1,b=2} == {a=1,b=4,c=5}`
is false.

No order is defined for the namespace type, therefore only the `==` and `!=`
operators will work between namespaces. All the other comparison operations 
between namespaces will return `undefined('comparison', ns1, ns2)`.

#### Comparison operations between functions
Two functions are equal if they are the same function. For example, given two
functions `f1:x->2*x` and `f2:x->2*x`, the expression `f1 == f1` is true, but
the expression `f1 == f2` is false.

No order is defined for the function type, therefore only the `==` and `!=`
operators will work between functions. All the other comparison operations 
between functions will return `undefined('comparison',f1,f2)`.

#### Comparison operation between two undefined values
Two undefined values are equal if they are the same undefined value.

No order is defined for the Undefined type, therefore only the `==` and `!=`
operators will work between undefined values. Any other comparison operation 
between two undefined values `u1` and `u2` will return `undefined('comparison',u1,u2)`.

#### Comparison operations between tuples
Two tuples are equal if they contain the same sequence of items. For
example `(1,2,3) == (1,2,3)` is true, but `(1,2,3) == (1,2)` is false.

A tuple `t1` is less than a tuple `t2` if `t1` precedes `t2` lexicographically.
For example, the following expressions return true:

* `(1,2,3) < (4,5,6)`
* `(1,2,3) < (1,2,4)`
* `(1,3,4) > (1,2,4)`

If the two tuples have different number of items, the missing items are assumed
to be `()`. The empty tuple is less than anything else and equal only to itself.

#### Undefined comparison operations
For any other combination of types not mentioned above, the comparison operations
returns `undefined('comparison',x,y)`.



## Logic operators
The logic operators AND (`&`) and OR (`|`) generalize the logic AND/OR to any
value type. 

The AND operation `A & B` returns `A` if `bool A` is false, otherwise it
returns `B`. For example:

- `1 & 2` resolves to `2`
- `0 & 1` resolves to `0`

The OR operation `A | B` returns `A` if `bool A` is true, otherwise it returns 
`B`. For example:

- `1 | 2` resolves to `1`
- `0 | 1` resolves to `1`

Both `A & B` and `A | B` will return `bool A` if it is undefined.



## Selection operators
A conditional expression `X ? Y` resolves to `Y` if `bool X` is true; otherwise 
it resolves to `()`. It resolves to `bool X` if it is undefined. For example:

* `2 > 1 ? "ok"` resoves to `"ok"`
* `2 < 1 ? "ok"` resoves to `()`
* `"abc" ? "ok"` resoves to `"ok"`
* `"" ? "ok"` resoves to `()`

An alternative expression `X ; Y` resolves to `X` if it is not an empty tuple;
otherwise it resolves to `Y`. Undefined values, are considered to be non-empty 
tuples. For example:

* `() ; 3` resolves `3`
* `10 ; 2` resolves `10`

When combined together, the conditional and the alternative expression work as
an if-else condition:

* `1==1 ? "eq" ; "ne"` resolves to `"eq"`
* `1==2 ? "eq" ; "ne"` resolves to `"ne"`



## Subcontexting operator
When you assign a value to a name with `name = value`, you are defining that 
name in the global namespace and you can access the associated value as `name` 
in another expression.

When you assign a value to a name between curly braces `{name1=10, name2=20}`,
you are defining names in a sub-namespace and you can access the associated 
values with a referencing operation `{a=1} @ "a"`.

A subcontexting operation `ns . expression` executes the right-hand expression
in a sub-context obtained by extending the parent context with the names 
contained in the namespace `ns`.

For example, `{a=2,b=3}.(a+b)` will resolve to `5`.

The global names are still visible in the righ-hand expression, unless they are
overridden by local namespace names. For example:

```
x = 10,
y = 20,
ns = {x=100, z=300},
sum = ns.(x+y+z)
```

The `sum` name will map to the value `420`. In fact, in the right-hand expression
`x+y+z`, the names `x` and `z` will be found in `ns`, while the name `y` will
not be found in `ns` and will be taken from the global namespace.

The subcontexting can be also used as an alternative way to access names defined
inside a namespace. In the example above, the expression `ns.z` will indeed
resolve to the value of `z` inside the namespace `ns`.

If the left-hand operand `X` of a subcontexting operation `X.Y` is not a 
Namespace, the subcontexting operation returns `undefined('subcontexting', X)`.



## Composition operators
--------------------------------------------------------------------------------
The composition operation `g << f` returns the function `x -> g(f x)`. For 
example:

```
f = x -> 2*x, 
g = x -> x+1, 
h = g << f,
h 4     # resolves to 9, obtained as (2*4)+1
```

The reverse composition operation `g >> f` returns the function `x -> f(g x)`.
For example:

```
f = x -> 2*x, 
g = x -> x+1, 
h = g >> f,
h 4     # resolves to 10, obtained as 2*(4+1)
```


## Mapping operator
--------------------------------------------------------------------------------
The mapping operator `t => f` takes a tuple `t = (a, b, c, ...)` and a function
`f` and returns the tuple `f(a), f(b), f(c), ...`. For example:

```
(1,2,3) => x -> 2*x     # returns (2,4,6)
```

Notice that when the mapping function `f` returns an empty tuple `()`, its value 
will be ignored in the mapped tuple, because that's just how tuples work. This 
means that the mapping operator can be also used to filter tuples. For example:

```
isEven = x -> x % 2 == 0            # returns TRUE if x is an even number
ifEven = x -> isEven(x) ? x ; ()    # returns x if it is an even number, or esle ()
(1,2,3,4,5) => ifEven               # returns (2,4) 
```



## Operators precedence
Unless grouping parenthesis are used, the operations are executed in the following
order.

1. application , `.`, `@`
2. `^`
3. `*` , `/`, `%`
4. `+` , `-`
5. `==` , `!=` , `<` , `<=` , `>=` , `>`
6. `&` , `|`
7. `?`
8. `;`
9. `->`
10. `<<`, `>>` 
11. `=>`, `%>`
12. `=` , `:`
13. `,`

If the expression contains two or more operators with the same rank, the
leftmost operation gets executed first.

The only exception to this rule is the function creation operation `->`, for 
which the right-most operations get executed first. For example, the 
expression `x -> y -> x+y` is equivalent to `x -> (y -> x+y)`.



## bool function
The `bool` function takes an argument `X` and returns: 

- `FALSE` if `X` is one of `()`, `FALSE`, `0`, `""`, `[]`, `{}` or if it is a
  Tuple and all its items booleanize to `FALSE`
- `undefined('booleanization', x)` if `X` is undefined or if it is a Tuple with at
  least one undefined item. If `X` is a tuple, the `x` parameter passed to the 
  `undefined` function is the first undefined item of `X`.
- `TRUE` in all the other cases


## not function
The `not` function takes an argument `X` and returns: 

- `TRUE` if `X` is one of `()`, `FALSE`, `0`, `""`, `[]`, `{}` or if it is a
  Tuple and all its items booleanize to `FALSE`
- `undefined('booleanization', x)` if `X` is undefined or if it is a Tuple with at
  least one undefined item. If `X` is a tuple, the `x` parameter passed to the 
  `undefined` function is the first undefined item of `X`.
- `FALSE` in all the other cases


## enum function
The `enum` function takes a parameter `X` and returns a Tuple.

- if `X` is a list like `[x1, x2, x3, ...]`, it returns the tuple `(x1, x2, x3, ...)`
- if `X` is a string like `"abc..."`, it returns the tuple `('a', 'b', 'c', ...)`
- if `X` is a namespace like `{name1:val1, name2:val2, ...}`, it returns the tuple 
  `('name1', 'name2', ...)`
- if `X` is a positive number it returns `(0, 1, 2, ..., n)`, where `n` is the
  biggest integer which is less than `X`
- if `X` is a negative number it returns `(0, -1, -2, ..., n)`, where `n` is the
  smallest integer which is greater than `X`
- if `X` is undefined, it returns `undefined('enumeration', X)`

In genral, if X is a Tuple `(x1, x2, ...)`, the function `enum X` returns 
`(enum x1, enum x2, ...)`.


## size function
The `size` function takes a parameter `X` and returns a number.

- if `X` is a list, it returns the number of items in the list
- if `X` is a string, it returns the number of characters in the string
- if `X` is a namespace, it returns the number or names in the namespace
- if `X` is of any other type, it returns `undefined('size', X)`

In general, if `X` is a Tuple `(x1, x2, ...)`, the `size X` function returns
`(size x1, size x2, ...)`.


## str function
The `str` function convers any parameter `X` to a string as follows:

- if `X` is `TRUE`, it resolves to `"TRUE"`
- if `X` is `FALSE`, it resolves to `"FALSE"`
- if `X` is a number, it stringifies the number (e.g. `str 1.23` resolves to `"1.23"`)
- if `X` is a string, it resolves to `X` itself
- if `X` is a list, it resolves to `"[[List of n items]]"`, where `n` is the number
  of items in the list
- if `X` is a namespace, it resolves to `"[[Namespace of n items]]"`, where
  `n` is the number of names contained in the namespace
- if `X` is a namespace and `X.__str__` is a string, it resolves to `X.__str__`
- if `X` is a function, it resolves to `"[[Function]]"`
- if `X` is undefined, it resolves to `"[[Undefined]]"`

In general, if `X` is a tuple `(x1,x2,x3,...)`, then `str X` resolves to 
`(str x1) + (str x2) +  (str x3) + ...`. As a consequence of this behavior, if
`X` is an empty tuple, it resolves to an empty string.


## type function
The `type` function takes a parameter `X` and returns its type name.

- if `X` is a boolean, it returns `"Boolean"`
- if `X` is a number, it returns `"Number"`
- if `X` is a string, it returns `"String"`
- if `X` is a list, it returns `"List"`
- if `X` is a namespace, it returns `"Namespace"`
- if `X` is a function, it returns `"Function"`
- if `X` is undefined, it returns `"Undefined"`

In general, if `X` is a Tuple `(x1, x2, ...)`, the `type X` function returns
`(type x1, type x2, ...)`. As a consequence of this behavior, if `X` is an
empty tuple, `type X` returns `()`.


## require function
Swan has a [standard library](./modules.md) containing javascript modules that 
can be imported in the expression scope as namespaces using the `require` 
function. For example, the swan expression `require 'math'` returns the exports 
of the standard-lib `math` JavaScript module.


## Comments
Everything following a `#` symbol, up to the end of the line, is a comment and 
therefore ignored.

For example, the following expression will just render to `2`.

```
# this is a coment
1+1 # this is another comment
# yet another comment
```
