/**
 *  text module
 *  ============================================================================
 *
 *  This module contains functions for manipulating Text items.
 *
 *  Unless specified otherwise, all the functions of this library assume that
 *  their parameter is an item (1-d tuple). If more that one item is passed
 *  to a function, only the first item will be used and the others will be
 *  ignored.
 */



module.exports = types => {
    const text = {};

    const isNumb = x => types.wrap(x) instanceof types.Numb;
    const isText = x => types.wrap(x) instanceof types.Text;
    const isList = x => types.wrap(x) instanceof types.List;
    const isFunc = x => types.wrap(x) instanceof types.Func;
    const isUndefined = x => types.wrap(x) instanceof types.Undefined;
    const undefined_text = new types.Undefined("Text");
    const undefined_list = new types.Undefined("List");


    /**
     *  `text.to_numb: Text s -> Numb n`
     *  ------------------------------------------------------------------------
     *  Converts a string to a number. It accepts also binary (0b...), octal
     *  (0o...) and exadecimal (0x...) string representations of numbers.
     *
     *  If the argument is not a valid string, this function returns Undefined Number.
     *  If the argument is a tuple, only the first item will be considered.
     */
    text.to_numb = (value) => {
        return isText(value) ? Number(value) : NaN;
    };


    /**
     *  `text.size: Text s -> Numb n`
     *  ------------------------------------------------------------------------
     *  Returns the number of characters in a Text item or `Undefined Number`
     *  if the argumen is not a Text item. If the argument is a tuple, it
     *  applies only to its first item.
     */
    text.size = (x) => {
        const X = types.wrap(x);
        return X instanceof types.Text ? X.size : NaN;
    };


    /**
     *  `text.find: Text s -> Text S -> Numb k`
     *  ------------------------------------------------------------------------
     *  Takes a string `s` as argument and returns a function `f`.
     *  If the argument is a tuple, it applies only to its first item.
     *
     *  The returned function `f`:
     *  - takes a string `S` as argument and returns the first position of `s`
     *    in `S` or `-1` if `s` is not contained in `S`.
     *  - returns Undefined Number if the argument of `f` is not a Text item
     *  - applies only on the first item if the parameter of `f` is a tuple
     */
    text.find = s1 => s2 => isText(s1) && isText(s2) ? s2.indexOf(s1) : NaN;


    /**
     *  `text.rfind: Text s -> Text S -> Numb k`
     *  ------------------------------------------------------------------------
     *  Takes a string `s` as argument and returns a function `f`.
     *  If the argument is a tuple, it applies only to its first item.
     *
     *  The returned function `f`:
     *  - takes a string `S` as argument and returns the last position of `s`
     *    in `S` or `-1` if `s` is not contained in `S`.
     *  - returns Undefined Number if the argument of `f` is not a Text item
     *  - applies only on the first item if the parameter of `f` is a tuple
     */
    text.rfind = s1 => s2 => isText(s1) && isText(s2) ? s2.lastIndexOf(s1) : NaN;


    /**
     *  `text.lower: Text S -> Text s`
     *  ------------------------------------------------------------------------
     *  Returns the passed string in lower-case or `Undefined Text` if the
     *  argument is not a Text item. If the argument is a tuple, this
     *  function applies to its first item only.
     */
    text.lower = str => isText(str) ? str.toLowerCase() : undefined_text;


    /**
     *  `text.upper: Text s -> Text S`
     *  ------------------------------------------------------------------------
     *  Returns the passed string in upper-case or `Undefined Text` if the
     *  argument is not a Text item. If the argument is a tuple, this
     *  function applies to its first item only.
     */
    text.upper = str => isText(str) ? str.toUpperCase() : undefined_text;


    /**
     *  `text.trim: Text S -> Text s`
     *  ------------------------------------------------------------------------
     *  Removed the leading and trailing spaces from the given string.
     *  If the argument is not a Text item, this functions return Undefined Text.
     *  If the parameter is a tuple, this function applies to its first item only.
     */
    text.trim = s => isText(s) ? s.trim() : undefined_text;


    /**
     *  `text.trim_head: Text S -> Text s`
     *  ------------------------------------------------------------------------
     *  Removed the leading spaces from the given string.
     *  If the argument is not a Text item, this functions return Undefined Text.
     *  If the parameter is a tuple, this function applies to its first item only.
     */
    text.trim_head = s => isText(s) ? s.trimStart() : undefined_text;


    /**
     *  `text.trim_tail: Text S -> Text s`
     *  ------------------------------------------------------------------------
     *  Removed the trailing spaces from the given string.
     *  If the argument is not a Text item, this functions return Undefined Text.
     *  If the parameter is a tuple, this function applies to its first item only.
     */
    text.trim_tail = s => isText(s) ? s.trimEnd() : undefined_text;


    /**
     *  `text.head: Numb n -> Text S -> Text s`
     *  ------------------------------------------------------------------------
     *  Takes a number `n` as argument and returns a function `f`.
     *  If the argument is a tuple, it applies only to its first item.
     *
     *  The returned function `f`:
     *  - takes a string `s` as argument and returns the substring at the
     *    left-side of the n-th character. If n is negative, the character
     *    position is computed as relative to the end of `L`.
     *  - returns Undefined Text if the argument of `f` is not a Text item
     *  - applies only on the first item if the parameter of `f` is a tuple
     */
    text.head = n => s => isNumb(n) && isText(s) ? s.slice(0,n) : undefined_text;


    /**
     *  `text.tail: Numb n -> Text S -> Text s`
     *  ------------------------------------------------------------------------
     *  Takes a number `n` as argument and returns a function `f`.
     *  If the argument is a tuple, it applies only to its first item.
     *
     *  The returned function `f`:
     *  - takes a string `s` as argument and returns the substring at the
     *    right-side of the n-th character (including the latter). If n is
     *    negative, the character position is computed as relative to the
     *    end of `S`.
     *  - returns Undefined Text if the argument of `f` is not a Text item
     *  - applies only on the first item if the parameter of `f` is a tuple
     */
    text.tail = n => s => isNumb(n) && isText(s) ? s.slice(n) : undefined_text;


    /**
     *  `text.split: Text s -> Text S -> List l`
     *  ------------------------------------------------------------------------
     *  Takes a string `s` as argument and returns a function `f`.
     *  If the argument is a tuple, it applies only to its first item.
     *
     *  The returned function `f`:
     *  - takes a string `S` as argument and returns the tuple of substrings
     *    separated by s. For example, if the divider is `s=":"` and the string
     *    is `S="a:b:c"`, the function `f` returns `("a","b","c")`.
     *  - returns Undefined Text if the argument of `f` is not a Text item
     *  - applies only on the first item if the parameter of `f` is a tuple
     */
    text.split = s1 => s2 => isText(s1) && isText(s2) ?
            new types.Tuple(...s2.split(s1)).normalize() :
            undefined_text;

    /**
     *  `text.join: Text s -> Tuple T -> Text S`
     *  ------------------------------------------------------------------------
     *  Takes a separator `s` as argument and returns a function `f`.
     *  If the argument is a tuple, it applies only to its first item.
     *
     *  The returned function `f` takes a Tuple `T` of Text items as
     *  argument and returns the string obtained by joining all the items
     *  with interposed  sparator.
     */
    text.join = separator => (...items) => {
        if (!isText(separator)) return undefined_text;
        const tuple = new types.Tuple(...items);
        const textTuple = tuple.imapSync(item => item.toString());
        return Array.from(textTuple).join(separator);
    }


    return text;
}
