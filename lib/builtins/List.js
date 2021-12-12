
const {ensureList, ensureString, ensureNumber} = require("./__helpers__");


const List = module.exports = {
    
    /**
     *  List.find: Item -> List -> Numb
     *  ------------------------------------------------------------------------
     *  Given an item `x` and a list `L`, it returns the first index of `x`
     *  in `L` or `-1` if `L` does not contain `x`. For example:
     *
     *  ```
     *  List.find "abc" [1, 2, "abc", 5, "abc", 3] // returns 2
     *  List.find "def" [1, 2, "abc", 5, "abc", 3] // returns -1
     *  ```
     */
    find: item => list => ensureList(list).indexOf(item),


    /**
     *  List.rfind: Item -> List -> Numb
     *  ------------------------------------------------------------------------
     *  Given an item `x` and a list `L`, it returns the last index of `x`
     *  in `L` or `-1` if `L` does not contain `x`. For example:
     *
     *  ```
     *  List.rfind "abc" [1, 2, "abc", 5, "abc", 3] // returns 4
     *  List.rfind "def" [1, 2, "abc", 5, "abc", 3] // returns -1
     *  ```
     */
    rfind: item => list => ensureList(list).lastIndexOf(item),
    
    
    /**
     *  List.join: Text -> List of Text -> Text
     *  ----------------------------------------------------------------------------
     *  Given a separator and a list of strings, returns the string obtained by 
     *  concatenating all the items of the list, interposing the separator.
     *  For example:
     *  
     *  ```
     *  List.join "-" ["abc","def","ghi"]   // returns "abc-def-ghi"
     *  ```
     */
    join (separator) {
        ensureString(separator);
        return list => {
            ensureList(list);
            for (let item of list) ensureString(item);
            return list.join(separator);            
        }
    },
    
    
    /**
     *  List.reverse: List -> List
     *  ----------------------------------------------------------------------------
     *  Returns a list containing all the item of a given list, but in reversed
     *  oredr. For example
     *  
     *  ```
     *  List.reveste [1,2,3]    // returns [3,2,1]
     *  ```
     */
    reverse (list) {
        ensureList(list);
        const rlist = [];
        for (let i=list.length-1; i>=0; i--) {
            rlist.push(list[i]);
        }
        return rlist;
    },
    
    
    /**
     *  List.head: (i:Numb) -> (l:List) -> List
     *  ----------------------------------------------------------------------------
     *  Given and index `i` and a list `l`, it returns a sublist of `l` 
     *  containing its first items, up to (but not included) the item with 
     *  index `i`. For example:
     *  
     *  ```
     *  List.head 3 ['a','b','c','d','e']   // returns ['a','b','c']
     *  ```
     *  
     *  Negative indices are assumed to be relative to the end of th list.
     */    
    head (index) {
        ensureNumber(index);
        return list => ensureList(list).slice(0, index);
    },
    

    /**
     *  List.tail: (i:Numb) -> (l:List) -> List
     *  ----------------------------------------------------------------------------
     *  Given and index `i` and a list `l`, it returns a sublist of `l` 
     *  containing its last items, starting from (and including) the item with 
     *  index `i`. For example:
     *  
     *  ```
     *  List.head 3 ['a','b','c','d','e']   // returns ['d','e']
     *  ```
     *  
     *  Negative indices are assumed to be relative to the end of th list.
     */    
    tail (index) {
        ensureNumber(index);
        return list => ensureList(list).slice(index);
    },
}