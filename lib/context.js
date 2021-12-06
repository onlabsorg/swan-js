const types = require("./types");

const ctx = module.exports = {};


ctx.Bool = {
    
    from (term) {
        return new types.Bool( wrap(term).toBoolean() );
    }
}


ctx.Numb = {}


ctx.Func = {}


ctx.Undefined = {}


ctx.Text = {}


ctx.List = {}


ctx.Namespace = {}


ctx.Tuple = {}



