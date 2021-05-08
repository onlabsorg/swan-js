/**
 *  debug - swan stdlib module
 *  ============================================================================
 *  The debug module provides functions for debugging swan code.
 */


/**
 *  debug.log - function
 *  ----------------------------------------------------------------------------
 *  The log function writes the passed item to the javascript console.
 */
var logCount = 0;
exports.log = async function (...items) {
    const context = this;
    const value = context.$Tuple(...items).normalize();
    
    logCount++;
    console.log(`Log ${logCount}:`, value);
    return `[[Log ${logCount}]]`;
}



/**
 *  debug.inspect - function
 *  ----------------------------------------------------------------------------
 *  The inspect function returns a `descriptor` namespace containing detailed
 *  information about the passed item.
 */
const inspect = exports.inspect = async function (...items) {
    const context = this;
    
    const value = context.$Tuple(...items).normalize();
    
    if (value instanceof context.$Tuple) return {
        type: "Tuple",
        data: Array.from(await value.mapAsync(item => inspect.call(context, item)))
    }
    
    if (value instanceof Error) return {
        type: "Error",
        data: value,
    }

    const type = await context.type(value);
    
    switch (type) {
        
        case "Undefined":
            return {
                type: type, 
                data: Array.from(await value.args.mapAsync(arg => inspect.call(context, arg)))
            };
            
        case "List":
            return {type, data: await Promise.all(value.map(item => inspect.call(context, item)))};
            
        case "Namespace":
            return {type, data: await mapObject(value, item => inspect.call(context, item))};
            
        default:
            return {type, data: value};
    }
}

async function mapObject (obj, map) {
    const newObj = {};
    for (let key in obj) {
        newObj[key] = await map(obj[key]);
    }
    return newObj;
}
