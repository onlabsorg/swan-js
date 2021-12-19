
const builtins = module.exports = {

    Bool      : {},
    Numb      : require("./builtins/Numb"),
    Text      : require("./builtins/Text"),
    Func      : {},
    Undefined : {},
    List      : require("./builtins/List"),
    Namespace : {},
    Tuple     : {},
    
    Time      : require("./builtins/Time"),
    Dict      : require("./builtins/Dict"),
};

