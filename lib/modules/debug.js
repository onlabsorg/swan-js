/**
 *  debug module
 *  ============================================================================
 *  The debug module provides functions for debugging swan code.
 */



module.exports = types => {
    const debug = {};
    
    
    /**
     *  `debug.log: Term t -> Text id`
     *  ------------------------------------------------------------------------
     *  The log function writes the passed item to the javascript console.
     */
    let logCount = 0;
    debug.log = (...values) => {
        const term = new types.Tuple(...values).normalize();
        
        logCount++;
        console.log(`Log ${logCount}:`, term);
        return `[[Log ${logCount}]]`;
    }
    
    
    /**
     *  `debug.inspect: Term t -> Namespace info`
     *  ------------------------------------------------------------------------
     *  Returns an object containing detailed information about the passed term.
     */
    debug.inspect = (...values) => {
        const term = new types.Tuple(...values).normalize();
        
        const info = {
            type: term.typeName
        }
        
        // return;

        switch (info.type) {
            
            case "Bool":
            case "Numb":
            case "Text":
                info.value = types.unwrap(term);
                break;
                
            case "List":
                info.value = term.domain.map(index => debug.inspect(term.vget(index)));
                break;
                
            case "Namespace":
                info.value = {};
                for (let key of term.domain) {
                    info.value[key] = debug.inspect(term.vget(key))
                }
                break;
                
            case "Func":
                break;
                
            case "Tuple":
                info.value = Array.from(term.items()).map(item => debug.inspect(item));
                break;
                
            case "Undefined":
                info.operation = term.type;
                info.arguments = term.args.map(arg => debug.inspect(arg));
                if (term.position) {
                    const [row, col] = term.position.getLocation();
                    info.source = term.position.source.split('\n')[row-1];
                    info.position = col;
                }
                break;
        }
        
        return info;
    }
    
    return debug;
}
