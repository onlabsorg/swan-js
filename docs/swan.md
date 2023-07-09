# Swan language

`Swan` is a an interpreted expression language. 

Syntactically speaking, a swan expression is a sequence of binary operations
`(operand operator operand operator operand ...)`, eventually grouped with 
parenthesis `(...)`, square braces `[...]` or curly braces `{...}`. Finally,
the swan syntax supports end-line comments: everything following a `#` symbol, 
up to the end of the line, is a comment and therefore ignored.

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

- [Bool](#bool-data-type) type, representing booleans (either `TRUE` or `FALSE`) 
- [Numb](#numb-data-type) type, representing real numbers (e.g. `-123.4e3`)
- `Applicable` type, an abstract data type representing any Item for which an 
  [apply operation](#application-operator) is defined
- `Mapping` type, an abstract Applicable representing discrete mappings
- [Text](#text-data-type) type, a Mapping between integer numbers and 
  characters (e.g. `"abc"`).
- [List](#list-data-type) type, a Mapping between integer numbers and Items
- [Namespace](#namespace-data-type) type, a Mapping between identifiers and
  Terms
- [Func](#func-data-type) type, an Applicable representing a function
- [Undefined](#undefined-data-type) type, an Item representing an undefined
  operation or value (swan expressions never fail; they rather return undefined 
  values)

The following operators are defined in swan: 

- [Arithmetic operators](#arithmetic-operators): `+`, `-`, `*`, `/`, `%`, `^`
- [Comparison operators](#comparison-operators): `==`, `!=`, `>`, `>=`, `<`, `<=`
- [Logic operators](#logic-operators): `&`, `|`
- [Selection operators](#selection-operators): `?`, `;`
- [Pairing operator](#tuple-data-type-and-pairing-operator): `,`
- [Application operator](#application-operator) (empty operator): ` `
- [Function definition operator](#func-data-type): `->`
- [Function composition operators](#composition-operators): `<<`, `>>`
- [Mapping operator](#mapping-operator): `=>`
- [Assignment operators](#names-and-assignment-operators): `=`, `:`
- [Subcontexting operator](#subcontexting-operator): `.`
- [Unary operators](#unary-operators): `+`, `-`

Unless grouping parenthesis are used, the operations are executed in the order
shown below. If the expression contains two or more operators with the same rank, 
the leftmost operation gets executed first. The only exceptions to this rule are 
the function creation operation `->` and the function composition operator `<<`,
for which the right-most operations get executed first. For example, the 
expression `x -> y -> x+y` is equivalent to `x -> (y -> x+y)`.

1. application , `.`
2. `^`
3. `*` , `/`, `%`
4. `+` , `-`
5. `==` , `!=` , `<` , `<=` , `>=` , `>`
6. `&` , `|`
7. `?`
8. `;`
9. `->`
10. `<<`, `>>` 
11. `=>`
12. `=` , `:`
13. `,`

Besides the operation, Swan defines also some essential [builtins](./builtins.md),
consisting in functions and namespaces and some [standard modules](./modules/index.md)
that can be loaded using the `require` builtin function.


## Bool data type
A Bool item can be either true or false. It can be created either:

- by referencing the built-in constants `TRUE` or `FALSE`
- as return value of a [comparison expressions](#comparison-operators)
- as result of calling the `Bool` or the `Bool.not` [builtin functions](./builtins.md)


## Numb data type
This data type represents a real number. A number can be created either:

- by explicitly defining it as a literal (e.g `10`, `13.14`, `-2.5e3`, ...)
- as return value of an [arithmetic operation](#arithmetic-operators)


## Text data type
A Text item is a Mapping between natural numbers and characters; in other words, 
it is a sequence of characters. A Text item can be defined using one of the
following literals:

* `"double quotes string"`
* `'single quotes string'`
* `` `accent quotes string` ``

A string within accent quotes is a template string. Within a template strings,
expressions eventually enclosed between `{%` and `%}` get evaluated and replaced. 
For example, the expression `` `2*10 = {% 2*10 %}` `` returns the string `"2*10 = 20"`.

The n-th character of a Text item can be accessed via an
[apply operation](#application-operator). For example:

- `"abc" 0` returns `"a"`
- `"abc" 1` returns `"b"`
- `"abc"(2)` returns `"c"`


## Tuple data type and pairing operator
A Tuple term is an ordered sequence of items. Tuples are created using the comma 
operator `,`. The following example shows a tuple made of three items: `1`, `2` 
and `"abc"`

```
1, 2, "abc"
```

Tuples can contain any other data type as elements, except another tuple. If you
try to create a tuple of tuples, you get a flattened tuple as result: 
`(1,2),(3,4),5` is equivalent to `1,2,3,4,5`.

Any item in swan (e.g. `10` or `"abc"` or a list, etc.) is also seen as a
tuple made of only one item.

A special type of tuple is the empty tuple `()` which is used in swan to 
represent the concept of nothingness.


## List data type
A List item is a Mapping between natural numbers and items. In other words, it
is an ordered sequence of values, just like a tuple, but it behaves
like an item (one-element tuple); for this reason, it allows nesting and behaves 
differently from tuples.

A list is created as `[tuple]`. Examples of valid list literals are:

* `[1,2,"abc"]` list with three elements
* `[1]` list with only one element
* `[]` empty list
* `[[1,2],[3,4,5]]` list of lists

The n-th item of a List item can be accessed via an
[apply operation](#application-operator). For example:

- `[10,20,30] 0` returns `10`
- `[10,20,30] 1` returns `20`
- `[10,20,30](2)` returns `30`


## Names and assignment operators
The **assignment operator** binds a name to an expression value:

```
x = 10 + 1
```

After this expression, the context will contain a name `x` with its associated 
value `11`, which can be referenced in other expressions. For example:

```
x * 2  # resolves to 22
```

Valid names can contain letters (`a..z` and `A..Z`), numbers (`0..9`) and the
underscore character (`_`), but they cannot start with a numeric character.

Multiple values (a tuple of values) can be assigned to multiple names (a tuple 
of names) as follows:

```
(a, b, c) = (1, 2, 3)
```

After this expression, `a` will hold the value `1`, `b` will hold the value `2`
and `c` will hold the value `3`. If the number of names does not match the 
number of values, the assignment operation behaves as follows:

- If the tuple of values contains less items than the tuple of names, the 
  exceeding names will be assigned nothing (empty tuple): `(a,b,c,d) = (1,2)` 
  will result in `a=1`, `b=2`, `c=()` and `d=()`.
- If the tuple of values contains more items than the tuple of names, the last 
  name will be assigned the tuple of the remaining values: `(a,b,c) = (1,2,3,4,5)` 
  will result in `a=1`, `b=2` and `c=(3,4,5)`.
- If the tuple of names is empty, no assignment will take place.

Like any other type of operation, the assignment operation returns a value, 
that is:

- `NOTHING` (empy tuple), if the assignment operation is successful
- Undefined AssignmentOperation if any of the left-hand items is not a name or 
  not a valid name. In that case no assignment will take place.

The **labeling operator** `:` works exactly as the assignment operator `=`, with
the only exception that the operation returns the right-hand value instead of
`NOTHING`. For example, the expression `x: 10 + 1` binds `11` to `x` and returns
`11`.


## Namespace data type
A Namespace item is a Mapping between names and Terms. Any expression enclosed
between curly braces returns a Namespace item. For example:

```
{
    x = 10,
    y = 20,
    z = 30,
    3 + 5
}
```

In this example, we basically assigned three values to three names, while any 
non-assignment operation between curly braces is just ignored. 

In order to access the names inside a namespace, you can use either the 
[apply operator](#application-operator) or the 
[subcontexting operator](#subcontexting-operator) `.`. For example: 

* `ns = {a=1, b=2, c=3}` defines a namespace and maps it to the name `ns`
* `ns "a"` resolves to `1` 
* `ns("b")` resolves to `2` 
* `ns.c` resolves to `3`

Another import property of namespace is inheritance: every namespace inherits
the names of its `parent namespace`. The following example shows how child 
namespace inherit the names defined in their parent namespaces. 

```
    x = 10
    ns1 = {
        y = x + 1   # the name `x` is defined in the parent namespace
        ns2 = {
            z = x + y   # the name `y` is defined in the parent namespace `ns1`,
                        # the name `x` is defined in the parent's parent namespace
        }
    }
```

>   Notice that the [apply operator](#application-operator) gives access only to
>   the `own` names of a namespace, while the [subcontexting operator](#subcontexting-operator)
>   gives access also to all the parent's names.


## Func data type
A function is a parametric expression, defined as `names -> expression`.
For example, the expression:

```
(x,y) -> x+y
```

defines a function that takes two parameters `x` and `y` as input and produces
their sum as output.

In order to execute a function, you use the [application operator](#application-operator);
for example:

* `f = x -> 2*x` defines a function that takes one parameter and doubles it
* `f 4` resolves to `8`
* `f(5)` resolves to `10`

**Recursion** is the primary way to do loops in swan and for this purpose
every function has access to itself via the `self` name. For example, the 
following recursive function calculates n-factorial:

```
n -> n == 0 ? 1 ; n * self(n-1)
```


## Undefined data type
Swan operations never fail: they returns an Undefined item instead; for 
example the sum of a number and a list returns an Undefined item.
Besides being returned by undefined operations, Undefined items can be 
created via the `Undefined` [builtin](./builtins.md) callable.


## Application operator
A missing operator (two operands next to each other: `F X`), defines an 
application operation: `F` applied to `X`.
The application operation is defined on `Applicable` data types, which are 
[Func](#func-data-type) and the `Mappings` [Text](#text-data-type),
[List](#list-data-type) and [Namespace](#namespace-data-type).

**When F is a Func item**, the application operation corresponds to a function 
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
`Undefined('Term', error)`.

**When F is a Mapping item** (namely a [Text](#text-data-type),
[List](#list-data-type) or [Namespace](#namespace-data-type) item), the 
application operation returns the value mapped to the given parameter or 
`Undefined('Mapping')` if no mapping is defined. In particular:

- `"abc"(1)` returns `"b"`
- `[10,20,30](1)` returns `20`
- `{a:1, b:2, c:3}("b")` returns `2`

If a tuple of parameters is passed as argument to a Mapping application, the
result is a tuple of mapped values. For example:

- `"abc"(1,2)` returns `("b", "c")`
- `[10,20,30](1,2)` returns `(20, 30)`
- `{a:1, b:2, c:3}("b", "c")` returns `(2, 3)`

When `F` is a Namespace and `X` is a name defined in its parent namespace, the
application operation returns `Undefined('Mapping')`. In other words, the
application operation gives access only to the `own` names of a namespace and
not to the inherited names.

When `F` is a Namespace that contains a `F.__apply__` function, the normal
mapping application operation is overridden and resolves to `F.__apply__(X)`.

**When F is a tuple `(f1, f2, ...)`**, the `F X` operation returns the tuple
`(f1 X, f2 X, ...)`


## Unary operators
Swan defines two unary operators: `+` and `-`. 

The `+X` expression is equivalent to just `X`. 

The `-X` expression returns the additive inverse of `X`, which is actually
defined only on Numb items. For all the other types `-X` returns 
`Undefined("NegationOperation")`. If `X` is a tuple `(x1, x2, ...)`, the `-X` 
operation returns `(-x1, -x2, ...)`.


## Arithmetic operators
The arithmetic operators are: sum (`+`), subtraction (`-`), product (`*`),
division (`/`), modulo (`%`) and exponentiation (`^`). These operations are
consistent with the following algebraic characterization of the swan types:

|                                | Bool     | Numb   | Text      | List      | Namespace | Func     | Undefined |
|--------------------------------|:--------:|:------:|:---------:|:---------:|:---------:|:--------:|:---------:|
| Sum operation                  | `OR`     | `X+Y`  | `Concat.` | `Concat.` | `Merge`   | *Undef.* | *Undef.*  |
| Additive inverse               | *Undef.* | `-X`   | *Undef.*  | *Undef.*  | *Undef.*  | *Undef.* | *Undef.*  |
| Additive neutral element       | `FALSE`  | `0`    | `""`      | `[]`      | `{}`      | *Undef.* | *Undef.*  |
| Product operation              | `AND`    | `X*Y`  | *Undef.*  | *Undef.*  | *Undef.*  | *Undef.* | *Undef.*  |
| Multiplicative inverse         | *Undef.* | `1/X`  | *Undef.*  | *Undef.*  | *Undef.*  | *Undef.* | *Undef.*  |
| Multiplicative neutral element | `TRUE`   | `1`    | *Undef.*  | *Undef.*  | *Undef.*  | *Undef.* | *Undef.*  |

The sum of a tuple `t1=(x1,x2,x3)` and a tuple `t2=(y1,y2,y3)` is the tuple
`(x1+y1, x2+y2, x3+y3)`. The same goes for subtraction, product, division,
modulo and exponentiation. As a consequence of this rule, any operation
between two empty tuples `()` returns an empty tuple.

#### Arithmetic operations between Bool items
* `B1 + B2` returns the logic `or` between `B1` and `B2`
* `B1 * B2` returns the logic `and` between `B1` and `B2`

#### Arithmetic operations between Numb items
The Numb type implement the arithmetic operations between numbers:

* `5 + 2` returns `7`
* `5 - 2` returns `3`
* `5 * 2` returns `10`
* `5 / 2` returns `2.5`
* `5 % 2` returns `1`
* `5 ^ 2` returns `25`

#### Arithmetic operations between Text items
The Text type implements only the sum operation, which produces the
concatenation of the two operands. For example, `"abc" + "def"` returns 
`"abcdef"`.

#### Arithmetic operations between List items
The List type implements only the sum operation, which produces the
concatenation of the two operands. For example, `[1,2,3] + [4,5,6]` returns 
`[1,2,3,4,5,6]`.

#### Arithmetic operations between Namespace items
The Namespace type implements only the sum operation.

The sum `ns1 + ns2` between two namespaces returns a new namespace obtained by
merging `ns1` and `ns2`. For example `{a=1,b=2} + {c=3,d=4}` returns 
`{a=1, b=2, c=3, d=4}`.

If `ns1` and `ns2` contain the same name, the value of `ns2` prevails. For
example `{a=1,b=2} + {b=3, c=4}` returns `{a=1, b=3, c=4}`.

Custom arithmetic operations on namespaces can be defined by adding specials functions to the namespace:

* If `ns` contains a Func item named `__add__`, then `ns + item` returns `ns.__add__(ns, item)`.
* If `ns` contains a Func item named `__sub__`, then `ns - item` returns `ns.__sub__(ns, item)`.
* If `ns` contains a Func item named `__mul__`, then `ns * item` returns `ns.__mul__(ns, item)`.
* If `ns` contains a Func item named `__div__`, then `ns / item` returns `ns.__div__(ns, item)`.
* If `ns` contains a Func item named `__pow__`, then `ns ^ item` returns `ns.__pow__(ns, item)`.

#### Undefined arithmetic operations
When an arithmetic operation is not defined between two items, the result is an
Undefined item. In particular:

- `x + y` resolves to `Undefined('SumOperation', x, y)`
- `x - y` resolves to `Undefined('SubOperation', x, y)`
- `x * y` resolves to `Undefined('MulOperation', x, y)`
- `x / y` resolves to `Undefined('DivOperation', x, y)`
- `x % y` resolves to `Undefined('ModOperation', x, y)`
- `x ^ y` resolves to `Undefined('PowOperation', x, y)`


## Comparison operators
The comparison operations compare two values and return `TRUE` or 
`FALSE`. Swan defines the following comparison operators:

* Equal: `==`
* Not equal: `!=` 
* Less than: `<`
* Less than or equal to: `<=`
* Greater than: `>`
* Greater than or equal to: `>=`

Equality is defined on all the swan Item types, while only `Bool`, `Numb`, 
`Text` and `List` types define also an order for their items.

Tuples are compared lexicographically and the empty tuple `()` is less than any
other item and equal only to itself.

#### Comparison operations between Bool items
Two Bool items are equal if they are both `TRUE` or both `FALSE`. 
Furthermore `FALSE` is less than `TRUE`.

#### Comparison operations between Numb items
The comparison between numbers works as expected. For example, the following
expressions resolve to `TRUE`:

* `10 == 10`
* `10 != 11`
* `10 < 11`
* `10 <= 11`
* `10 <= 10`

#### Comparison operations between Text items
Two Text items are equal if they contain the same sequence of characters. For
example `"abc" == "abc"` is `TRUE`.

A text `s1` is less than a text `s2` if `s1` precedes `s2` alphabetically.
For example, the following expressions return `TRUE`:

* `"abc" < "xyz"`
* `"zzz" > "aaa"`

#### Comparison operations between List items
Two lists are equal if they contain the same sequence of items. For
example `[1,2,3] == [1,2,3]` is `TRUE`, but `[1,2,3] == [1,2]` is `FALSE`.

A list `L1` is less than a list `L2` if `L1` precedes `L2` lexicographically.
For example, the following expressions return `TRUE`:

* `[1,2,3] < [4,5,6]`
* `[1,2,3] < [1,2,4]`
* `[1,3,4] > [1,2,4]`

#### Comparison operations between Namespace items
Two namespaces are equal if they contain the same set of own name-value pairs.
For example `{a=1,b=2} == {a=1,b=2}` is true, but `{a=1,b=2} == {a=1,b=4,c=5}`
is false.

No order is defined for the Namespace type, therefore the comparison operations
`<`, and `>` between namespaces will always return `FALSE`, while the 
operations `<=` and `>=` will return `TRUE` only if the namespaces are 
equal.

#### Comparison operations between Func items
Two functions are equal if they are the same function. For example, given two
functions `f1:x->2*x` and `f2:x->2*x`, the expression `f1 == f1` is true, but
the expression `f1 == f2` is false.

No order is defined for the Func type, therefore the comparison operations
`<`, and `>` between functions will always return `FALSE`, while the 
operations `<=` and `>=` will return `TRUE` only if the functions are 
equal.

#### Comparison operation between Undefined items
Two Undefined items are equal if they are the same item.

No order is defined for the Undefined type, therefore the comparison operations
`<`, and `>` between undefined items will always return `FALSE`, while the 
operations `<=` and `>=` will return `TRUE` only if the undefined items are 
equal.

#### Comparison operation between items of different types
The `!=` comparison between two items of different type returns always `TRUE`,
while all the other comparison operations return always `FALSE`.

#### Comparison operations between tuples
Two tuples are equal if they contain the same sequence of items. For
example `(1,2,3) == (1,2,3)` is `TRUE`, but `(1,2,3) == (1,2)` is `FALSE`.

A tuple `t1` is less than a tuple `t2` if `t1` precedes `t2` lexicographically.
For example, the following expressions return `TRUE`:

* `(1,2,3) < (4,5,6)`
* `(1,2,3) < (1,2,4)`
* `(1,3,4) > (1,2,4)`

If the two tuples have different number of items, the missing items are assumed
to be `()`. The empty tuple is less than anything else and equal only to itself.


## TRUTY and FALSY terms
By definition, the following items are *FALSY*, meaning they give `FALSE` when
converted to booleans:

- empty tuple: `{}`
- `FALSE` Bool
- `0` Numb
- empty Text: `""`
- empty List: `[]`
- empty Namespace: `{}`
- Undefined item

All other items are *TRUTY*, meaning that they give `TRUE` when converted to
booleans.

A tuple is *FALSY* if all its items are *FALSY*, while it is *TRUTY* if at
least one of its items is *TRUTY*.


## Logic operators
The logic operators AND (`&`) and OR (`|`) generalize the logic AND/OR to any
value type. 

The AND operation `A & B` returns `A` if it is [FALSY](#truty-and-falsy-terms), 
otherwise it returns `B`. For example:

- `1 & 2` resolves to `2`
- `0 & 1` resolves to `0`

The OR operation `A | B` returns `A` if it is [TRUTY](#truty-and-falsy-terms), 
otherwise it returns `B`. For example:

- `1 | 2` resolves to `1`
- `0 | 1` resolves to `1`


## Selection operators
A conditional expression `X ? Y` resolves to `Y` if `X` is 
[TRUTY](#truty-and-falsy-terms), otherwise it resolves to `Undefined('Term')`. 
For example:

* `2 > 1 ? "ok"` resoves to `"ok"`
* `2 < 1 ? "ok"` resoves to `Undefined('Term')`
* `"abc" ? "ok"` resoves to `"ok"`
* `"" ? "ok"` resoves to `Undefined('Term')`

An alternative expression `X ; Y` resolves to `X` if it is not an Undefined term;
otherwise it resolves to `Y`. For example:

* `Undefined() ; 3` resolves to `3`
* `10 ; 2` resolves to `10`

When combined together, the conditional and the alternative expression work as
an if-else condition:

* `1==1 ? "eq" ; "ne"` resolves to `"eq"`
* `1==2 ? "eq" ; "ne"` resolves to `"ne"`


## Subcontexting operator
When you assign a value to a name with `name = value` (or with `name : value`), 
you are defining that name in the global namespace and you can access the 
associated value as `name` in another expression.

When you assign a value to a name between curly braces `{name1=10, name2=20}`,
you are defining names in a sub-namespace and you can access the associated 
values with an apply operation `{a=1}("a")`.

A subcontexting operation `ns . expression` executes the right-hand expression
in the context of `ns`. For example, `{a=2,b=3}.(a+b)` will resolve to `5`.

The inherited names are still visible in the righ-hand expression, unless they 
are overridden by local namespace names. For example:

```
x = 10,
y = 20,
ns = {x=100, z=300},
sum = ns.(x+y+z)        # 420
```

The `sum` name will map to the value `420`. In fact, in the right-hand expression
`x+y+z`, the names `x` and `z` will be found in `ns`, while the name `y` will
not be found in `ns` and will be taken from the global namespace.

The subcontexting can be also used as an alternative way to access names defined
inside a namespace. In the example above, the expression `ns.z` will indeed
resolve to the value of `z` inside the namespace `ns`.

The subcontexting operation can be used also the define child namespaces. For 
example, `ns.{u:1, v:2, w:3}` will resolve to a namespace that has `ns` as 
parent.

If the left-hand operand `X` of a `X.Y` operation is not a  Namespace, the `.` 
operation returns `Undefined('SubcontextingOperation', X, Y)`.


## Composition operators

The composition operation `g << f` returns the function `x -> g(f x)`. For 
example:

```
f = x -> 2*x, 
g = x -> x+1, 
h = g << f,
h 4             # resolves to 9, obtained as (2*4)+1
```

The composition operation is righ-associative, therefore `h << g << f` resolves
to `x -> h( g( f x ))`.

The reverse composition operation `g >> f` returns the function `x -> f(g x)`.
For example:

```
f = x -> 2*x, 
g = x -> x+1, 
h = g >> f,
h 4             # resolves to 10, obtained as 2*(4+1)
```


## Mapping operator

The mapping operator `t => f` takes a tuple `t = (a, b, c, ...)` and a function
`f` and returns the tuple `f(a), f(b), f(c), ...`. For example:

```
(1,2,3) => x -> 2*x     # resolves to (2,4,6)
```

Notice that when the mapping function `f` returns an empty tuple `()`, its value 
will be ignored in the mapped tuple, because that's just how tuples work. This 
means that the mapping operator can be also used to filter tuples. For example:

```
isEven = x -> x % 2 == 0            # returns TRUE if x is an even number
ifEven = x -> isEven(x) ? x ; ()    # returns x if it is an even number, or else ()
(1,2,3,4,5) => ifEven               # resolves to (2,4) 
```
