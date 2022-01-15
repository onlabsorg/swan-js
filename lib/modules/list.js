/**
 *  list module
 *  ----------------------------------------------------------------------------
 *  
 *  This module contains functions that operate on the swan List data type.
 */
 
module.exports = types => {
    const list = {};
    
    const SyncMap = fn => (...values) => new types.Tuple(...values.map(fn)).unwrap();

    const AsyncMap = fn => async (...values) => {
        const x = new types.Tuple(...values);
        const y = await x.vmapAsync(fn);
        return y.unwrap()
    }
    
    const undefined_text = new types.Undefined("Text");
    const undefined_list = new types.Undefined("List");

    const isNumber = x => types.wrap(x) instanceof types.Numb;
    const isString = x => types.wrap(x) instanceof types.Text;
    const isList = x => types.wrap(x) instanceof types.List;
    const isFunc = x => types.wrap(x) instanceof types.Func;


    /**
     *  ### list.size: List l -> Numb n
     *  Returns the number of items contained in the passed list.
     *  
     *  If the argument is not a List item, this function returns Undefined List.
     *  If the parameter is a tuple, this function apply to each item of the
     *  tuple and returns a tuple.
     */
    list.size = SyncMap(l => isList(l) ? l.length : NaN);


    /**
     *  ### list.reverse: List l1 -> List l2
     *  Given a list l1, returns a new list l2, containing the items of l1 in
     *  reversed order.
     *  
     *  If the argument is not a List item, this function returns Undefined List.
     *  If the parameter is a tuple, this function apply to each item of the
     *  tuple and returns a tuple.
     */
    list.reverse = SyncMap(list => {
        if (isList(list)) {
            const rlist = [];
            for (let i=list.length-1; i>=0; i--) {
                rlist.push(list[i]);
            }
            return rlist;
        } else {
            return undefined_list;
        }
    });

    
    /**
     *  ### list.find: Item x -> List L -> Numb k
     *  Takes an item `x` as argument and returns a function `f`. If the 
     *  argument is a tuple, it reurns a tuple of functions `fi`, one for each
     *  item `xi` of the argument tuple.
     *  
     *  Each function `fi` takes a list `L` as argument and returns the first
     *  position of `xi` in `L` or `-1` if `xi` is not contained in `L`.
     *  
     *  If the argument of `fi` is not a List item, `fi` returns Undefined List.
     *  
     *  If the parameter of `fi` is a tuple, it applies to each item of the
     *  tuple and returns a tuple.
     */
    list.find = SyncMap(x => AsyncMap(L => isList(L) ? L.indexOf(x) : NaN));
    

    /**
     *  ### list.rfind: Item x -> List L -> Numb k
     *  Takes an item `x` as argument and returns a function `f`. If the 
     *  argument is a tuple, it reurns a tuple of functions `fi`, one for each
     *  item `xi` of the argument tuple.
     *  
     *  Each function `fi` takes a list `L` as argument and returns the last
     *  position of `xi` in `L` or `-1` if `xi` is not contained in `L`.
     *  
     *  If the argument of `fi` is not a List item, `fi` returns Undefined List.
     *  
     *  If the parameter of `fi` is a tuple, it applies to each item of the
     *  tuple and returns a tuple.
     */
    list.rfind = SyncMap(x => AsyncMap(L => isList(L) ? L.lastIndexOf(x) : NaN));
    

    /**
     *  ### list.head: Numb n -> List L -> List l
     *  Takes a number `n` as argument and returns a function `f`. If the 
     *  argument is a tuple, it reurns a tuple of functions `fi`, one for each
     *  item `ni` of the argument tuple.
     *  
     *  Each function `fi` takes a list `L` as argument and returns the
     *  sub-list at the left-side of the n-th item. If n is negative, the 
     *  item position is computed as relative to the end of `L`.
     *  
     *  If the argument of `fi` is not a List item, `fi` returns Undefined List.
     *  
     *  If the parameter of `fi` is a tuple, it applies to each item of the
     *  tuple and returns a tuple.
     */
    list.head = SyncMap(n => AsyncMap(L => isNumber(n) && isList(L) ? L.slice(0,n) : undefined_list));

    /**
     *  ### list.tail: Numb n -> List L -> List l
     *  Takes a number `n` as argument and returns a function `f`. If the 
     *  argument is a tuple, it reurns a tuple of functions `fi`, one for each
     *  item `ni` of the argument tuple.
     *  
     *  Each function `fi` takes a List `L` as argument and returns the
     *  sub-list at the right-side of the n-th item (including the latter). 
     *  If n is negative, the item position is computed as relative to the 
     *  end of `L`.
     *  
     *  If the argument of `fi` is not a List item, `fi` returns Undefined List.
     *  
     *  If the parameter of `fi` is a tuple, it applies to each item of the
     *  tuple and returns a tuple.
     */
    list.tail = SyncMap(n => AsyncMap(L => isNumber(n) && isList(L) ? L.slice(n) : undefined_list));


    /**
     *  ### list.join: Text s -> List L -> Text S
     *  Takes a separator `s` as argument and returns a function `f`. If the 
     *  argument is a tuple, it reurns a tuple of functions `fi`, one for each
     *  item `si` of the argument tuple.
     *  
     *  Each function `fi` takes a List `L` of text items as argument and 
     *  returns the text obtained by joining all the items with interposed
     *  sparator.
     *  
     *  If either `s` or any item of `L` is not a Text items, `fi` returns 
     *  Undefined Text.
     *  
     *  If the parameter of `fi` is a tuple, it applies to each item of the
     *  tuple and returns a tuple.
     */
    list.join = SyncMap(separator => AsyncMap(L => {
        if (!isString(separator)) return undefined_text;
        for (let value of L) if (!isString(value)) return undefined_text;
        return L.join(separator);
    }));
    
    
    /**
     *  ### list.map: Func F -> List L -> List FL
     *  Takes a Func item `F` as argument and returns a function `f`. If the 
     *  argument is a tuple, it reurns a tuple of functions `fi`, one for each 
     *  item `Fi` of the argument tuple.
     *  
     *  Each function `fi` takes a List `L` as argument and returns a new list
     *  containg `Fi x` for each item `x` of `L`. If `Fi` is not an `Applicable`
     *  item, it returns Undefined List.
     *  
     *  If `L` is not a List, `fi` returns Undefined List.
     *  
     *  If the parameter of `fi` is a tuple, it applies to each item of the
     *  tuple and returns a tuple.
     */
    list.map = SyncMap(fn => AsyncMap(async L => {
        if (isFunc(fn) && isList(L)) {
            const image = [];
            for (let value of L) image.push(await fn(value));
            return image.map(types.unwrap);
        } else {
            return undefined_list;
        }
    }));


    return list;   
}
