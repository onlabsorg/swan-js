/**
 *  namespace module
 *  ----------------------------------------------------------------------------
 *  
 *  This module contains functions that operate on the swan Namespace data type.
 */
 
module.exports = types => {
    const namespace = {};
    
    const isFunc = x => types.wrap(x) instanceof types.Func;
    const undefined_namespace = new types.Undefined("Namespace");


    /**
     *  ### namespace.size: Namespace N -> Numb n
     *  Returns the number of items contained in the passed namespace.
     *  If the argument is not a Namespace item, this function returns 
     *  Undefined Number.
     *  If the parameter is a tuple, this function applies only to the first
     *  item and ignores the others.
     */
    namespace.size = N => {
        N = types.wrap(N);
        return N instanceof types.Namespace ? N.domain.length : NaN;
    };


    /**
     *  ### namespace.domain: Namespace N -> Text Tuple d
     *  Returns the tuple of the names of the given namespace.
     *  If the argument is not a Namespace item, this function returns 
     *  Undefined Tuple.
     *  If the parameter is a tuple, this function applies only to the first
     *  item and ignores the others.
     */
    namespace.domain = N => {
        N = types.wrap(N);
        if (N instanceof types.Namespace) {
            return new types.Tuple(...N.domain.sort());
        } else {
            return new types.Undefined("Tuple");
        }
    };
    

    /**
     *  ### namespace.map: Func F -> Namespace N -> Namespace FN
     *  Takes a Func item `F` as argument and returns a function `f`. 
     *  If the argument is a tuple, it applies only to its first item.
     *  
     *  The returned function `f`: 
     *  - takes a Namespace `N` as argument and returns a new namespace containg 
     *    the same names as N, but with associated values equal to F(N(name)).
     *  - returns Undefined Namespace if the argument of `f` is not a Namespace 
     *    item
     *  - applies only on the first item if the parameter of `f` is a tuple
     */
    namespace.map = fn => isFunc(fn) ?
        
        async N => {
            N = types.wrap(N);
            if (N instanceof types.Namespace) {
                const dom = N.domain;
                const image = {};
                for (let key of dom) image[key] = types.unwrap( await fn(N.vget(key)) );
                return image;
            } else {
                return undefined_namespace;
            }
        } :
        
        N => undefined_namespace;


    return namespace;
}
