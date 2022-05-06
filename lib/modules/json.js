/**
 *  json module
 *  ============================================================================
 *  
 *  This module contains functions for parsing and serializing JSON data.
 */
 
module.exports = types => {
    const json = {};
    
    const undefined_text = new types.Undefined("Text");
    const undefined_namespace = new types.Undefined("Namespace");

    const isString = x => types.wrap(x) instanceof types.Text;
    const isNamespace = x => types.wrap(x) instanceof types.Namespace;

    
    /**
     *  json.parse: Text t -> Namespace ns
     *  ------------------------------------------------------------------------
     *  Converts a JSON string to a namespace. 
     */
    json.parse = str => isString(str) ? JSON.parse(types.unwrap(str)) : undefined_namespace;


    /**
     *  json.parse: Term t -> Text s
     *  ------------------------------------------------------------------------
     *  Converts a term to a JSON string. It returns `Undefined(Text)` if `t` is
     *  a `Func` or an `Undefined` item.
     */
    json.serialize = (...items) => {
        const term = new types.Tuple(...items);
        
        return term.imapSync(item => {            
            switch (item.typeName) {
                
                case 'Bool':
                case 'Numb':
                case 'Text':
                case 'List':
                case 'Namespace':
                    return JSON.stringify(types.unwrap(item), null, 2);
                    
                default:
                    return undefined_text;
            }
        });
    }

    return json;
}