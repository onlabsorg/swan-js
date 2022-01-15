/**
 *  list module
 *  ----------------------------------------------------------------------------
 *  
 *  This module contains functions that operate on the swan List data type.
 */
 
module.exports = types => {
    const list = {};
    
    const undefined_text = new types.Undefined("Text");
    const undefined_list = new types.Undefined("List");

    const isNumb = x => types.wrap(x) instanceof types.Numb;
    const isText = x => types.wrap(x) instanceof types.Text;
    const isList = x => types.wrap(x) instanceof types.List;
    const isFunc = x => types.wrap(x) instanceof types.Func;


    /**
     *  ### list.size: List l -> Numb n
     *  Returns the number of items contained in the passed list.
     *  If the argument is not a List item, this function returns Undefined List.
     *  If the parameter is a tuple, this function applies only to the first
     *  item and ignore the others.
     */
    list.size = L  => isList(L) ? L.length : NaN;


    /**
     *  ### list.reverse: List l1 -> List l2
     *  Given a list l1, returns a new list l2, containing the items of l1 in
     *  reversed order.
     *  If the argument is not a List item, this function returns Undefined List.
     *  If the parameter is a tuple, this function applies only to the first
     *  item and ignore the others.
     */
    list.reverse = L => {
        if (isList(L)) {
            const rlist = [];
            for (let i=L.length-1; i>=0; i--) rlist.push(L[i]);
            return rlist;
        } else {
            return undefined_list;
        }
    };

    
    /**
     *  ### list.find: Item x -> List L -> Numb k
     *  Takes an item `x` as argument and returns a function `f`. If the 
     *  argument is a tuple, it applies only to its first item.
     *  
     *  The returned function `f`: 
     *  - takes a list `L` as argument and returns the first position of `x` in 
     *    `L` or `-1` if `x` is not contained in `L`.
     *  - returns Undefined List if the argument of `f` is not a List item
     *  - applies only on the first item if the parameter of `f` is a tuple
     */
    list.find = x => L => isList(L) ? L.indexOf(x) : NaN;
    

    /**
    *  ### list.rfind: Item x -> List L -> Numb k
    *  Takes an item `x` as argument and returns a function `f`. 
    *  If the argument is a tuple, it applies only to its first item.
    *  
    *  The returned function `f`: 
    *  - takes a list `L` as argument and returns the last position of `x` in 
    *    `L` or `-1` if `x` is not contained in `L`.
    *  - returns Undefined List if the argument of `f` is not a List item
    *  - applies only on the first item if the parameter of `f` is a tuple
     */
    list.rfind = x => L => isList(L) ? L.lastIndexOf(x) : NaN;
    

    /**
     *  ### list.head: Numb n -> List L -> List l
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
    list.head = n => L => isNumb(n) && isList(L) ? L.slice(0,n) : undefined_list;

    /**
     *  ### list.tail: Numb n -> List L -> List l
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
    list.tail = n => L => isNumb(n) && isList(L) ? L.slice(n) : undefined_list;


    /**
     *  ### list.join: Text s -> List L -> Text S
     *  Takes a separator `s` as argument and returns a function `f`.
     *  If the argument is a tuple, it applies only to its first item.
     *  
     *  The returned function `f`: 
     *  - takes a List `L` of Text items as argument and returns the string
     *    obtained by joining all the items with interposed  sparator.
     *  - returns Undefined List if the argument of `f` is not a List item
     *  - applies only on the first item if the parameter of `f` is a tuple
     */
    list.join = separator => L => {
        if (!isText(separator)) return undefined_text;
        for (let value of L) if (!isText(value)) return undefined_text;
        return L.join(separator);
    };
    
    
    /**
     *  ### list.map: Func F -> List L -> List FL
     *  Takes a Func item `F` as argument and returns a function `f`. 
     *  If the argument is a tuple, it applies only to its first item.
     *  
     *  The returned function `f`: 
     *  - takes a List `L` as argument and returns a new list containg `F x` for 
     *    each item `x` of `L`     
     *  - returns Undefined List if the argument of `f` is not a List item
     *  - applies only on the first item if the parameter of `f` is a tuple
     */
    list.map = fn => async L => {
        if (isFunc(fn) && isList(L)) {
            const image = [];
            for (let value of L) image.push(await fn(value));
            return image.map(types.unwrap);
        } else {
            return undefined_list;
        }
    };


    return list;   
}
