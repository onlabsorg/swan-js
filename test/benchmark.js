const source = "3+1-2.35e-1*(23.5 % 4) + 3+1-2.35e-1*(23.5 % 4) + 3+1-2.35e-1*(23.5 % 4) + 3+1-2.35e-1*(23.5 % 4)";
const loops = 10000;



const Lexer = require("../lib/lexer");

const options = {

     binaryOperations: {
         ","  : {precedence:10, handler:"$pair"    },
         ":"  : {precedence:12, handler:"$label"   },
         "="  : {precedence:12, handler:"$set"     },
         "=>" : {precedence:13, handler:"$tmap"    },
         "?>" : {precedence:13, handler:"$umap"   },
         ">>" : {precedence:14, handler:"$pipe" },
         "<<" : {precedence:14, handler:"$compose", right:true},
         "->" : {precedence:15, handler:"$def",     right:true},

         ";"  : {precedence:21, handler:"$else"},
         "?"  : {precedence:22, handler:"$if"  },
         "|"  : {precedence:23, handler:"$or"  },
         "&"  : {precedence:23, handler:"$and" },
         "==" : {precedence:24, handler:"$eq"  },
         "!=" : {precedence:24, handler:"$ne"  },
         "<"  : {precedence:24, handler:"$lt"  },
         "<=" : {precedence:24, handler:"$le"  },
         ">"  : {precedence:24, handler:"$gt"  },
         ">=" : {precedence:24, handler:"$ge"  },
         "+"  : {precedence:25, handler:"$add" },
         "-"  : {precedence:25, handler:"$sub" },
         "*"  : {precedence:26, handler:"$mul" },
         "/"  : {precedence:26, handler:"$div" },
         "%"  : {precedence:26, handler:"$mod" },
         "^"  : {precedence:27, handler:"$pow" },

         "."  : {precedence:30, handler:"$dot" },
         "@"  : {precedence:30, handler:"$at" },
         ""   : {precedence:30, handler:"$apply" },
     },
     
     unaryOperations: {
        "+": "$id",
        "-": "$neg"
     },

     voidHandler        : "$nothing",
     nameHandler        : "$name",
     stringHandler1     : "$str1",
     stringHandler2     : "$str2",
     stringHandler3     : "$strt",
     numberHandler      : "$numb",
     squareGroupHandler : "$list",
     curlyGroupHandler  : "$namespace",
     
     errorHandler       : "$error"
}

const lexer = new Lexer({
    binaryOperators: Object.keys(options.binaryOperations),
    unaryOperators: Object.keys(options.unaryOperations)
});

let t0 = Date.now();
for (let i=0; i<loops; i++) {
    lexer.tokenize(source);
}
let lexer_time = Date.now() - t0;
console.log("Lexer time: ", lexer_time);



const {parse, context} = require("../lib/interpreter");
t0 = Date.now();
for (let i=0; i<loops; i++) {
    parse(source);
}
let parser_time = Date.now() - t0 - lexer_time;
console.log("Parser time: ", parser_time);



async function evaluate(source, loops, presets={}) {
    let evaluate = parse(source);
    let ctx = Object.assign(Object.create(context), presets);
    let t0 = Date.now();
    for (let i=0; i<loops; i++) {
        await evaluate(ctx);
    }
    return Date.now() - t0;
}

async function test_evaluator () {
    var t;
    
    t = await evaluate(source, loops);
    console.log("Eval time: ", t);    
    
    t = await evaluate(`2+1`, loops);
    console.log("X+Y: ", t);    

    t = await evaluate(`2*1`, loops);
    console.log("X*Y: ", t);

    t = await evaluate(`f 1`, loops, {f:x=>x});
    console.log("X Y: ", t);
}

test_evaluator();









