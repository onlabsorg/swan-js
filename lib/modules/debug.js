/**
 *  debug module
 *  ============================================================================
 *  The debug module provides functions for debugging swan code.
 */



module.exports = types => {
    const debug = {};
    
    
    /**
     *  debug.log: Term t -> Text id
     *  ------------------------------------------------------------------------
     *  The log function writes the passed item to the javascript console.
     */
    let logCount = 0;
    debug.log = async (...values) => {
        const term = new types.Tuple(...values).normalize();
        
        logCount++;
        console.log(`Log ${logCount}:`, term);
        return `[[Log ${logCount}]]`;
    }
    
    
    return debug;
}

