

module.exports = {

        /**
         *  `List.size: List l -> Numb n`
         *  ------------------------------------------------------------------------
         *  Returns the number of items contained in a List item or `Undefined Number`
         *  if the argument is not a List item. If the argument is a tuple, it
         *  applies only to its first item.
         */
        size (x) {
            const X = types.wrap(x);
            return X instanceof types.List ? X.size : NaN;
        },


        /**
         *  `List.reverse: List l1 -> List l2`
         *  ------------------------------------------------------------------------
         *  Given a list l1, returns a new list l2, containing the items of l1 in
         *  reversed order.
         *  If the argument is not a List item, this function returns Undefined List.
         *  If the parameter is a tuple, this function applies only to the first
         *  item and ignores the others.
         */
        reverse: L => {
            if (isList(L)) {
                const rlist = [];
                for (let i=L.length-1; i>=0; i--) rlist.push(L[i]);
                return rlist;
            } else {
                return undefined_list;
            }
        },


        /**
         *  `List.find: Item x -> List L -> Numb k`
         *  ------------------------------------------------------------------------
         *  Takes an item `x` as argument and returns a function `f`. If the
         *  argument is a tuple, it applies only to its first item.
         *
         *  The returned function `f`:
         *  - takes a list `L` as argument and returns the first position of `x` in
         *    `L` or `-1` if `x` is not contained in `L`.
         *  - returns Undefined List if the argument of `f` is not a List item
         *  - applies only on the first item if the parameter of `f` is a tuple
         */
        find: x => L => isList(L) ? L.indexOf(x) : NaN,


        /**
        *  `List.rfind: Item x -> List L -> Numb k`
        *  ------------------------------------------------------------------------
        *  Takes an item `x` as argument and returns a function `f`.
        *  If the argument is a tuple, it applies only to its first item.
        *
        *  The returned function `f`:
        *  - takes a list `L` as argument and returns the last position of `x` in
        *    `L` or `-1` if `x` is not contained in `L`.
        *  - returns Undefined List if the argument of `f` is not a List item
        *  - applies only on the first item if the parameter of `f` is a tuple
         */
        rfind: x => L => isList(L) ? L.lastIndexOf(x) : NaN,


        /**
         *  `List.head: Numb n -> List L -> List l`
         *  ------------------------------------------------------------------------
         *  Takes a number `n` as argument and returns a function `f`.
         *  If the argument is a tuple, it applies only to its first item.
         *
         *  The returned function `f`:
         *  - takes a list `L` as argument and returns the sub-list at the left-side
         *    of the n-th item. If n is negative, the item position is computed as
         *    relative to the end of `L`.
         *  - returns Undefined List if the argument of `f` is not a List item
         *  - applies only on the first item if the parameter of `f` is a tuple
         */
        head: n => L => isNumb(n) && isList(L) ? L.slice(0,n) : undefined_list,

        /**
         *  `List.tail: Numb n -> List L -> List l`
         *  ------------------------------------------------------------------------
         *  Takes a number `n` as argument and returns a function `f`.
         *  If the argument is a tuple, it applies only to its first item.
         *
         *  The returned function `f`:
         *  - takes a list `L` as argument and returns the sub-list at the
         *    right-side of the n-th item (including the latter). If n is negative,
         *    the item position is computed as relative to the end of `L`.
         *  - returns Undefined List if the argument of `f` is not a List item
         *  - applies only on the first item if the parameter of `f` is a tuple
         */
        tail: n => L => isNumb(n) && isList(L) ? L.slice(n) : undefined_list
    },
