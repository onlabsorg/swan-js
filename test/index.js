var expect = require("chai").expect;
var T = require("../lib/types");
var {parse, createContext, createTuple} = require("../index");
var evaluate = (source, context) => parse(source)(context);
var createEvaluator = context => source => evaluate(source, createContext(context));

const isTuple = value => typeof value[Symbol.iterator] === "function";


class ExceptionExpected extends Error {};
const Exception = Error;

async function expectError (testFn, message) {
    try {
        await testFn();
        throw new ExceptionExpected();
    } catch (e) {
        expect(e).to.be.instanceof(Exception);
        expect(e.message).to.equal(message);
    }    
}


describe("expression", () => {
    
    
    // CORE
    
    describe("numeric literals", () => {
        
        it("should evaluate decimal numeric literals to numbers", async () => {
            var ctx = createContext();
            expect(await evaluate("10", ctx)).to.equal(10);
            expect(await evaluate("0", ctx)).to.equal(0);
            expect(await evaluate("-10", ctx)).to.equal(-10);
            expect(await evaluate("3.2", ctx)).to.equal(3.2);
            expect(await evaluate("-3.2", ctx)).to.equal(-3.2);
            expect(await evaluate("1.2e3", ctx)).to.equal(1200);
        });
    });
    
    describe("string literals", () => {
    
        it(`should evaluate string literals between double quotes '""'`, async () => {
            var ctx = createContext();
            expect(await evaluate(`"abc"`, ctx)).to.equal("abc");
            expect(await evaluate(`""`, ctx)).to.equal("");
        });        
    
        it("should evaluate string literals between single quotes `''`", async () => {
            var ctx = createContext();
            expect(await evaluate(`'def'`, ctx)).to.equal("def");
            expect(await evaluate(`''`, ctx)).to.equal("");
        });        
    
        it("should evaluate string literals between accent quotes '``'", async () => {
            var ctx = createContext();
            expect(await evaluate("`ghi`", ctx)).to.equal("ghi");
            expect(await evaluate("``", ctx)).to.equal("");
        });        
    });
    
    describe("tuples: `exp1, exp2, exp3, ...`", () => {
    
        it("should return the comma-separated values as an iterable", async () => {
            var ctx = createContext();
            var tuple = await evaluate("10,'abc'", ctx);
            expect(isTuple(tuple)).to.be.true;
            expect(Array.from(tuple)).to.deep.equal([10,"abc"]);            
        });
    
        it("should flatten tuples of tuples: `(X,Y),Z` results in `X,Y,Z`", async () => {
            var ctx = createContext();
            var tuple = await evaluate("1,(2,3),4,(5,(6,7)),8,9", ctx);
            expect(isTuple(tuple)).to.be.true;
            expect(Array.from(tuple)).to.deep.equal([1,2,3,4,5,6,7,8,9]);
        });
    
        it("should ignore empty tuples when flattening tuples: `X,(),Y` results in `X,Y`", async () => {
            var ctx = createContext();
    
            var tuple = await evaluate("1,(),2", ctx);
            expect(isTuple(tuple)).to.be.true;
            expect(Array.from(tuple)).to.deep.equal([1,2]);
    
            var tuple = await evaluate("(),(1,(),2),(),3", ctx);
            expect(isTuple(tuple)).to.be.true;
            expect(Array.from(tuple)).to.deep.equal([1,2,3]);            
        });
    
        it("should evaluate empty tuples `()` as null", async () => {
            var ctx = createContext();
            expect(await evaluate("", ctx)).to.equal(null);
            expect(await evaluate("()", ctx)).to.equal(null);
            expect(await evaluate("(), (), ()", ctx)).to.equal(null);
        });
    
        it("should evaluate 1-uples (x,()) as x", async () => {
            var ctx = createContext();
            expect(await evaluate("(), 10, ()", ctx)).to.equal(10);
        });
    });
    
    describe("lists: `[expression]`", () => {
    
        it("should return an array", async () => {
            var ctx = createContext();
    
            var list = await evaluate("[1,'abc',3]", ctx);
            expect(list).to.deep.equal([1,"abc",3]);
    
            var list = await evaluate("[1]", ctx);
            expect(list).to.deep.equal([1]);
    
            var list = await evaluate("[]", ctx);
            expect(list).to.deep.equal([]);
        });
    
        it("should not flatten deep lists", async () => {
            var ctx = createContext();
            var list = await evaluate("[[1,2],3,4,[]]", ctx)
            expect(list).to.deep.equal([[1,2],3,4,[]]);            
        });
    });
    
    describe("name resolution", () => {
    
        it("should return the value mapped to the name in the current context", async () => {
            var ctx = createContext({a:10, _b:20, __c__:"xxx"});
            expect(await evaluate("a", ctx)).to.equal(10);
            expect(await evaluate("_b", ctx)).to.equal(20);
            expect(await evaluate("__c__", ctx)).to.equal("xxx");
        });
    
        it("should return `null` (empty tuple) if the name is not mapped", async () => {
            var ctx = createContext({a:10, _b:20});
            expect(await evaluate("d", ctx)).to.equal(null);
        });        
    
        it("should throw an error if an invalid name is used", async () => {
            var ctx = createContext({$a:10});
    
            try {
                expect(await evaluate("$a", ctx)).to.equal(10);            
                throw new ExceptionExpected();                
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
            }
    
            try {
                expect(await evaluate("1x", ctx)).to.equal(10);            
                throw new ExceptionExpected();                
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
            }
        });
    
        it("should not return properties inherited from javascript Object", async () => {
            var ctx = createContext();
            expect(await evaluate("isPrototypeOf", ctx)).to.be.null;
            expect(await evaluate("hasOwnProperty", ctx)).to.be.null;
        });
    
        describe("name resolution in a child context", () => {
    
            it("should return the child name value if name is mapped in the child context", async () => {
                var ctx = createContext({a:10, b:20});
                var cctx = Object.create(Object.assign(ctx, {a:100}));
                expect(await evaluate("a", cctx)).to.equal(100);
            });
    
            it("should return the parent name value if name is not mapped in the child context", async () => {
                var ctx = createContext({a:10, b:20});
                var cctx = Object.create(Object.assign(ctx, {a:100}));
                expect(await evaluate("b", cctx)).to.equal(20);
            });
    
            it("should return null if the name is not mapped in the child context nor in the parent context", async () => {
                var ctx = createContext({a:10, b:20});
                var cctx = Object.create(Object.assign(ctx, {a:100}));
                expect(await evaluate("c", cctx)).to.equal(null);                            
            });
        });
    });
    
    describe("TRUE constant", () => {
        it("should return true", async () => {
            var ctx = createContext();
            expect(await evaluate("TRUE", ctx)).to.equal(true);
        });
    });
    
    describe("FALSE constant", () => {
        it("should return false", async () => {
            var ctx = createContext();
            expect(await evaluate("FALSE", ctx)).to.equal(false);
        });
    });

    describe("labelling operation `name: expression`", () => {        
        
        it("should create a new name in the current context and map it to the given value", async () => {
            var ctx = createContext();                        
            await evaluate("x: 10", ctx);
            expect(ctx.x).to.equal(10);            
        });
    
        it("should assign a tuple of values to a tuple of names", async () => {
            var ctx = createContext();            
            await evaluate("(a,b,c) : (1,2,3)", ctx);
            expect(ctx.a).to.equal(1);        
            expect(ctx.b).to.equal(2);        
            expect(ctx.c).to.equal(3);        
        });
    
        it("should assign null to the last names if the values tuple is smaller than the names tuple", async () => {
            var ctx = createContext();
            await evaluate("(a,b,c,d) : (10,20)", ctx);
            expect(ctx.a).to.equal(10);        
            expect(ctx.b).to.equal(20);        
            expect(ctx.c).to.be.null;                    
            expect(ctx.d).to.be.null;                    
        });
    
        it("should assign to the last name the tuple of remaining values if the names tuple is smaller than the values tuple", async () => {
            var ctx = createContext();
    
            await evaluate("(a,b) : (100,200,300)", ctx);
            expect(ctx.a).to.equal(100);        
            expect(isTuple(ctx.b)).to.be.true;
            expect(Array.from(ctx.b)).to.deep.equal([200,300]);
    
            await evaluate("c : (10,20,30)", ctx);
            expect(isTuple(ctx.c)).to.be.true;
            expect(Array.from(ctx.c)).to.deep.equal([10,20,30]);
        });
    
        it("should overwrite an existing name-value mapping", async () => {
            var ctx = createContext({a:1});
            await evaluate("a : 2", ctx);            
            await evaluate("a : 3", ctx);            
            expect(ctx.a).to.equal(3);
        });        
        
        it("should return the expression value", async () => {
            var ctx = createContext();
            expect(await evaluate("x: 10", ctx)).to.equal(10);  
            
            var val = await evaluate("(a,b,c) : (1,2,3)", ctx);
            expect(Array.from(val)).to.deep.equal([1,2,3]);
                      
            var val = await evaluate("(a,b,c,d) : (10,20)", ctx);
            expect(Array.from(val)).to.deep.equal([10,20]);

            var val = await evaluate("(a,b) : (100,200,300)", ctx);
            expect(Array.from(val)).to.deep.equal([100,200,300]);

            var val = await evaluate("c : (10,20,30)", ctx);
            expect(Array.from(val)).to.deep.equal([10,20,30]);
        });
    });
        
    describe("assignment operation: name = expression", () => {        
    
        it("should return null", async () => {
            var ctx = createContext();
            expect(await evaluate("x = 10", ctx)).to.equal(null);            
        });
    
        it("should create a new name in the current context and map it to the given value", async () => {
            var ctx = createContext();                        
            await evaluate("x = 10", ctx);
            expect(ctx.x).to.equal(10);            
        });
    
        it("should assign a tuple of values to a tuple of names", async () => {
            var ctx = createContext();            
            await evaluate("(a,b,c) = (1,2,3)", ctx);
            expect(ctx.a).to.equal(1);        
            expect(ctx.b).to.equal(2);        
            expect(ctx.c).to.equal(3);        
        });
    
        it("should assign null to the last names if the values tuple is smaller than the names tuple", async () => {
            var ctx = createContext();
            await evaluate("(a,b,c,d) = (10,20)", ctx);
            expect(ctx.a).to.equal(10);        
            expect(ctx.b).to.equal(20);        
            expect(ctx.c).to.be.null;                    
            expect(ctx.d).to.be.null;                    
        });
    
        it("should assign to the last name the tuple of remaining values if the names tuple is smaller than the values tuple", async () => {
            var ctx = createContext();
    
            await evaluate("(a,b) = (100,200,300)", ctx);
            expect(ctx.a).to.equal(100);        
            expect(isTuple(ctx.b)).to.be.true;
            expect(Array.from(ctx.b)).to.deep.equal([200,300]);
    
            await evaluate("c = (10,20,30)", ctx);
            expect(isTuple(ctx.c)).to.be.true;
            expect(Array.from(ctx.c)).to.deep.equal([10,20,30]);
        });
    
        it("should overwrite an existing name-value mapping", async () => {
            var ctx = createContext({a:1});
            await evaluate("a = 2", ctx);            
            await evaluate("a = 3", ctx);            
            expect(ctx.a).to.equal(3);
        });        
    });
    
    describe("namespace definition: {expression}", () => {
    
        it("return an object with the mapped names", async () => {
            var ctx = createContext();                    
            expect(await evaluate("{x=1, y:2, z=3}", ctx)).to.deep.equal({x:1,y:2,z:3});
        });
    
        it("should ignore the non-assignment operations", async () => {
            var ctx = createContext();                    
            expect(await evaluate("{x=1, 10, y=2, z=3}", ctx)).to.deep.equal({x:1,y:2,z:3});
        });
    
        it("should not assign the names to the parent context", async () => {
            var ctx = createContext({x:10});                    
            expect(await evaluate("{x=20}", ctx)).to.deep.equal({x:20});
            expect(ctx.x).to.equal(10);
        });
    });
    
    describe("function definition: names_tuple -> expression", () => {
    
        it("should return a function resolving the expression in a context augumented with the argument names", async () => {
            var ctx = createContext();        
            var foo = await evaluate("(x, y) -> [y,x]", ctx);
            expect(foo).to.be.a("function");
            expect(await foo(10,20)).to.deep.equal([20,10]);
        });
    
        it("should follow the assignment rules when mapping argument names to parameters", async () => {
            var ctx = createContext();        
    
            var foo = await evaluate("(x, y) -> {a=x,b=y}", ctx);
            expect(await foo(10)).to.deep.equal({a:10, b:null});            
    
            var retval = await foo(10,20,30);
            expect(retval.a).to.equal(10);
            expect(isTuple(retval.b)).to.be.true;
            expect(Array.from(retval.b)).to.deep.equal([20,30]);
        });
    
        it("should be righ-to-left associative", async () => {
            var ctx = createContext();        
    
            var foo = await evaluate("x -> y -> {a=x,b=y}", ctx);
            var foo10 = await foo(10);
            expect(foo10).to.be.a("function");
            expect(await foo10(20)).to.deep.equal({a:10, b:20});                        
        });
    });
    
    describe("'apply' operation: X Y", () => {
    
        describe("when X is a function", () => {
    
            it("should call the function with the parameter Y and return its return value", async () => {
                var ctx = createContext({
                    double: x => 2 * x,
                    sum: (x,y) => x + y
                });                    
                expect(await evaluate("(x -> [x]) 10", ctx)).to.deep.equal([10]);
                expect(await evaluate("((x, y) -> [y,x])(10, 20)", ctx)).to.deep.equal([20,10]);
                expect(await evaluate("double 25", ctx)).to.equal(50);
                expect(await evaluate("sum(10, 20)", ctx)).to.equal(30);
            });
        });
    
        describe("when X is a string", async () => {
    
            it("shoudl return the character at Y if Y is an integer", async () => {
                var ctx = createContext();
                expect(await evaluate("'abcdef' 2", ctx)).to.equal('c');                    
            });
    
            it("should consider only the integer part of Y if Y is a decimal number", async () => {
                var ctx = createContext();
                expect(await evaluate("'abcdef' 2.3", ctx)).to.equal('c');                                        
            });
    
            it("should consider negative indexes as relative to the string end", async () => {
                var ctx = createContext();
                expect(await evaluate("'abcdef' (-2)", ctx)).to.equal('e');                                        
            });
    
            it("should return an empty string if Y is an out of range number", async () => {
                var ctx = createContext();
                expect(await evaluate("'abcdef' 100", ctx)).to.equal("");
                expect(await evaluate("'abcdef' (-100)", ctx)).to.equal("");                                                            
            });
        });
    
        describe("when X is a list", () => {
    
            it("shoudl return the item at index Y if Y is an integer", async () => {
                var ctx = createContext();
                expect(await evaluate("['a','b','c','d','e','f'] 2", ctx)).to.equal('c');                    
            });
    
            it("should consider only the integer part of Y if it is a decimal number", async () => {
                var ctx = createContext();
                expect(await evaluate("['a','b','c','d','e','f'] 2.3", ctx)).to.equal('c');                                        
            });
    
            it("should consider a negative indexe Y as relative to the list end", async () => {
                var ctx = createContext();
                expect(await evaluate("['a','b','c','d','e','f'] (-2)", ctx)).to.equal('e');                                                            
            });
    
            it("should return null if the index Y is out of range", async () => {
                var ctx = createContext();
                expect(await evaluate("['a','b','c','d','e','f'] 100", ctx)).to.equal(null);                                                            
                expect(await evaluate("['a','b','c','d','e','f'] (-100)", ctx)).to.equal(null);                                                            
            });
        });
    
        describe("when X is a namespace", () => {
    
            it("should return the value mapped to the name Y", async () => {
                var ctx = createContext();
                expect(await evaluate("{a=1,b=2,c=3} 'c'", ctx)).to.equal(3);
            });
    
            it("should return null if Y is not a valid name", async () => {                    
                var ctx = createContext();
                expect(await evaluate("{a=1,b=2,c=3} 1", ctx)).to.equal(null);
                expect(await evaluate("{a=1,b=2,c=3} '$key'", ctx)).to.equal(null);
                expect(await evaluate("{a=1,b=2,c=3} ('a','b')", ctx)).to.equal(null);
            });
    
            it("should return null if Y is a name not mapped to any value", async () => {
                var ctx = createContext();
                expect(await evaluate("{a=1,b=2,c=3} 'd'", ctx)).to.equal(null);
            });
    
            it("should delegate to `X.__apply__` if it exists and it is a function", async () => {
                var ctx = createContext();
    
                var val = await evaluate("{__apply__ = s -> ['val of', s]}('x')", ctx);
                expect(val).to.deep.equal(["val of", "x"]);
    
                var val = await evaluate("{__apply__ = (x,y) -> ['val:', y, x]}(10,20)", ctx);
                expect(val).to.deep.equal(["val:", 20, 10]);
    
                val = await evaluate("{__apply__=1, a=2}('a')", ctx);
                expect(val).to.equal(2);
            });            
        });
    
        describe("when X is a number", () => {
    
            it("should throw an exception", async () => {
                var ctx = createContext();
    
                try {
                    await evaluate("(10)(1)", ctx);
                    throw new Error();
                } catch (e) {
                    expect(e).to.be.instanceof(Exception);
                    expect(e.message).to.equal("Apply operation not defined between Number and Number");
                }
            });            
        });
    
        describe("when X is a boolean", () => {
    
            it("should throw an exception", async () => {
                var ctx = createContext({b:true});
    
                try {
                    await evaluate("b(1)", ctx);
                    throw new Error();
                } catch (e) {
                    expect(e).to.be.instanceof(Exception);
                    expect(e.message).to.equal("Apply operation not defined between Boolean and Number");
                }
            });            
        });
    
        describe("when X is a tuple", () => {
            
            it("should throw an exception", async () => {
                var ctx = createContext();
    
                try {
                    await evaluate("(10, 20, 30)(1)", ctx);
                    throw new Error();
                } catch (e) {
                    expect(e).to.be.instanceof(Exception);
                    expect(e.message).to.equal("Apply operation not defined between Tuple and Number");
                }
            });            
        });        
    });    
    
    describe("composition: G << F", () => {
        
        it("should return a function that calculates G(F X)", async () => {
            var evaluate = createEvaluator({
                g: x => 2*x,
                f: x => x+1,
            });
            
            var fn = await evaluate('g << f');
            expect(fn).to.be.a("function");
            expect(await fn(3)).to.equal(2*(3+1));

            var fn = await evaluate('x->3*x << x->x+2');
            expect(fn).to.be.a("function");
            expect(await fn(3)).to.equal(3*(3+2));
        });
    });
    
    describe("reverse composition: F >> G", () => {
        
        it("should return a function that calculates G(F X)", async () => {
            var evaluate = createEvaluator({
                g: x => 2*x,
                f: x => x+1,
            });
            
            var fn = await evaluate('f >> g');
            expect(fn).to.be.a("function");
            expect(await fn(3)).to.equal(2*(3+1));
            
            var fn = await evaluate('x->x+2 >> x->3*x');
            expect(fn).to.be.a("function");
            expect(await fn(3)).to.equal(3*(3+2));            
        });
    });

    describe("sub-contexting: namespace.expression", () => {
    
        it("should evaluate 'Y' in the 'X' context if 'X' is a namespace", async () => {
            var ctx = createContext({x:10});
            await evaluate("ns = {y=20, z=30, _h=40}", ctx);
            expect(await evaluate("ns.y", ctx)).to.equal(20);
            expect(await evaluate("ns.[1,y,z]", ctx)).to.deep.equal([1,20,30]);
            expect(await evaluate("ns.x", ctx)).to.equal(10);
            expect(await evaluate("ns._h", ctx)).to.equal(40);
    
            var ctx = createContext({ns:{x:10,y:20,z:30}});
            expect(await evaluate("ns.[x,y,z]", ctx)).to.deep.equal([10,20,30]);
        });
    
        it("should see the global contexts", async () => {
            var ctx = createContext({x:10});
            await evaluate("ns = {y=20}", ctx);
            expect(await evaluate("ns.x", ctx)).to.equal(10);
            expect(await evaluate("ns.y", ctx)).to.equal(20);
        });

        it("should see the function parameters in a function expressions", async () => {
            var ctx = createContext({});
            await evaluate("ns = {x=10, y=20}", ctx);            
            await evaluate("f = nsp -> nsp.(3*x+nsp.y)", ctx);
            expect(await evaluate("f ns", ctx)).to.equal(50);
        });
    
        it("should return an error if 'X' is of any other type", async () => {
            var ctx = createContext();
            await expectError(() => evaluate("(10).name", ctx), "Namespace expected on the left side of the '.' operator");
            await expectError(() => evaluate("[].name", ctx), "Namespace expected on the left side of the '.' operator");
            await expectError(() => evaluate("(x->x).name", ctx), "Namespace expected on the left side of the '.' operator");
            await expectError(() => evaluate("({},{},10).name", ctx), "Namespace expected on the left side of the '.' operator");
        });
    });
    
    describe("comments", () => {
    
        it("should ignore the text following the `#` character up to the end of the line or of the expression", async () => {
            var ctx = createContext();
            var expression = `
                # this is a comment
                12.345 # this is another comment
                # this is the last comment`
            expect(await evaluate(expression, ctx)).to.equal(12.345);
        });
    
        it("should not parse `#` characters in a string as comments", async () => {
            var ctx = createContext();
            expect(await evaluate("`this # is a string`", ctx)).to.equal("this # is a string");
            expect(await evaluate("'this # is a string'", ctx)).to.equal("this # is a string");
            expect(await evaluate(`"this # is a string"`, ctx)).to.equal("this # is a string");
        });
    });
    
    
    // BUILT-IN FUNCTIONS
    
    describe("bool X", () => {
    
        it("should return X if it is a boolean", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("bool F", ctx)).to.equal(false);
            expect(await evaluate("bool T", ctx)).to.equal(true);                
        });
    
        it("should return true if X is a non-zero number", async () => {
            var ctx = createContext();            
            expect(await evaluate("bool 0", ctx)).to.equal(false);
            expect(await evaluate("bool 10", ctx)).to.equal(true);
            expect(await evaluate("bool (-1)", ctx)).to.equal(true);
        });
    
        it("should return true if X is a non-empty string", async () => {
            var ctx = createContext();            
            expect(await evaluate("bool ''", ctx)).to.equal(false);
            expect(await evaluate("bool 'abc'", ctx)).to.equal(true);
        });
    
        it("should return true if X is a non-empty list", async () => {
            var ctx = createContext();            
            expect(await evaluate("bool []", ctx)).to.equal(false);
            expect(await evaluate("bool [1,2,3]", ctx)).to.equal(true);
        });
    
        it("should return true if X is a non-empty namespace", async () => {
            var ctx = createContext();            
            expect(await evaluate("bool {}", ctx)).to.equal(false);
            expect(await evaluate("bool {a=1,b=2,c=3}", ctx)).to.equal(true);
        });
    
        it("should return true if X is a function", async () => {
            var ctx = createContext({jsFn:x=>2*x});
            expect(await evaluate("bool (x->x)", ctx)).to.equal(true);
            expect(await evaluate("bool jsFn", ctx)).to.equal(true);
        });
    
        it("should return true if X is a tuple with at least one true item", async () => {
            var ctx = createContext();
            expect(await evaluate("bool (0,0,0)", ctx)).to.equal(false);
            expect(await evaluate("bool (0,1,-1)", ctx)).to.equal(true);
        });
    
        it("should return false if X is an empty tuple", async () => {
            var ctx = createContext();
            expect(await evaluate("bool ()", ctx)).to.equal(false);
        });
        
        it("should await for X before converting it, if X is a promise", async () => {
            var evaluate = createEvaluator({
                no:  Promise.resolve(null),
                b0:  Promise.resolve(false),
                b1:  Promise.resolve(true),
                n0:  Promise.resolve(0),
                n1:  Promise.resolve(10),
                s0:  Promise.resolve(""),
                s1:  Promise.resolve("abc"),
                l0:  Promise.resolve([]),
                l1:  Promise.resolve([1,2,3]),
                ns0: Promise.resolve({}),
                ns1: Promise.resolve({x:10}),
                f:  Promise.resolve(x=>x),
                t0:  Promise.resolve(T.createTuple(0,0,0)),
                t1:  Promise.resolve(T.createTuple(1,2,3)),
            });
            expect(await evaluate("bool no")).to.be.false;
            expect(await evaluate("bool b0")).to.be.false;
            expect(await evaluate("bool b1")).to.be.true;
            expect(await evaluate("bool n0")).to.be.false;
            expect(await evaluate("bool n1")).to.be.true;
            expect(await evaluate("bool s0")).to.be.false;
            expect(await evaluate("bool s1")).to.be.true;
            expect(await evaluate("bool l0")).to.be.false;
            expect(await evaluate("bool l1")).to.be.true;
            expect(await evaluate("bool ns0")).to.be.false;
            expect(await evaluate("bool ns1")).to.be.true;
            expect(await evaluate("bool f")).to.be.true;
            expect(await evaluate("bool t0")).to.be.false;
            expect(await evaluate("bool t1")).to.be.true;
        });
    });
    
    describe("enum X", () => {
        
        it("should return the tuple `(x1,x2,x3,...)` when X is the list `[x1,x2,x3,...]`", async () => {
            var evaluate = createEvaluator({
                ls: [1,2,3]
            });
            
            var items = await evaluate("enum [10,20,30]");
            expect(isTuple(items)).to.be.true;
            expect(Array.from(items)).to.deep.equal([10,20,30]);
            
            var items = await evaluate("enum ls");
            expect(isTuple(items)).to.be.true;
            expect(Array.from(items)).to.deep.equal([1,2,3]);
        });
        
        it("should return the tuple `('a','b','c')` when X is the string `'abc'`", async () => {
            var evaluate = createEvaluator({
                s: "def"
            });
            
            var items = await evaluate("enum 'abc'");
            expect(isTuple(items)).to.be.true;
            expect(Array.from(items)).to.deep.equal(['a','b','c']);
            
            var items = await evaluate("enum s");
            expect(isTuple(items)).to.be.true;
            expect(Array.from(items)).to.deep.equal(['d','e','f']);
        });
        
        it("should return the tuple `('name1','name2',...)` when X is the namespace `{name1:val1, name2:val2, ...}`", async () => {
            var evaluate = createEvaluator({
                ns: {n4:10, n5:20, n6:30}
            });
            
            var items = await evaluate("enum {n1=10, n2=20, n3=30}");
            expect(isTuple(items)).to.be.true;
            expect(Array.from(items)).to.deep.equal(['n1','n2','n3']);
            
            var items = await evaluate("enum ns");
            expect(isTuple(items)).to.be.true;
            expect(Array.from(items)).to.deep.equal(['n4','n5','n6']);
        });
        
        describe("when X is of any other type", () => {
            
            it("should throw an error", async () =>{
                var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
                var expectRangeError = (expression, xType) => expectError(() => evaluate(expression, ctx), `Enumeration not defined for ${xType} type`);
                await expectRangeError("enum ()",      'Nothing');                                                
                await expectRangeError("enum T",       'Boolean');                                                
                await expectRangeError("enum F",       'Boolean');                                                
                await expectRangeError("enum 1",       'Number');                                                
                await expectRangeError("enum fn",      'Function');                                                                
                await expectRangeError("enum (1,2,3)", 'Tuple');                                    
            });
        });
    });
    
    describe("map f", () => {
        
        it("should return a function that takes a singleton X", async () => {
            var evaluate = createEvaluator({f: x=>2*x});
            var f = await evaluate("map f");
            expect(f).to.be.a("function");
        });
        
        it("should throw an error if the passed argument is not a function", async () => {
            var evaluate = createEvaluator({});
            await expectError(() => evaluate("map [1,2,3]"), "The 'map' function requires a function as parameter");
        });
        
        describe("the returned mapping function", () => {
            
            it("should map [a,b,c] to [f(x),f(y),f(z)]", async () => {
                var evaluate = createEvaluator({f:x=>2*x});
                expect(await evaluate("map f [1,2,3]")).to.deep.equal([2,4,6]);                
            });
            
            it("should map {k1:v1, k2:v2} to {k1:f(v1), k2:f(v2)}", async () => {
                var evaluate = createEvaluator({f:x=>2*x});
                expect(await evaluate("map f {a:1, b:2, c:3}")).to.deep.equal({a:2, b:4, c:6});                
            });
            
            it("should await for promise items before mapping", async () => {
                var evaluate = createEvaluator({
                    f: x=>2*x, 
                    p: Promise.resolve(10),
                });
                expect(await evaluate("map f [1,p,3]")).to.deep.equal([2,20,6]);                
                expect(await evaluate("map f {a:1, b:p, c:3}")).to.deep.equal({a:2, b:20, c:6});                
            });
            
            it("should throw an error if the passed parameter is neither a list nor a namespace", async () => {
                var evaluate = createEvaluator({
                    f: x=>2*x, Pf: Promise.resolve(x=>2*x),
                    no: null,  Pno: Promise.resolve(undefined),
                    b: true, Pb: Promise.resolve(true),
                    n: 10, Pn: Promise.resolve(10),
                    s: "abc", Ps: Promise.resolve("abc"),
                    t: T.createTuple(1,2,3), Pt: Promise.resolve(T.createTuple(1,2,3))
                });   
                var expectMapError = (exp, type) => expectError(() => evaluate(exp), `Mapping not defined for ${type} type`);
                await expectMapError("map f no",  "Nothing");
                await expectMapError("map f Pno", "Nothing");
                await expectMapError("map f b",   "Boolean");
                await expectMapError("map f Pb",  "Boolean");
                await expectMapError("map f n",   "Number");
                await expectMapError("map f Pn",  "Number");
                await expectMapError("map f s",   "String");
                await expectMapError("map f Ps",  "String");
                await expectMapError("map f f",   "Function");
                await expectMapError("map f Pf",  "Function");
                await expectMapError("map f t",   "Tuple");
                await expectMapError("map f Pt",  "Tuple");
            });
        });
    });
    
    describe("not X", () => {
    
        it("should return true if X is false and false if X is true", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("not F", ctx)).to.equal(true);
            expect(await evaluate("not T", ctx)).to.equal(false);                
        });
    
        it("should return false if X is a non-zero number", async () => {
            var ctx = createContext();            
            expect(await evaluate("not 0", ctx)).to.equal(true);
            expect(await evaluate("not 10", ctx)).to.equal(false);
            expect(await evaluate("not (-1)", ctx)).to.equal(false);
        });
    
        it("should return false if X is a non-empty string", async () => {
            var ctx = createContext();            
            expect(await evaluate("not ''", ctx)).to.equal(true);
            expect(await evaluate("not 'abc'", ctx)).to.equal(false);
        });
    
        it("should return false if X is a non-empty list", async () => {
            var ctx = createContext();            
            expect(await evaluate("not []", ctx)).to.equal(true);
            expect(await evaluate("not [1,2,3]", ctx)).to.equal(false);
        });
    
        it("should return false if X is a non-empty namespace", async () => {
            var ctx = createContext();            
            expect(await evaluate("not {}", ctx)).to.equal(true);
            expect(await evaluate("not {a=1,b=2,c=3}", ctx)).to.equal(false);
        });
    
        it("should return false if X is a function", async () => {
            var ctx = createContext({jsFn:x=>2*x});
            expect(await evaluate("not (x->x)", ctx)).to.equal(false);
            expect(await evaluate("not jsFn", ctx)).to.equal(false);
        });
    
        it("should return false if X is a tuple with at least one true item", async () => {
            var ctx = createContext();
            expect(await evaluate("not (0,0,0)", ctx)).to.equal(true);
            expect(await evaluate("not (0,1,-1)", ctx)).to.equal(false);
        });
    
        it("should return true if X is an empty tuple", async () => {
            var ctx = createContext();
            expect(await evaluate("not ()", ctx)).to.equal(true);
        });
    });
    
    describe("reduce f", () => {
        
        it("should return a reducer function", async () => {
            var evaluate = createEvaluator({});
            var redFn = await evaluate("reduce((x,y)->x+y)");
            expect(redFn).to.be.a("function");
            
            var val = await redFn(1,21,15,54);
            expect(val).to.equal(1+21+15+54);

            var val = await evaluate("reduce ((x,y)->x+y) (1,2,3,4)");
            expect(val).to.equal(1+2+3+4);
        });
        
        it("should throw an error if f is not a function", async () => {
            var evaluate = createEvaluator({});
            var expectReduceError = exp => expectError(() => evaluate(exp), "The 'reduce' function requires a function as argument");
            await expectReduceError("reduce ()");
            await expectReduceError("reduce TRUE");
            await expectReduceError("reduce 10");
            await expectReduceError("reduce 'abc'");
            await expectReduceError("reduce [1,2,3]");
            await expectReduceError("reduce {x:10}");
            await expectReduceError("reduce (x->x,2,3)");
        });
        
        describe("the reducer function", () => {
            
            it("should return the argument if it is not a tuple", async () => {
                var foo = ()=>null;
                var evaluate = createEvaluator({foo});
                var redFn = await evaluate("reduce((x,y)->x+y)");
                expect(redFn).to.be.a("function");
                
                expect(await redFn()).to.equal(null);
                expect(await evaluate("reduce ((x,y)->x+y) ()")).to.equal(null);
                
                expect(await redFn(true)).to.equal(true);
                expect(await evaluate("reduce ((x,y)->x+y) TRUE")).to.equal(true);

                expect(await redFn(10)).to.equal(10);
                expect(await evaluate("reduce ((x,y)->x+y) 10")).to.equal(10);

                expect(await redFn("abc")).to.equal("abc");
                expect(await evaluate("reduce ((x,y)->x+y) 'abc'")).to.equal("abc");

                expect(await redFn([1,2,3])).to.deep.equal([1,2,3]);
                expect(await evaluate("reduce ((x,y)->x+y) [1,2,3]")).to.deep.equal([1,2,3]);
                
                expect(await redFn({x:10})).to.deep.equal({x:10});
                expect(await evaluate("reduce ((x,y)->x+y) {x:10}")).to.deep.equal({x:10});
                
                expect(await redFn(foo)).to.equal(foo);
                expect(await evaluate("reduce ((x,y)->x+y) foo")).to.equal(foo);
            });
        });
    });

    describe("filter f", () => {
        
        it("should return a filtering function", async () => {
            var evaluate = createEvaluator({});
            var filFn = await evaluate("filter(x->x>0)");
            expect(filFn).to.be.a("function");
        });
        
        it("should throw an error if f is not a function", async () => {
            var evaluate = createEvaluator({});
            var expectFilterError = exp => expectError(() => evaluate(exp), "The 'filter' function requires a function as argument");
            await expectFilterError("filter ()");
            await expectFilterError("filter TRUE");
            await expectFilterError("filter 10");
            await expectFilterError("filter 'abc'");
            await expectFilterError("filter [1,2,3]");
            await expectFilterError("filter {x:10}");
            await expectFilterError("filter (x->x,2,3)");
        });
        
        describe("the filtering function", () => {
            
            it("should return a sub-list of the argument, if it is a list", async () => {
                var evaluate = createEvaluator({});
                var filFn = await evaluate("filter(x->x>0)");
                expect(filFn).to.be.a("function");
                
                var val = await filFn([0,1,-2,7,-12,3]);
                expect(val).to.deep.equal([1,7,3]);
                
                var val = await evaluate("filter (x->str x) [1,'',3,'']");
                expect(val).to.deep.equal([1,3]);
            });
            
            it("should return a sub-namespace of the argument, if it is a namespace", async () => {
                var evaluate = createEvaluator({});
                var filFn = await evaluate("filter(x->x>0)");
                expect(filFn).to.be.a("function");
                
                var val = await filFn({a:-1, b:0, c:1, d:10});
                expect(val).to.deep.equal({c:1, d:10});
                
                var val = await evaluate("filter (x->str x) {a:'', b:1, c:2}");
                expect(val).to.deep.equal({b:1, c:2});
            });   
            
            it("should throw an error if the argument is of any other type", async () => {
                var evaluate = createEvaluator({f:x=>x});
                var expectFilterError = (exp, type) => expectError(() => evaluate(exp), `Filtering not defined for ${type} type`);
                await expectFilterError("filter f ()", "Nothing");
                await expectFilterError("filter f TRUE", "Boolean");
                await expectFilterError("filter f 10", "Number");
                await expectFilterError("filter f 'abc'", "String");
                await expectFilterError("filter f (x->2*x)", "Function");
                await expectFilterError("filter f (x->x,2,3)", "Tuple");
            });         
        });
    });

    describe("range n`", () => {
        
        it("should return the tuple of all the integers between 0 and n-1", async () => {
            var ctx = createContext();
            var range = await evaluate("range(6)", ctx);
            expect(isTuple(range)).to.be.true;
            expect(Array.from(range)).to.deep.equal([0,1,2,3,4,5]);            
        });
        
        it("should work also if n < 0", async () => {
            var ctx = createContext();
            var range = await evaluate("range(-6)", ctx);
            expect(isTuple(range)).to.be.true;
            expect(Array.from(range)).to.deep.equal([0,-1,-2,-3,-4,-5]);            
        });
        
        it("should return an empty tuple if n is 0", async () => {
            var ctx = createContext();
            var range = await evaluate("range 0", ctx);
            expect(range).to.be.null;
        });
        
        it("should truncate n if decimal", async () => {
            var ctx = createContext();
            var range = await evaluate("range(5.9)", ctx);
            expect(isTuple(range)).to.be.true;
            expect(Array.from(range)).to.deep.equal([0,1,2,3,4]);            
            
            var ctx = createContext();
            var range = await evaluate("range(-5.1)", ctx);
            expect(isTuple(range)).to.be.true;
            expect(Array.from(range)).to.deep.equal([0,-1,-2,-3,-4]);            
            
            var ctx = createContext();
            var range = await evaluate("range 0.3", ctx);
            expect(range).to.be.null;
        });
        
        it("should throw an exception if n is not numbers", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            var expectRangeError = (expression, xType) => expectError(() => evaluate(expression, ctx), `Range not defined for ${xType} type`);
            await expectRangeError("range ()",    'Nothing');                                                
            await expectRangeError("range T",     'Boolean');                                                
            await expectRangeError("range F",     'Boolean');                                                
            await expectRangeError("range 'abc'", 'String');                                    
            await expectRangeError("range ls",    'List');                                    
            await expectRangeError("range fn",    'Function');                                                
            await expectRangeError("range ns",    'Namespace');                                    
        });
        
        it("should await for n before creating the tuple, if n is a promise", async () => {
            var evaluate = createEvaluator({
                pn: Promise.resolve(5),
                ps: Promise.resolve("abc")
            });
            
            var t = await evaluate("range pn");
            expect(isTuple(t)).to.be.true;
            expect(Array.from(t)).to.deep.equal([0,1,2,3,4]);
            
            await expectError(() => evaluate("range ps"), `Range not defined for String type`)
        });        
    });
    
    describe("size X", () => {
        
        it("should return the length if X is a string", async () => {
            var ctx = createContext();
            var size = await evaluate("size 'abc'", ctx);
            expect(size).to.equal(3);
        });
        
        it("should return the length if X is a list", async () => {
            var ctx = createContext();
            var size = await evaluate("size [1,2,3]", ctx);
            expect(size).to.equal(3);
        });
        
        it("should return the number of own names if X is a namespace", async () => {
            var ctx = createContext();            
            var size = await evaluate("size {a=1,b=2,c=3}", ctx);
            expect(size).to.equal(3);
            
            ctx.o = Object.assign(Object.create({x:1,y:2}), {a:1,b:2,c:3});
            var size = await evaluate("size o", ctx);
            expect(size).to.equal(3);
        });
        
        it("should asynchronously return the size of the future value", async () => {
            var evaluate = createEvaluator({
                p: Promise.resolve("abcd")
            });            
            var size = await evaluate("size p");
            expect(size).to.equal(4);            
        });
        
        it("should throw an error if X is of any other type", async () => {
            var evaluate = createEvaluator({});            
            var expectSizeError = (exp, XType) => expectError(() => evaluate(exp), `Size not defined for ${XType} type`);
            await expectSizeError("size TRUE", "Boolean");
            await expectSizeError("size 1", "Number");
            await expectSizeError("size ()", "Nothing");
            await expectSizeError("size (x->2*x)", "Function");
            await expectSizeError("size (1,2,3)", "Tuple");
        });
    });
    
    describe("str X", () => {
    
        it("should return an empty string if X is nothing", async () => {
            var ctx = createContext();
            expect(await evaluate("str ()", ctx)).to.equal("");
        });
    
        it("should return 'TRUE' if X is true", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("str T", ctx)).to.equal("TRUE");
        });
    
        it("should return 'FALSE' if X is false", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("str F", ctx)).to.equal("FALSE");
        });
    
        it("should return String(X) if X is a number", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("str 123.4", ctx)).to.equal("123.4");
        });
    
        it("should return X itself if it is a string", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("str 'abc'", ctx)).to.equal("abc");
        });
    
        it("should return '[[Function]]' if X is a javascript function", async () => {
            var ctx = createContext({jsFn: x => 2*x});
            expect(await evaluate("str jsFn", ctx)).to.equal("[[Function]]");
        });
    
        it("should return the functions source if X is a Swan function", async () => {
            var evaluate = createEvaluator({});
            expect(await evaluate("str(x -> 2+3*x)")).to.equal("((x)->(2+(3*x)))");
        });

        it("should return '[[List of n items]]' when X is a list with n items", async () => {
            var ctx = createContext({T:true, F:false});            
            expect(await evaluate("str[1,2,'abc']", ctx)).to.equal("[[List of 3 items]]")
        });
    
        it("should return '[[Namespace of n items]]' when n is the number of items", async () => {
            var ctx = createContext({T:true, F:false});            
            expect(await evaluate("str{a=1,b=2,c=3}", ctx)).to.equal("[[Namespace of 3 items]]");
        });
    
        it("should return X.__str__(X) if it exists and it is a function", async () => {
            var evaluate = createEvaluator({
                ns: {
                    s: "ns string",
                    __str__: ns => ns.s
                }
            });
            expect(await evaluate("str ns")).to.equal("ns string");
        });
    
        it("should concatenate the serialized item if X is a tuple", async () => {
            var ctx = createContext({T:true, F:false, sum: (x,y) => x+y});
            expect(await evaluate("str('it is ',T,' that 1+2 is ',sum(1,2))", ctx)).to.equal("it is TRUE that 1+2 is 3");
        });
    });            
    
    describe("type x", () => {
        
        it("should return 'Nothing' if `x` is an empty tuple", async () => {
            expect(await evaluate("type()", createContext())).to.equal("Nothing");
        });
        
        it("should return 'Boolean' if `x` is a boolean value", async () => {
            expect(await evaluate("type TRUE", createContext())).to.equal("Boolean");
            expect(await evaluate("type FALSE", createContext())).to.equal("Boolean");
        });
        
        it("should return 'Number' if `x` is a number", async () => {
            expect(await evaluate("type 1", createContext())).to.equal("Number");
        });
        
        it("should return 'String' if `x` is a string", async () => {
            expect(await evaluate("type 'abc'", createContext())).to.equal("String");
        });
        
        it("should return 'List' if `x` is a list", async () => {
            expect(await evaluate("type [1,2,3]", createContext())).to.equal("List");
        });
        
        it("should return 'Namespace' if `x` is a namespace", async () => {
            expect(await evaluate("type {x:1}", createContext())).to.equal("Namespace");
        });
        
        it("should return 'Function' if `x` is a function", async () => {
            expect(await evaluate("type(()->())", createContext())).to.equal("Function");
        });
        
        it("should return 'Tuple' if `x` is a tuple", async () => {
            expect(await evaluate("type(1,2,3)", createContext())).to.equal("Tuple");
        });
        
        it("should await for the value if x is a promise", async () => {
            var evaluate = createEvaluator({
                no: Promise.resolve(null),
                b:  Promise.resolve(true),
                n:  Promise.resolve(10),
                s:  Promise.resolve("abc"),
                l:  Promise.resolve([1,2,3]),
                ns: Promise.resolve({}),
                f:  Promise.resolve(x=>x),
                t:  Promise.resolve(T.createTuple(1,2,3)),
            });
            expect(await evaluate("type no")).to.equal("Nothing");
            expect(await evaluate("type b")).to.equal("Boolean");
            expect(await evaluate("type n")).to.equal("Number");
            expect(await evaluate("type s")).to.equal("String");
            expect(await evaluate("type l")).to.equal("List");
            expect(await evaluate("type ns")).to.equal("Namespace");
            expect(await evaluate("type f")).to.equal("Function");
            expect(await evaluate("type t")).to.equal("Tuple");
        });
    });
    
    
    // LOGIC OPERATORS
    
    describe("X | Y", () => {
    
        it("should return X if `bool X` is true", async () => {
            var ctx = createContext({T:true, F:false});
    
            // true or true
            expect(await evaluate("T | T", ctx)).to.equal(true);
            expect(await evaluate("T | 10", ctx)).to.equal(true);
            expect(await evaluate("10 | T", ctx)).to.equal(10);
            expect(await evaluate("10 | 10", ctx)).to.equal(10);
    
            // true or false
            expect(await evaluate("T | F", ctx)).to.equal(true);
            expect(await evaluate("T | 0", ctx)).to.equal(true);
            expect(await evaluate("10 | F", ctx)).to.equal(10);
            expect(await evaluate("10 | 0", ctx)).to.equal(10);    
        })
    
        it("should return Y if `bool X` is false", async () => {
            var ctx = createContext({T:true, F:false});
    
            // false or true
            expect(await evaluate("F | T", ctx)).to.equal(true);
            expect(await evaluate("F | 10", ctx)).to.equal(10);
            expect(await evaluate("0 | T", ctx)).to.equal(true);
            expect(await evaluate("0 | 10", ctx)).to.equal(10);
    
            // false or false
            expect(await evaluate("F | F", ctx)).to.equal(false);
            expect(await evaluate("F | 0", ctx)).to.equal(0);
            expect(await evaluate("0 | F", ctx)).to.equal(false);
            expect(await evaluate("0 | 0", ctx)).to.equal(0);
        })
    });
    
    describe("X & Y", () => {
    
        it("should return Y if `bool X` is true", async () => {
            var ctx = createContext({T:true, F:false});
    
            // true or true
            expect(await evaluate("T & T", ctx)).to.equal(true);
            expect(await evaluate("T & 10", ctx)).to.equal(10);
            expect(await evaluate("10 & T", ctx)).to.equal(true);
            expect(await evaluate("10 & 10", ctx)).to.equal(10);
    
            // true or false
            expect(await evaluate("T & F", ctx)).to.equal(false);
            expect(await evaluate("T & 0", ctx)).to.equal(0);
            expect(await evaluate("10 & F", ctx)).to.equal(false);
            expect(await evaluate("10 & 0", ctx)).to.equal(0);    
        })
    
        it("should return X if `bool X` is false", async () => {
            var ctx = createContext({T:true, F:false});
    
            // false or true
            expect(await evaluate("F & T", ctx)).to.equal(false);
            expect(await evaluate("F & 10", ctx)).to.equal(false);
            expect(await evaluate("0 & T", ctx)).to.equal(0);
            expect(await evaluate("0 & 10", ctx)).to.equal(0);
    
            // false or false
            expect(await evaluate("F & F", ctx)).to.equal(false);
            expect(await evaluate("F & 0", ctx)).to.equal(false);
            expect(await evaluate("0 & F", ctx)).to.equal(0);
            expect(await evaluate("0 & 0", ctx)).to.equal(0);
        })
    });
    
    describe("X ? Y", () => {
    
        it("should return Y is `bool X` is true", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("T ? [1,2,3]", ctx)).to.deep.equal([1,2,3]);
            expect(await evaluate("10 ? [1,2,3]", ctx)).to.deep.equal([1,2,3]);
        });
    
        it("should return null if `bool X` is false", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("F ? [1,2,3]", ctx)).to.be.null;
            expect(await evaluate("0 ? [1,2,3]", ctx)).to.be.null;
        });
    });    
    
    describe("X ; Y", () => {
    
        it("should return X if it is not `null`", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("[1,2,3] ; [3,4,5]", ctx)).to.deep.equal([1,2,3]);
        });
    
        it("should return Y if X is `null`", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("() ; [3,4,5]", ctx)).to.deep.equal([3,4,5]);
        });
    });    
    
    
    // ARITHMETIC OPERATORS
    
    describe("X + Y", () => {
    
        it("should return Y if X is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() + ()", ctx)).to.equal(null);
            expect(await evaluate("() + T", ctx)).to.equal(true);
            expect(await evaluate("() + F", ctx)).to.equal(false);
            expect(await evaluate("() + 10", ctx)).to.equal(10);
            expect(await evaluate("() + 'abc'", ctx)).to.equal("abc");
            expect(await evaluate("() + fn", ctx)).to.equal(ctx.fn);
            expect(await evaluate("() + ls", ctx)).to.deep.equal([1,2,3]);
            expect(await evaluate("() + ns", ctx)).to.deep.equal({a:1,b:2,c:3});
    
            var tuple = await evaluate("() + (1,2,3)", ctx);
            expect(isTuple(tuple)).to.be.true;
            expect(Array.from(tuple)).to.deep.equal([1,2,3]);
        });
    
        it("should return X if Y is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() + ()", ctx)).to.equal(null);
            expect(await evaluate("T + ()", ctx)).to.equal(true);
            expect(await evaluate("F + ()", ctx)).to.equal(false);
            expect(await evaluate("10 + ()", ctx)).to.equal(10);
            expect(await evaluate("'abc' + ()", ctx)).to.equal("abc");
            expect(await evaluate("fn + ()", ctx)).to.equal(ctx.fn);
            expect(await evaluate("ls + ()", ctx)).to.deep.equal([1,2,3]);
            expect(await evaluate("ns + ()", ctx)).to.deep.equal({a:1,b:2,c:3});
    
            var tuple = await evaluate("(1,2,3) + ()", ctx);
            expect(isTuple(tuple)).to.be.true;
            expect(Array.from(tuple)).to.deep.equal([1,2,3]);
        });
    
        it("should return `X||Y` if both X and Y are booleans", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("T + T", ctx)).to.be.true;
            expect(await evaluate("T + F", ctx)).to.be.true;
            expect(await evaluate("F + T", ctx)).to.be.true;
            expect(await evaluate("F + F", ctx)).to.be.false;
        });
    
        it("should return `X+Y` if both X and Y are numbers", async () => {
            var ctx = createContext();
            expect(await evaluate("10 + 1", ctx)).to.equal(11);
            expect(await evaluate("10 + 0", ctx)).to.equal(10);
            expect(await evaluate("10 + (-2)", ctx)).to.equal(8);
        });
    
        it("should concatenate X and Y if they are both strings", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("'abc' + 'def'", ctx)).to.equal("abcdef");
            expect(await evaluate("'abc' + ''", ctx)).to.equal("abc");
            expect(await evaluate("'' + 'def'", ctx)).to.equal("def");
        });
    
        it("should concatenate X and Y if they are both lists", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("[1,2,3] + [4,5,6]", ctx)).to.deep.equal([1,2,3,4,5,6]);
            expect(await evaluate("[1,2,3] + []", ctx)).to.deep.equal([1,2,3]);
            expect(await evaluate("[] + [4,5,6]", ctx)).to.deep.equal([4,5,6]);
        });
    
        it("should merge X and Y if they are both namespaces", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("{a=1,b=2} + {b=20,c=30}", ctx)).to.deep.equal({a:1,b:20,c:30});
            expect(await evaluate("{a=1,b=2} + {}", ctx)).to.deep.equal({a:1,b:2});
            expect(await evaluate("{} + {b=20,c=30}", ctx)).to.deep.equal({b:20,c:30});
        });
    
        it("should throw an error for all the other singleton types", async () => {
            var ctx = createContext({T:true, F:false});
            var expectSumError = (expression, XType, YType) => expectError(() => evaluate(expression,ctx), `Sum operation not defined between ${XType} and ${YType}`);
    
            var LTYPE = "Boolean"; ctx.L = true; 
            await expectSumError("L + 1"       , LTYPE, "Number");
            await expectSumError("L + 'abc'"   , LTYPE, "String");
            await expectSumError("L + [1,2,3]" , LTYPE, "List");
            await expectSumError("L + {a=1}"   , LTYPE, "Namespace");
            await expectSumError("L + (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Boolean"; ctx.L = false;
            await expectSumError("L + 1"       , LTYPE, "Number");
            await expectSumError("L + 'abc'"   , LTYPE, "String");
            await expectSumError("L + [1,2,3]" , LTYPE, "List");
            await expectSumError("L + {a=1}"   , LTYPE, "Namespace");
            await expectSumError("L + (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Number"; ctx.L = 10;
            await expectSumError("L + T"       , LTYPE, "Boolean");
            await expectSumError("L + F"       , LTYPE, "Boolean");
            await expectSumError("L + 'abc'"   , LTYPE, "String");
            await expectSumError("L + [1,2,3]" , LTYPE, "List");
            await expectSumError("L + {a=1}"   , LTYPE, "Namespace");
            await expectSumError("L + (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "String"; ctx.L = "abc";
            await expectSumError("L + T"       , LTYPE, "Boolean");
            await expectSumError("L + F"       , LTYPE, "Boolean");
            await expectSumError("L + 1"       , LTYPE, "Number");
            await expectSumError("L + [1,2,3]" , LTYPE, "List");
            await expectSumError("L + {a=1}"   , LTYPE, "Namespace");
            await expectSumError("L + (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "List"; ctx.L = [1,2,3];
            await expectSumError("L + T"       , LTYPE, "Boolean");
            await expectSumError("L + F"       , LTYPE, "Boolean");
            await expectSumError("L + 1"       , LTYPE, "Number");
            await expectSumError("L + 'abc'"   , LTYPE, "String");
            await expectSumError("L + {a=1}"   , LTYPE, "Namespace");
            await expectSumError("L + (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Namespace"; ctx.L = {a:1,b:2};
            await expectSumError("L + T"       , LTYPE, "Boolean");
            await expectSumError("L + F"       , LTYPE, "Boolean");
            await expectSumError("L + 1"       , LTYPE, "Number");
            await expectSumError("L + 'abc'"   , LTYPE, "String");
            await expectSumError("L + [1,2,3]" , LTYPE, "List");
            await expectSumError("L + (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Function"; ctx.L = x=>x;
            await expectSumError("L + T"       , LTYPE, "Boolean");
            await expectSumError("L + F"       , LTYPE, "Boolean");
            await expectSumError("L + 1"       , LTYPE, "Number");
            await expectSumError("L + 'abc'"   , LTYPE, "String");
            await expectSumError("L + [1,2,3]" , LTYPE, "List");
            await expectSumError("L + {a=1}"   , LTYPE, "Namespace");
            await expectSumError("L + (x->x)"  , LTYPE, "Function");
        });
    
        it("should return (x1+y1, x2+y2, ...) if X and/or Y is a tuple", async () => {
            var ctx = createContext({T:true, F:false});
            expect(Array.from(await evaluate("(T, 1, 'a', [1], {a=1}) + (F, 2, 'b', [2], {b=2})", ctx))).to.deep.equal([true, 3, "ab", [1,2], {a:1,b:2}])
            expect(Array.from(await evaluate("(T, 1, 'a', [1], {a=1}) + (F, 2, 'b')", ctx))).to.deep.equal([true, 3, "ab", [1], {a:1}])
            expect(Array.from(await evaluate("(T, 1, 'a') + (F, 2, 'b', [2], {b=2})", ctx))).to.deep.equal([true, 3, "ab", [2], {b:2}])
            expect(Array.from(await evaluate("10 + (1, 2, 3)", ctx))).to.deep.equal([11, 2, 3])
            expect(Array.from(await evaluate("(1, 2, 3) + 10", ctx))).to.deep.equal([11, 2, 3])
        });
    });  
    
    describe("X - Y", () => {
    
        it("should return Nothing if X is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() - ()", ctx)).to.equal(null);
            expect(await evaluate("() - T", ctx)).to.equal(null);
            expect(await evaluate("() - F", ctx)).to.equal(null);
            expect(await evaluate("() - 10", ctx)).to.equal(null);
            expect(await evaluate("() - 'abc'", ctx)).to.equal(null);
            expect(await evaluate("() - fn", ctx)).to.equal(null);
            expect(await evaluate("() - ls", ctx)).to.equal(null);
            expect(await evaluate("() - ns", ctx)).to.equal(null);
            expect(await evaluate("() - (1,2,3)", ctx)).to.equal(null);
        });
    
        it("should return Y if X is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() - ()", ctx)).to.equal(null);
            expect(await evaluate("T - ()", ctx)).to.equal(true);
            expect(await evaluate("F - ()", ctx)).to.equal(false);
            expect(await evaluate("10 - ()", ctx)).to.equal(10);
            expect(await evaluate("'abc' - ()", ctx)).to.equal("abc");
            expect(await evaluate("fn - ()", ctx)).to.equal(ctx.fn);
            expect(await evaluate("ls - ()", ctx)).to.deep.equal(ctx.ls);
            expect(await evaluate("ns - ()", ctx)).to.deep.equal(ctx.ns);
            expect(Array.from(await evaluate("(1,2,3) - ()", ctx))).to.deep.equal([1,2,3]);
        });
    
        it("should return `X-Y` if both X and Y are numbers", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("10 - 1", ctx)).to.equal(9);
            expect(await evaluate("20 - 0", ctx)).to.equal(20);
            expect(await evaluate("10 - (-7)", ctx)).to.equal(17);
        });
    
        it("should throw a runtime error for all the other singleton types", async () => {
            var ctx = createContext({T:true, F:false});
            var expectSubError = (expression, XType, YType) => expectError(() => evaluate(expression,ctx), `Subtraction operation not defined between ${XType} and ${YType}`);
    
            var LTYPE = "Boolean"; ctx.L = true;
            await expectSubError("L - 10"      , LTYPE, "Number");
            await expectSubError("L - 'abc'"   , LTYPE, "String");
            await expectSubError("L - [1,2,3]" , LTYPE, "List");
            await expectSubError("L - {a=1}"   , LTYPE, "Namespace");
            await expectSubError("L - (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Boolean"; ctx.L = false;
            await expectSubError("L - 10"      , LTYPE, "Number");
            await expectSubError("L - 'abc'"   , LTYPE, "String");
            await expectSubError("L - [1,2,3]" , LTYPE, "List");
            await expectSubError("L - {a=1}"   , LTYPE, "Namespace");
            await expectSubError("L - (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Number"; ctx.L = 10;
            await expectSubError("L - T"       , LTYPE, "Boolean");
            await expectSubError("L - F"       , LTYPE, "Boolean");
            await expectSubError("L - 'abc'"   , LTYPE, "String");
            await expectSubError("L - [1,2,3]" , LTYPE, "List");
            await expectSubError("L - {a=1}"   , LTYPE, "Namespace");
            await expectSubError("L - (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "String"; ctx.L = "abc";
            await expectSubError("L - T"       , LTYPE, "Boolean");
            await expectSubError("L - F"       , LTYPE, "Boolean");
            await expectSubError("L - 1"       , LTYPE, "Number");
            await expectSubError("L - 'abc'"   , LTYPE, "String");
            await expectSubError("L - [1,2,3]" , LTYPE, "List");
            await expectSubError("L - {a=1}"   , LTYPE, "Namespace");
            await expectSubError("L - (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "List"; ctx.L = [1,2,3];
            await expectSubError("L - T"       , LTYPE, "Boolean");
            await expectSubError("L - F"       , LTYPE, "Boolean");
            await expectSubError("L - 1"       , LTYPE, "Number");
            await expectSubError("L - 'abc'"   , LTYPE, "String");
            await expectSubError("L - [1,2,3]" , LTYPE, "List");
            await expectSubError("L - {a=1}"   , LTYPE, "Namespace");
            await expectSubError("L - (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Namespace"; ctx.L = {a:1,b:2};
            await expectSubError("L - T"       , LTYPE, "Boolean");
            await expectSubError("L - F"       , LTYPE, "Boolean");
            await expectSubError("L - 1"       , LTYPE, "Number");
            await expectSubError("L - 'abc'"   , LTYPE, "String");
            await expectSubError("L - [1,2,3]" , LTYPE, "List");
            await expectSubError("L - {a=1}"   , LTYPE, "Namespace");
            await expectSubError("L - (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Function"; ctx.L = x=>x;
            await expectSubError("L - T"       , LTYPE, "Boolean");
            await expectSubError("L - F"       , LTYPE, "Boolean");
            await expectSubError("L - 1"       , LTYPE, "Number");
            await expectSubError("L - 'abc'"   , LTYPE, "String");
            await expectSubError("L - [1,2,3]" , LTYPE, "List");
            await expectSubError("L - {a=1}"   , LTYPE, "Namespace");
            await expectSubError("L - (x->x)"  , LTYPE, "Function");
        });
    
        it("should return (x1-y1, x2-y2, ...) if X and/or Y is a tuple", async () => {
            var ctx = createContext({T:true, F:false});
            expect(Array.from(await evaluate("(10,20,30) - (1,2,3)", ctx))).to.deep.equal([9,18,27]);
            expect(Array.from(await evaluate("(10,20,30) - (1,2)", ctx))).to.deep.equal([9,18,30]);
            expect(Array.from(await evaluate("(10,20) - (1,2,3)", ctx))).to.deep.equal([9,18]);
            expect(Array.from(await evaluate("(10,20,30) - 1", ctx))).to.deep.equal([9,20,30]);
            expect(await evaluate("10 - (1,2,3)", ctx)).to.equal(9);
        });
    });      
    
    describe("X * Y", () => {
    
        it("should return () if either X or Y is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
    
            expect(await evaluate("() * ()", ctx)).to.equal(null);
            expect(await evaluate("() * T", ctx)).to.equal(null);
            expect(await evaluate("() * F", ctx)).to.equal(null);
            expect(await evaluate("() * 10", ctx)).to.equal(null);
            expect(await evaluate("() * 'abc'", ctx)).to.equal(null);
            expect(await evaluate("() * fn", ctx)).to.equal(null);
            expect(await evaluate("() * ls", ctx)).to.equal(null);
            expect(await evaluate("() * ns", ctx)).to.equal(null);
            expect(await evaluate("() * (1,2,3)", ctx)).to.equal(null);
    
            expect(await evaluate("() * ()", ctx)).to.equal(null);
            expect(await evaluate("T * ()", ctx)).to.equal(null);
            expect(await evaluate("F * ()", ctx)).to.equal(null);
            expect(await evaluate("10 * ()", ctx)).to.equal(null);
            expect(await evaluate("'abc' * ()", ctx)).to.equal(null);
            expect(await evaluate("fn * ()", ctx)).to.equal(null);
            expect(await evaluate("ls * ()", ctx)).to.equal(null);
            expect(await evaluate("ns * ()", ctx)).to.equal(null);
            expect(await evaluate("(1,2,3) * ()", ctx)).to.equal(null);
        });
    
        it("should return `X&&Y` if both X and Y are booleans", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("T * T", ctx)).to.equal(true);
            expect(await evaluate("T * F", ctx)).to.equal(false);
            expect(await evaluate("F * T", ctx)).to.equal(false);
            expect(await evaluate("F * F", ctx)).to.equal(false);
        });
    
        it("should return `X*Y` if both X and Y are numbers", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("10 * 2", ctx)).to.equal(20);
            expect(await evaluate("10 * 0", ctx)).to.equal(0);
            expect(await evaluate("10 * (-2)", ctx)).to.equal(-20);
        });
    
        it("should concatenate X times Y if X is a number and Y is a string", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("3 * 'Abc'", ctx)).to.equal("AbcAbcAbc");
            expect(await evaluate("3.1 * 'Abc'", ctx)).to.equal("AbcAbcAbc");
            expect(await evaluate("3.9 * 'Abc'", ctx)).to.equal("AbcAbcAbc");
            expect(await evaluate("0 * 'Abc'", ctx)).to.equal("");
            expect(await evaluate("-2 * 'Abc'", ctx)).to.equal("");
        });
    
        it("should concatenate Y times X if Y is a number and X is a string", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("'Abc' * 3", ctx)).to.equal("AbcAbcAbc");
            expect(await evaluate("'Abc' * 3.1", ctx)).to.equal("AbcAbcAbc");
            expect(await evaluate("'Abc' * 3.9", ctx)).to.equal("AbcAbcAbc");
            expect(await evaluate("'Abc' * 0", ctx)).to.equal("");
            expect(await evaluate("'Abc' * (-2)", ctx)).to.equal("");
        });
    
        it("should concatenate X times Y if X is a number and Y is a list", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("3 * [1,2,3]", ctx)).to.deep.equal([1,2,3,1,2,3,1,2,3]);
            expect(await evaluate("3.1 * [1,2,3]", ctx)).to.deep.equal([1,2,3,1,2,3,1,2,3]);
            expect(await evaluate("3.9 * [1,2,3]", ctx)).to.deep.equal([1,2,3,1,2,3,1,2,3]);
            expect(await evaluate("0 * [1,2,3]", ctx)).to.deep.equal([]);
            expect(await evaluate("-2 * [1,2,3]", ctx)).to.deep.equal([]);
        });
    
        it("should concatenate Y times X if Y is a number and X is a list", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("[1,2,3] * 3", ctx)).to.deep.equal([1,2,3,1,2,3,1,2,3]);
            expect(await evaluate("[1,2,3] * 3.1", ctx)).to.deep.equal([1,2,3,1,2,3,1,2,3]);
            expect(await evaluate("[1,2,3] * 3.9", ctx)).to.deep.equal([1,2,3,1,2,3,1,2,3]);
            expect(await evaluate("[1,2,3] * 0", ctx)).to.deep.equal([]);
            expect(await evaluate("[1,2,3] * (-2)", ctx)).to.deep.equal([]);
        });
    
        it("should throw error for all the other singleton types", async () => {
            var ctx = createContext({T:true, F:false});
            var expectMulError = (expression, XType, YType) => expectError(() => evaluate(expression,ctx), `Product operation not defined between ${XType} and ${YType}`);
    
            var LTYPE = "Boolean"; ctx.L = true; 
            await expectMulError("L * 10"      , LTYPE, "Number");
            await expectMulError("L * {a=1}"   , LTYPE, "Namespace");
            await expectMulError("L * (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Boolean"; ctx.L = false; 
            await expectMulError("L * 10"      , LTYPE, "Number");
            await expectMulError("L * {a=1}"   , LTYPE, "Namespace");
            await expectMulError("L * (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Number"; ctx.L = 10;
            await expectMulError("L * T"       , LTYPE, "Boolean");
            await expectMulError("L * F"       , LTYPE, "Boolean");
            await expectMulError("L * {a=1}"   , LTYPE, "Namespace");
            await expectMulError("L * (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "String"; ctx.L = "abc";
            await expectMulError("L * T"       , LTYPE, "Boolean");
            await expectMulError("L * F"       , LTYPE, "Boolean");
            await expectMulError("L * 'def'"   , LTYPE, "String");
            await expectMulError("L * [1,2,3]" , LTYPE, "List");
            await expectMulError("L * {a=1}"   , LTYPE, "Namespace");
            await expectMulError("L * (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "List"; ctx.L = [1,2,3];
            await expectMulError("L * T"       , LTYPE, "Boolean");
            await expectMulError("L * F"       , LTYPE, "Boolean");
            await expectMulError("L * 'abc'"   , LTYPE, "String");
            await expectMulError("L * [4,5]"   , LTYPE, "List");
            await expectMulError("L * {a=1}"   , LTYPE, "Namespace");
            await expectMulError("L * (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Namespace"; ctx.L = {a:1,b:2};
            await expectMulError("L * T"       , LTYPE, "Boolean");
            await expectMulError("L * F"       , LTYPE, "Boolean");
            await expectMulError("L * 1"       , LTYPE, "Number");
            await expectMulError("L * 'abc'"   , LTYPE, "String");
            await expectMulError("L * [1,2,3]" , LTYPE, "List");
            await expectMulError("L * {a=1}"   , LTYPE, "Namespace");
            await expectMulError("L * (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Function"; ctx.L = x=>x;
            await expectMulError("L * T"       , LTYPE, "Boolean");
            await expectMulError("L * F"       , LTYPE, "Boolean");
            await expectMulError("L * 1"       , LTYPE, "Number");
            await expectMulError("L * 'abc'"   , LTYPE, "String");
            await expectMulError("L * [1,2,3]" , LTYPE, "List");
            await expectMulError("L * {a=1}"   , LTYPE, "Namespace");
            await expectMulError("L * (x->x)"  , LTYPE, "Function");
        });
    
        it("should return (x1*y1, x2*y2, ...) if X and/or Y is a tuple", async () => {
            var ctx = createContext({T:true, F:false});
            expect(Array.from(await evaluate("(T, 3, 'a', [1]) * (F, 2, 2, 2)",ctx))).to.deep.equal([false, 6, "aa", [1,1]]);
            expect(Array.from(await evaluate("(10,20,30) * (2,3,4)",ctx))).to.deep.equal([20,60,120]);
            expect(Array.from(await evaluate("(10,20,30) * (2,3)",ctx))).to.deep.equal([20,60]);
            expect(Array.from(await evaluate("(10,20) * (2,3,4)",ctx))).to.deep.equal([20,60]);
            expect(await evaluate("10 * (2,3,4)",ctx)).to.equal(20);
            expect(await evaluate("(10,20,30) * 2",ctx)).to.equal(20);
        });
    });
    
    describe("X / Y", () => {
    
        it("should return nothing if X is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() / ()", ctx)).to.equal(null);
            expect(await evaluate("() / T", ctx)).to.equal(null);
            expect(await evaluate("() / F", ctx)).to.equal(null);
            expect(await evaluate("() / 10", ctx)).to.equal(null);
            expect(await evaluate("() / 'abc'", ctx)).to.equal(null);
            expect(await evaluate("() / fn", ctx)).to.equal(null);
            expect(await evaluate("() / ls", ctx)).to.equal(null);
            expect(await evaluate("() / ns", ctx)).to.equal(null);
        });
    
        it("should return `X/Y` if both X and Y are numbers", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("10 / 2", ctx)).to.equal(5);
            expect(await evaluate("20 / 0", ctx)).to.equal(Infinity);
            expect(await evaluate("10 / (-2)", ctx)).to.equal(-5);
        });
    
        it("should throw an error for all the other singleton types", async () => {
            var ctx = createContext({T:true, F:false});
            var expectDivError = (expression, XType, YType) => expectError(() => evaluate(expression,ctx), `Division operation not defined between ${XType} and ${YType}`);
    
            var LTYPE = "Boolean"; ctx.L = true;
            await expectDivError("L / ()"      , LTYPE, "Nothing");
            await expectDivError("L / 10"      , LTYPE, "Number");
            await expectDivError("L / 'abc'"   , LTYPE, "String");
            await expectDivError("L / [1,2,3]" , LTYPE, "List");
            await expectDivError("L / {a=1}"   , LTYPE, "Namespace");
            await expectDivError("L / (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Boolean"; ctx.L = false;
            await expectDivError("L / ()"      , LTYPE, "Nothing");
            await expectDivError("L / 10"      , LTYPE, "Number");
            await expectDivError("L / 'abc'"   , LTYPE, "String");
            await expectDivError("L / [1,2,3]" , LTYPE, "List");
            await expectDivError("L / {a=1}"   , LTYPE, "Namespace");
            await expectDivError("L / (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Number"; ctx.L = 10;
            await expectDivError("L / ()"      , LTYPE, "Nothing");
            await expectDivError("L / T"       , LTYPE, "Boolean");
            await expectDivError("L / F"       , LTYPE, "Boolean");
            await expectDivError("L / 'abc'"   , LTYPE, "String");
            await expectDivError("L / [1,2,3]" , LTYPE, "List");
            await expectDivError("L / {a=1}"   , LTYPE, "Namespace");
            await expectDivError("L / (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "String"; ctx.L = "abc";
            await expectDivError("L / ()"      , LTYPE, "Nothing");
            await expectDivError("L / T"       , LTYPE, "Boolean");
            await expectDivError("L / F"       , LTYPE, "Boolean");
            await expectDivError("L / 1"       , LTYPE, "Number");
            await expectDivError("L / 'abc'"   , LTYPE, "String");
            await expectDivError("L / [1,2,3]" , LTYPE, "List");
            await expectDivError("L / {a=1}"   , LTYPE, "Namespace");
            await expectDivError("L / (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "List"; ctx.L = [1,2,3];
            await expectDivError("L / ()"      , LTYPE, "Nothing");
            await expectDivError("L / T"       , LTYPE, "Boolean");
            await expectDivError("L / F"       , LTYPE, "Boolean");
            await expectDivError("L / 1"       , LTYPE, "Number");
            await expectDivError("L / 'abc'"   , LTYPE, "String");
            await expectDivError("L / [1,2,3]" , LTYPE, "List");
            await expectDivError("L / {a=1}"   , LTYPE, "Namespace");
            await expectDivError("L / (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Namespace"; ctx.L = {a:1,b:2};
            await expectDivError("L / ()"      , LTYPE, "Nothing");
            await expectDivError("L / T"       , LTYPE, "Boolean");
            await expectDivError("L / F"       , LTYPE, "Boolean");
            await expectDivError("L / 1"       , LTYPE, "Number");
            await expectDivError("L / 'abc'"   , LTYPE, "String");
            await expectDivError("L / [1,2,3]" , LTYPE, "List");
            await expectDivError("L / {a=1}"   , LTYPE, "Namespace");
            await expectDivError("L / (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Function"; ctx.L = x=>x;
            await expectDivError("L / ()"      , LTYPE, "Nothing");
            await expectDivError("L / T"       , LTYPE, "Boolean");
            await expectDivError("L / F"       , LTYPE, "Boolean");
            await expectDivError("L / 1"       , LTYPE, "Number");
            await expectDivError("L / 'abc'"   , LTYPE, "String");
            await expectDivError("L / [1,2,3]" , LTYPE, "List");
            await expectDivError("L / {a=1}"   , LTYPE, "Namespace");
            await expectDivError("L / (x->x)"  , LTYPE, "Function");
        });
    
        it("should return (x1/y1, x2/y2, ...) if X and/or Y is a tuple", async () => {
            var ctx = createContext({T:true, F:false});
            var expectDivError = (expression, XType, YType) => expectError(() => evaluate(expression,ctx), `Division operation not defined between ${XType} and ${YType}`);

            expect(Array.from(await evaluate("(10,20,30) / (2,5,3)",ctx))).to.deep.equal([5,4,10]);
            expect(Array.from(await evaluate("(10,20) / (2,5,3)",ctx))).to.deep.equal([5,4]);
            expect(await evaluate("10 / (2,5,3)",ctx)).to.equal(5);
            expect(await evaluate("() / (2,4,3)",ctx)).to.equal(null);
            
            expectDivError("(10,20,30) / (2,4)", "Number", "Nothing");
            expectDivError("(10,20,30) / 2", "Number", "Nothing");
        });
    });
    
    describe("X % Y", () => {
    
        it("should return Y if X is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() % ()", ctx)).to.equal(null);
            expect(await evaluate("() % T", ctx)).to.equal(true);
            expect(await evaluate("() % F", ctx)).to.equal(false);
            expect(await evaluate("() % 10", ctx)).to.equal(10);
            expect(await evaluate("() % 'abc'", ctx)).to.equal('abc');
            expect(await evaluate("() % fn", ctx)).to.equal(ctx.fn);
            expect(await evaluate("() % ls", ctx)).to.equal(ctx.ls);
            expect(await evaluate("() % ns", ctx)).to.equal(ctx.ns);
        });
    
        it("should return `X/Y` if both X and Y are numbers", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("10 % 4", ctx)).to.equal(2);
            expect(await evaluate("10 % (-4)", ctx)).to.equal(2);
        });
    
        it("should return an error for all the other singleton types", async () => {
            var ctx = createContext({T:true, F:false});
            var expectModError = (expression, XType, YType) => expectError(() => evaluate(expression,ctx), `Modulo operation not defined between ${XType} and ${YType}`);
    
            var LTYPE = "Boolean"; ctx.L = true;
            await expectModError("L % ()"      , LTYPE, "Nothing");
            await expectModError("L % 10"      , LTYPE, "Number");
            await expectModError("L % 'abc'"   , LTYPE, "String");
            await expectModError("L % [1,2,3]" , LTYPE, "List");
            await expectModError("L % {a=1}"   , LTYPE, "Namespace");
            await expectModError("L % (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Boolean"; ctx.L = false;
            await expectModError("L % ()"      , LTYPE, "Nothing");
            await expectModError("L % 10"      , LTYPE, "Number");
            await expectModError("L % 'abc'"   , LTYPE, "String");
            await expectModError("L % [1,2,3]" , LTYPE, "List");
            await expectModError("L % {a=1}"   , LTYPE, "Namespace");
            await expectModError("L % (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Number"; ctx.L = 10;
            await expectModError("L % ()"      , LTYPE, "Nothing");
            await expectModError("L % T"       , LTYPE, "Boolean");
            await expectModError("L % F"       , LTYPE, "Boolean");
            await expectModError("L % 'abc'"   , LTYPE, "String");
            await expectModError("L % [1,2,3]" , LTYPE, "List");
            await expectModError("L % {a=1}"   , LTYPE, "Namespace");
            await expectModError("L % (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "String"; ctx.L = "abc";
            await expectModError("L % ()"      , LTYPE, "Nothing");
            await expectModError("L % T"       , LTYPE, "Boolean");
            await expectModError("L % F"       , LTYPE, "Boolean");
            await expectModError("L % 1"       , LTYPE, "Number");
            await expectModError("L % 'abc'"   , LTYPE, "String");
            await expectModError("L % [1,2,3]" , LTYPE, "List");
            await expectModError("L % {a=1}"   , LTYPE, "Namespace");
            await expectModError("L % (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "List"; ctx.L = [1,2,3];
            await expectModError("L % ()"      , LTYPE, "Nothing");
            await expectModError("L % T"       , LTYPE, "Boolean");
            await expectModError("L % F"       , LTYPE, "Boolean");
            await expectModError("L % 1"       , LTYPE, "Number");
            await expectModError("L % 'abc'"   , LTYPE, "String");
            await expectModError("L % [1,2,3]" , LTYPE, "List");
            await expectModError("L % {a=1}"   , LTYPE, "Namespace");
            await expectModError("L % (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Namespace"; ctx.L = {a:1,b:2};
            await expectModError("L % ()"      , LTYPE, "Nothing");
            await expectModError("L % T"       , LTYPE, "Boolean");
            await expectModError("L % F"       , LTYPE, "Boolean");
            await expectModError("L % 1"       , LTYPE, "Number");
            await expectModError("L % 'abc'"   , LTYPE, "String");
            await expectModError("L % [1,2,3]" , LTYPE, "List");
            await expectModError("L % {a=1}"   , LTYPE, "Namespace");
            await expectModError("L % (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Function"; ctx.L = x=>x;
            await expectModError("L % ()"      , LTYPE, "Nothing");
            await expectModError("L % T"       , LTYPE, "Boolean");
            await expectModError("L % F"       , LTYPE, "Boolean");
            await expectModError("L % 1"       , LTYPE, "Number");
            await expectModError("L % 'abc'"   , LTYPE, "String");
            await expectModError("L % [1,2,3]" , LTYPE, "List");
            await expectModError("L % {a=1}"   , LTYPE, "Namespace");
            await expectModError("L % (x->x)"  , LTYPE, "Function");
        });
    
        it("should return (x1/y1, x2/y2, ...) if X and/or Y is a tuple", async () => {
            var ctx = createContext({T:true, F:false});
            var expectModError = (expression, XType, YType) => expectError(() => evaluate(expression,ctx), `Modulo operation not defined between ${XType} and ${YType}`);
            expect(Array.from(await evaluate("(10,20,30) % (4,7,8)",ctx))).to.deep.equal([2,6,6]);
            expect(Array.from(await evaluate("(10,20) % (4,7,8)",ctx))).to.deep.equal([2,6,8]);
            expect(Array.from(await evaluate("10 % (4,7,8)",ctx))).to.deep.equal([2,7,8]);
            expect(Array.from(await evaluate("() % (4,7,8)",ctx))).to.deep.equal([4,7,8]);
            
            expectModError("(10,20,30) % (2,4)", "Number", "Nothing");
            expectModError("(10,20,30) % 2", "Number", "Nothing");
        });
    });
    
    describe("X ^ Y", () => {
    
        it("should return nothing if X is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() ^ ()", ctx)).to.equal(null);
            expect(await evaluate("() ^ T", ctx)).to.equal(null);
            expect(await evaluate("() ^ F", ctx)).to.equal(null);
            expect(await evaluate("() ^ 10", ctx)).to.equal(null);
            expect(await evaluate("() ^ 'abc'", ctx)).to.equal(null);
            expect(await evaluate("() ^ fn", ctx)).to.equal(null);
            expect(await evaluate("() ^ ls", ctx)).to.equal(null);
            expect(await evaluate("() ^ ns", ctx)).to.equal(null);
        });
    
        it("should return `X**Y` if both X and Y are numbers", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("10 ^ 2", ctx)).to.equal(100);
            expect(await evaluate("20 ^ 0", ctx)).to.equal(1);
            expect(await evaluate("10 ^ (-2)", ctx)).to.equal(0.01);
        });
    
        it("should throw an error for all the other singleton types", async () => {
            var ctx = createContext({T:true, F:false});
            var expectPowError = (expression, XType, YType) => expectError(() => evaluate(expression,ctx), `Exponentiation operation not defined between ${XType} and ${YType}`);
    
            var LTYPE = "Boolean"; ctx.L = true;
            await expectPowError("L ^ ()"      , LTYPE, "Nothing");
            await expectPowError("L ^ 10"      , LTYPE, "Number");
            await expectPowError("L ^ 'abc'"   , LTYPE, "String");
            await expectPowError("L ^ [1,2,3]" , LTYPE, "List");
            await expectPowError("L ^ {a=1}"   , LTYPE, "Namespace");
            await expectPowError("L ^ (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Boolean"; ctx.L = false;
            await expectPowError("L ^ ()"      , LTYPE, "Nothing");
            await expectPowError("L ^ 10"      , LTYPE, "Number");
            await expectPowError("L ^ 'abc'"   , LTYPE, "String");
            await expectPowError("L ^ [1,2,3]" , LTYPE, "List");
            await expectPowError("L ^ {a=1}"   , LTYPE, "Namespace");
            await expectPowError("L ^ (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Number"; ctx.L = 10;
            await expectPowError("L ^ ()"      , LTYPE, "Nothing");
            await expectPowError("L ^ T"       , LTYPE, "Boolean");
            await expectPowError("L ^ F"       , LTYPE, "Boolean");
            await expectPowError("L ^ 'abc'"   , LTYPE, "String");
            await expectPowError("L ^ [1,2,3]" , LTYPE, "List");
            await expectPowError("L ^ {a=1}"   , LTYPE, "Namespace");
            await expectPowError("L ^ (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "String"; ctx.L = "abc";
            await expectPowError("L ^ ()"      , LTYPE, "Nothing");
            await expectPowError("L ^ T"       , LTYPE, "Boolean");
            await expectPowError("L ^ F"       , LTYPE, "Boolean");
            await expectPowError("L ^ 1"       , LTYPE, "Number");
            await expectPowError("L ^ 'abc'"   , LTYPE, "String");
            await expectPowError("L ^ [1,2,3]" , LTYPE, "List");
            await expectPowError("L ^ {a=1}"   , LTYPE, "Namespace");
            await expectPowError("L ^ (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "List"; ctx.L = [1,2,3];
            await expectPowError("L ^ ()"      , LTYPE, "Nothing");
            await expectPowError("L ^ T"       , LTYPE, "Boolean");
            await expectPowError("L ^ F"       , LTYPE, "Boolean");
            await expectPowError("L ^ 1"       , LTYPE, "Number");
            await expectPowError("L ^ 'abc'"   , LTYPE, "String");
            await expectPowError("L ^ [1,2,3]" , LTYPE, "List");
            await expectPowError("L ^ {a=1}"   , LTYPE, "Namespace");
            await expectPowError("L ^ (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Namespace"; ctx.L = {a:1,b:2};
            await expectPowError("L ^ ()"      , LTYPE, "Nothing");
            await expectPowError("L ^ T"       , LTYPE, "Boolean");
            await expectPowError("L ^ F"       , LTYPE, "Boolean");
            await expectPowError("L ^ 1"       , LTYPE, "Number");
            await expectPowError("L ^ 'abc'"   , LTYPE, "String");
            await expectPowError("L ^ [1,2,3]" , LTYPE, "List");
            await expectPowError("L ^ {a=1}"   , LTYPE, "Namespace");
            await expectPowError("L ^ (x->x)"  , LTYPE, "Function");
    
            var LTYPE = "Function"; ctx.L = x=>x;
            await expectPowError("L ^ ()"      , LTYPE, "Nothing");
            await expectPowError("L ^ T"       , LTYPE, "Boolean");
            await expectPowError("L ^ F"       , LTYPE, "Boolean");
            await expectPowError("L ^ 1"       , LTYPE, "Number");
            await expectPowError("L ^ 'abc'"   , LTYPE, "String");
            await expectPowError("L ^ [1,2,3]" , LTYPE, "List");
            await expectPowError("L ^ {a=1}"   , LTYPE, "Namespace");
            await expectPowError("L ^ (x->x)"  , LTYPE, "Function");
        });
    
        it("should return (x1^y1, x2^y2, ...) if X and/or Y is a tuple", async () => {
            var ctx = createContext({T:true, F:false});
            var expectPowError = (expression, XType, YType) => expectError(() => evaluate(expression,ctx), `Exponentiation operation not defined between ${XType} and ${YType}`);

            expect(Array.from(await evaluate("(10,20,30) ^ (2,3,4)",ctx))).to.deep.equal([10**2,20**3,30**4]);
            expect(Array.from(await evaluate("(10,20) ^ (2,3,4)",ctx))).to.deep.equal([10**2,20**3]);
            expect(await evaluate("10 ^ (2,3,4)",ctx)).to.equal(10**2);
            expect(await evaluate("() ^ (2,3,4)",ctx)).to.equal(null);
            
            expectPowError("(10,20,30) ^ (2,4)", "Number", "Nothing");
            expectPowError("(10,20,30) ^ 2", "Number", "Nothing");
        });
    });      
    
    
    // COMPARISON OPERATORS
    
    describe("X == Y", () => {
    
        it("should return true if both X and Y are nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() == ()", ctx)).to.equal(true);            
        });
    
        it("should return true if X and Y are both true or both false", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("T == T", ctx)).to.equal(true);            
            expect(await evaluate("F == F", ctx)).to.equal(true);            
            expect(await evaluate("T == F", ctx)).to.equal(false);            
            expect(await evaluate("F == T", ctx)).to.equal(false);            
        });
    
        it("should return true if X and Y are the same number", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("3 == 3", ctx)).to.equal(true);            
            expect(await evaluate("0 == 0", ctx)).to.equal(true);            
            expect(await evaluate("-3 == -3", ctx)).to.equal(true);            
            expect(await evaluate("3 == 2", ctx)).to.equal(false);            
            expect(await evaluate("0 == -4", ctx)).to.equal(false);            
        });
    
        it("should return true if X and Y are the same string", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("'abc' == 'abc'", ctx)).to.equal(true);            
            expect(await evaluate("'' == ''", ctx)).to.equal(true);            
            expect(await evaluate("'abc' == 'def'", ctx)).to.equal(false);                        
            expect(await evaluate("'abc' == ''", ctx)).to.equal(false);                        
        });
    
        it("should return true if X and Y are both lists with equal items", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("[1,2,3] == [1,2,3]", ctx)).to.equal(true);                        
            expect(await evaluate("[] == []", ctx)).to.equal(true);            
            expect(await evaluate("[1,2,3] == [4,5,6]", ctx)).to.equal(false);                        
            expect(await evaluate("[1,2,3] == []", ctx)).to.equal(false);                        
        });
    
        it("should return true if X and Y are both namespace with sname name:value pairs", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("{a=1,b=2} == {a=1,b=2}", ctx)).to.equal(true);                        
            expect(await evaluate("{} == {}", ctx)).to.equal(true);            
            expect(await evaluate("{a=1,b=2} == {a=1,c=2}", ctx)).to.equal(false);                        
            expect(await evaluate("{a=1,b=2} == {a=1,b=3}", ctx)).to.equal(false);                        
            expect(await evaluate("{a=1,b=2} == {a=1}", ctx)).to.equal(false);                        
            expect(await evaluate("{a=1,b=2} == {}", ctx)).to.equal(false);                        
            expect(await evaluate("{a=1} == {a=1,b=2}", ctx)).to.equal(false);                        
            expect(await evaluate("{} == {a=1,b=2}", ctx)).to.equal(false);                        
        });
    
        it("should return true if X and Y are the same function", async () => {
            var ctx = createContext({fn1:x=>2*x, fn2:x=>2*x});
            expect(await evaluate("fn1 == fn1", ctx)).to.equal(true);                                    
            expect(await evaluate("fn1 == fn2", ctx)).to.equal(false);                                    
            expect(await evaluate("(x->2*x) == (x->2*x)", ctx)).to.equal(false);                                    
            expect(await evaluate("(x->2*x) == fn1", ctx)).to.equal(false);                                    
            expect(await evaluate("fn1 == (x->2*x)", ctx)).to.equal(false);                                    
        });
    
        it("should return false if X and Y are of different types", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
    
            expect(await evaluate("() == T", ctx)).to.equal(false);                                    
            expect(await evaluate("() == F", ctx)).to.equal(false);                                    
            expect(await evaluate("() == 1", ctx)).to.equal(false);                                    
            expect(await evaluate("() == 'abc'", ctx)).to.equal(false);                                    
            expect(await evaluate("() == ls", ctx)).to.equal(false);                                    
            expect(await evaluate("() == ns", ctx)).to.equal(false);                                    
            expect(await evaluate("() == fn", ctx)).to.equal(false);                                    
    
            expect(await evaluate("T == ()", ctx)).to.equal(false);                                    
            expect(await evaluate("T == 1", ctx)).to.equal(false);                                    
            expect(await evaluate("T == 'abc'", ctx)).to.equal(false);                                    
            expect(await evaluate("T == ls", ctx)).to.equal(false);                                    
            expect(await evaluate("T == ns", ctx)).to.equal(false);                                    
            expect(await evaluate("T == fn", ctx)).to.equal(false);                                    
    
            expect(await evaluate("F == ()", ctx)).to.equal(false);                                    
            expect(await evaluate("F == 1", ctx)).to.equal(false);                                    
            expect(await evaluate("F == 'abc'", ctx)).to.equal(false);                                    
            expect(await evaluate("F == ls", ctx)).to.equal(false);                                    
            expect(await evaluate("F == ns", ctx)).to.equal(false);                                    
            expect(await evaluate("F == fn", ctx)).to.equal(false);                                    
    
            expect(await evaluate("1 == ()", ctx)).to.equal(false);                                    
            expect(await evaluate("1 == T", ctx)).to.equal(false);                                    
            expect(await evaluate("1 == F", ctx)).to.equal(false);                                    
            expect(await evaluate("1 == 'abc'", ctx)).to.equal(false);                                    
            expect(await evaluate("1 == ls", ctx)).to.equal(false);                                    
            expect(await evaluate("1 == ns", ctx)).to.equal(false);                                    
            expect(await evaluate("1 == fn", ctx)).to.equal(false);                                    
    
            expect(await evaluate("'abc' == ()", ctx)).to.equal(false);                                    
            expect(await evaluate("'abc' == T", ctx)).to.equal(false);                                    
            expect(await evaluate("'abc' == F", ctx)).to.equal(false);                                    
            expect(await evaluate("'abc' == 1", ctx)).to.equal(false);                                    
            expect(await evaluate("'abc' == ls", ctx)).to.equal(false);                                    
            expect(await evaluate("'abc' == ns", ctx)).to.equal(false);                                    
            expect(await evaluate("'abc' == fn", ctx)).to.equal(false);                                    
    
            expect(await evaluate("ls == ()", ctx)).to.equal(false);                                    
            expect(await evaluate("ls == T", ctx)).to.equal(false);                                    
            expect(await evaluate("ls == F", ctx)).to.equal(false);                                    
            expect(await evaluate("ls == 1", ctx)).to.equal(false);                                    
            expect(await evaluate("ls == 'abc'", ctx)).to.equal(false);                                    
            expect(await evaluate("ls == ns", ctx)).to.equal(false);                                    
            expect(await evaluate("ls == fn", ctx)).to.equal(false);                                    
    
            expect(await evaluate("ns == ()", ctx)).to.equal(false);                                    
            expect(await evaluate("ns == T", ctx)).to.equal(false);                                    
            expect(await evaluate("ns == F", ctx)).to.equal(false);                                    
            expect(await evaluate("ns == 1", ctx)).to.equal(false);                                    
            expect(await evaluate("ns == 'abc'", ctx)).to.equal(false);                                    
            expect(await evaluate("ns == ls", ctx)).to.equal(false);                                    
            expect(await evaluate("ns == fn", ctx)).to.equal(false);                                    
    
            expect(await evaluate("fn == ()", ctx)).to.equal(false);                                    
            expect(await evaluate("fn == T", ctx)).to.equal(false);                                    
            expect(await evaluate("fn == F", ctx)).to.equal(false);                                    
            expect(await evaluate("fn == 1", ctx)).to.equal(false);                                    
            expect(await evaluate("fn == 'abc'", ctx)).to.equal(false);                                    
            expect(await evaluate("fn == ls", ctx)).to.equal(false);                                    
            expect(await evaluate("fn == ns", ctx)).to.equal(false);                                    
        });
    
        it("should compare tuples with lexicographical criteria", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("(1,2,3) == (1,2,3)", ctx)).to.equal(true);
            expect(await evaluate("(1,2,3) == (1,2)", ctx)).to.equal(false);                        
            expect(await evaluate("(1,2) == (1,2,3)", ctx)).to.equal(false);                                    
            expect(await evaluate("1 == (1,2,3)", ctx)).to.equal(false);                                    
            expect(await evaluate("(1,2,3) == 1", ctx)).to.equal(false);                                    
        });
    });
    
    describe("X != Y", () => {
    
        it("should return false if both X and Y are nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() != ()", ctx)).to.equal(false);            
        });
    
        it("should return false if X and Y are both false or both true", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("T != T", ctx)).to.equal(false);            
            expect(await evaluate("F != F", ctx)).to.equal(false);            
            expect(await evaluate("T != F", ctx)).to.equal(true);            
            expect(await evaluate("F != T", ctx)).to.equal(true);            
        });
    
        it("should return false if X and Y are the same number", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("3 != 3", ctx)).to.equal(false);            
            expect(await evaluate("0 != 0", ctx)).to.equal(false);            
            expect(await evaluate("-3 != -3", ctx)).to.equal(false);            
            expect(await evaluate("3 != 2", ctx)).to.equal(true);            
            expect(await evaluate("0 != -4", ctx)).to.equal(true);            
        });
    
        it("should return false if X and Y are the same string", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("'abc' != 'abc'", ctx)).to.equal(false);            
            expect(await evaluate("'' != ''", ctx)).to.equal(false);            
            expect(await evaluate("'abc' != 'def'", ctx)).to.equal(true);                        
            expect(await evaluate("'abc' != ''", ctx)).to.equal(true);                        
        });
    
        it("should return false if X and Y are both lists with equal items", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("[1,2,3] != [1,2,3]", ctx)).to.equal(false);                        
            expect(await evaluate("[] != []", ctx)).to.equal(false);            
            expect(await evaluate("[1,2,3] != [4,5,6]", ctx)).to.equal(true);                        
            expect(await evaluate("[1,2,3] != []", ctx)).to.equal(true);                        
        });
    
        it("should return false if X and Y are both namespace with sname name:value pairs", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("{a=1,b=2} != {a=1,b=2}", ctx)).to.equal(false);                        
            expect(await evaluate("{} != {}", ctx)).to.equal(false);            
            expect(await evaluate("{a=1,b=2} != {a=1,c=2}", ctx)).to.equal(true);                        
            expect(await evaluate("{a=1,b=2} != {a=1,b=3}", ctx)).to.equal(true);                        
            expect(await evaluate("{a=1,b=2} != {a=1}", ctx)).to.equal(true);                        
            expect(await evaluate("{a=1,b=2} != {}", ctx)).to.equal(true);                        
            expect(await evaluate("{a=1} != {a=1,b=2}", ctx)).to.equal(true);                        
            expect(await evaluate("{} != {a=1,b=2}", ctx)).to.equal(true);                        
        });
    
        it("should return false if X and Y are the same function", async () => {
            var ctx = createContext({fn1:x=>2*x, fn2:x=>2*x});
            expect(await evaluate("fn1 != fn1", ctx)).to.equal(false);                                    
            expect(await evaluate("fn1 != fn2", ctx)).to.equal(true);                                    
            expect(await evaluate("(x->2*x) != (x->2*x)", ctx)).to.equal(true);                                    
            expect(await evaluate("(x->2*x) != fn1", ctx)).to.equal(true);                                    
            expect(await evaluate("fn1 != (x->2*x)", ctx)).to.equal(true);                                    
        });
    
        it("should return true if X and Y are of different types", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
    
            expect(await evaluate("() != T", ctx)).to.equal(true);                                    
            expect(await evaluate("() != F", ctx)).to.equal(true);                                    
            expect(await evaluate("() != 1", ctx)).to.equal(true);                                    
            expect(await evaluate("() != 'abc'", ctx)).to.equal(true);                                    
            expect(await evaluate("() != ls", ctx)).to.equal(true);                                    
            expect(await evaluate("() != ns", ctx)).to.equal(true);                                    
            expect(await evaluate("() != fn", ctx)).to.equal(true);                                    
    
            expect(await evaluate("T != ()", ctx)).to.equal(true);                                    
            expect(await evaluate("T != 1", ctx)).to.equal(true);                                    
            expect(await evaluate("T != 'abc'", ctx)).to.equal(true);                                    
            expect(await evaluate("T != ls", ctx)).to.equal(true);                                    
            expect(await evaluate("T != ns", ctx)).to.equal(true);                                    
            expect(await evaluate("T != fn", ctx)).to.equal(true);                                    
    
            expect(await evaluate("F != ()", ctx)).to.equal(true);                                    
            expect(await evaluate("F != 1", ctx)).to.equal(true);                                    
            expect(await evaluate("F != 'abc'", ctx)).to.equal(true);                                    
            expect(await evaluate("F != ls", ctx)).to.equal(true);                                    
            expect(await evaluate("F != ns", ctx)).to.equal(true);                                    
            expect(await evaluate("F != fn", ctx)).to.equal(true);                                    
    
            expect(await evaluate("1 != ()", ctx)).to.equal(true);                                    
            expect(await evaluate("1 != T", ctx)).to.equal(true);                                    
            expect(await evaluate("1 != F", ctx)).to.equal(true);                                    
            expect(await evaluate("1 != 'abc'", ctx)).to.equal(true);                                    
            expect(await evaluate("1 != ls", ctx)).to.equal(true);                                    
            expect(await evaluate("1 != ns", ctx)).to.equal(true);                                    
            expect(await evaluate("1 != fn", ctx)).to.equal(true);                                    
    
            expect(await evaluate("'abc' != ()", ctx)).to.equal(true);                                    
            expect(await evaluate("'abc' != T", ctx)).to.equal(true);                                    
            expect(await evaluate("'abc' != F", ctx)).to.equal(true);                                    
            expect(await evaluate("'abc' != 1", ctx)).to.equal(true);                                    
            expect(await evaluate("'abc' != ls", ctx)).to.equal(true);                                    
            expect(await evaluate("'abc' != ns", ctx)).to.equal(true);                                    
            expect(await evaluate("'abc' != fn", ctx)).to.equal(true);                                    
    
            expect(await evaluate("ls != ()", ctx)).to.equal(true);                                    
            expect(await evaluate("ls != T", ctx)).to.equal(true);                                    
            expect(await evaluate("ls != F", ctx)).to.equal(true);                                    
            expect(await evaluate("ls != 1", ctx)).to.equal(true);                                    
            expect(await evaluate("ls != 'abc'", ctx)).to.equal(true);                                    
            expect(await evaluate("ls != ns", ctx)).to.equal(true);                                    
            expect(await evaluate("ls != fn", ctx)).to.equal(true);                                    
    
            expect(await evaluate("ns != ()", ctx)).to.equal(true);                                    
            expect(await evaluate("ns != T", ctx)).to.equal(true);                                    
            expect(await evaluate("ns != F", ctx)).to.equal(true);                                    
            expect(await evaluate("ns != 1", ctx)).to.equal(true);                                    
            expect(await evaluate("ns != 'abc'", ctx)).to.equal(true);                                    
            expect(await evaluate("ns != ls", ctx)).to.equal(true);                                    
            expect(await evaluate("ns != fn", ctx)).to.equal(true);                                    
    
            expect(await evaluate("fn != ()", ctx)).to.equal(true);                                    
            expect(await evaluate("fn != T", ctx)).to.equal(true);                                    
            expect(await evaluate("fn != F", ctx)).to.equal(true);                                    
            expect(await evaluate("fn != 1", ctx)).to.equal(true);                                    
            expect(await evaluate("fn != 'abc'", ctx)).to.equal(true);                                    
            expect(await evaluate("fn != ls", ctx)).to.equal(true);                                    
            expect(await evaluate("fn != ns", ctx)).to.equal(true);                                    
        });
    
        it("should compare tuples with lexicographical criteria", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("(1,2,3) != (1,2,3)", ctx)).to.equal(false);                        
            expect(await evaluate("(1,2,3) != (1,2)", ctx)).to.equal(true);                        
            expect(await evaluate("(1,2) != (1,2,3)", ctx)).to.equal(true);                                    
            expect(await evaluate("1 != (1,2,3)", ctx)).to.equal(true);                                    
            expect(await evaluate("(1,2,3) != 1", ctx)).to.equal(true);                                    
        });
    });    
    
    describe("X < Y", () => {
    
        it("should return false if both X and Y are nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() < ()", ctx)).to.equal(false);            
        });
    
        it("should return true if X is false and Y is true", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("T < T", ctx)).to.equal(false);            
            expect(await evaluate("F < F", ctx)).to.equal(false);            
            expect(await evaluate("T < F", ctx)).to.equal(false);            
            expect(await evaluate("F < T", ctx)).to.equal(true);            
        });
    
        it("should return true if X is a lower number than Y", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("1 < 2", ctx)).to.equal(true);            
            expect(await evaluate("0 < 2", ctx)).to.equal(true);            
            expect(await evaluate("-1 < 2", ctx)).to.equal(true);            
            expect(await evaluate("2 < 1", ctx)).to.equal(false);            
            expect(await evaluate("2 < 0", ctx)).to.equal(false);            
            expect(await evaluate("2 < (-2)", ctx)).to.equal(false);            
            expect(await evaluate("2 < 2", ctx)).to.equal(false);            
        });
    
        it("should return true if X and Y are both strings and X precedes Y alphabetically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("'abc' < 'def'", ctx)).to.equal(true);            
            expect(await evaluate("'abc' < 'abd'", ctx)).to.equal(true);            
            expect(await evaluate("'ab' < 'abc'", ctx)).to.equal(true);            
            expect(await evaluate("'' < 'abc'", ctx)).to.equal(true);            
            expect(await evaluate("'abc' < 'abc'", ctx)).to.equal(false);                        
            expect(await evaluate("'abd' < 'abc'", ctx)).to.equal(false);                        
            expect(await evaluate("'abc' < 'ab'", ctx)).to.equal(false);                        
            expect(await evaluate("'abc' < ''", ctx)).to.equal(false);                        
        });
    
        it("should return true if X and Y are both lists and X precedes Y lexicographically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("[1,2,3] < [4,5,6]", ctx)).to.equal(true);            
            expect(await evaluate("[1,2,3] < [1,2,4]", ctx)).to.equal(true);            
            expect(await evaluate("[1,2] < [1,2,4]", ctx)).to.equal(true);
            expect(await evaluate("[] < [1,2,3]", ctx)).to.equal(true);            
            expect(await evaluate("[1,2,3] < [1,2,3]", ctx)).to.equal(false);                        
            expect(await evaluate("[1,2,4] < [1,2,3]", ctx)).to.equal(false);                        
            expect(await evaluate("[1,2,4] < [1,2]", ctx)).to.equal(false);                        
            expect(await evaluate("[1,2,3] < []", ctx)).to.equal(false);                        
        });
    
        it("should return true if X is nothing and Y is not", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() < ()", ctx)).to.equal(false);                                    
            expect(await evaluate("() < T", ctx)).to.equal(true);                                    
            expect(await evaluate("() < F", ctx)).to.equal(true);                                    
            expect(await evaluate("() < 1", ctx)).to.equal(true);                                    
            expect(await evaluate("() < 'abc'", ctx)).to.equal(true);                                    
            expect(await evaluate("() < ls", ctx)).to.equal(true);                                    
            expect(await evaluate("() < ns", ctx)).to.equal(true);                                    
            expect(await evaluate("() < fn", ctx)).to.equal(true);                                                
        });
    
        it("should return false if Y is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() < ()", ctx)).to.equal(false);                                    
            expect(await evaluate("T < ()", ctx)).to.equal(false);                                    
            expect(await evaluate("F < ()", ctx)).to.equal(false);                                    
            expect(await evaluate("1 < ()", ctx)).to.equal(false);                                    
            expect(await evaluate("'abc' < ()", ctx)).to.equal(false);                                    
            expect(await evaluate("ls < ()", ctx)).to.equal(false);                                    
            expect(await evaluate("ns < ()", ctx)).to.equal(false);                                    
            expect(await evaluate("fn < ()", ctx)).to.equal(false);                                                            
        });
    
        it("should thow an error for any other type combination", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            var expectCmpError = (expression, xType, yType) => expectError(() => evaluate(expression, ctx), `Comparison operation not defined between ${xType} and ${yType}`);
    
            var xType='Boolean'; ctx.x = false;
            await expectCmpError("x < 1",     xType, 'Number');                                    
            await expectCmpError("x < 'abc'", xType, 'String');                                    
            await expectCmpError("x < ls",    xType, 'List');                                    
            await expectCmpError("x < ns",    xType, 'Namespace');                                    
            await expectCmpError("x < fn",    xType, 'Function');                                                
    
            var xType='Boolean'; ctx.x = true;
            await expectCmpError("x < 1",     xType, 'Number');                                    
            await expectCmpError("x < 'abc'", xType, 'String');                                    
            await expectCmpError("x < ls",    xType, 'List');                                    
            await expectCmpError("x < ns",    xType, 'Namespace');                                    
            await expectCmpError("x < fn",    xType, 'Function');                                                
    
            var xType='Number'; ctx.x = 10;
            await expectCmpError("x < T",     xType, 'Boolean');                                    
            await expectCmpError("x < F",     xType, 'Boolean');                                    
            await expectCmpError("x < 'abc'", xType, 'String');                                    
            await expectCmpError("x < ls",    xType, 'List');                                    
            await expectCmpError("x < ns",    xType, 'Namespace');                                    
            await expectCmpError("x < fn",    xType, 'Function');                                                
    
            var xType='String'; ctx.x = 'abc';
            await expectCmpError("x < T",     xType, 'Boolean');                                    
            await expectCmpError("x < F",     xType, 'Boolean');                                    
            await expectCmpError("x < 10",    xType, 'Number');                                    
            await expectCmpError("x < ls",    xType, 'List');                                    
            await expectCmpError("x < ns",    xType, 'Namespace');                                    
            await expectCmpError("x < fn",    xType, 'Function');                                                
    
            var xType='List'; ctx.x = [1,2,3];
            await expectCmpError("x < T",     xType, 'Boolean');                                    
            await expectCmpError("x < F",     xType, 'Boolean');                                    
            await expectCmpError("x < 10",    xType, 'Number');                                    
            await expectCmpError("x < 'abc'", xType, 'String');                                    
            await expectCmpError("x < ns",    xType, 'Namespace');                                    
            await expectCmpError("x < fn",    xType, 'Function');                                                
    
            var xType='Namespace'; ctx.x = {a:1,b:2};
            await expectCmpError("x < T",     xType, 'Boolean');                                    
            await expectCmpError("x < F",     xType, 'Boolean');                                    
            await expectCmpError("x < 10",    xType, 'Number');                                    
            await expectCmpError("x < 'abc'", xType, 'String');                                    
            await expectCmpError("x < ls",    xType, 'List');                                    
            await expectCmpError("x < ns",    xType, 'Namespace');                                    
            await expectCmpError("x < fn",    xType, 'Function');                                                
    
            var xType='Function'; ctx.x = x=>2*x;
            await expectCmpError("x < T",     xType, 'Boolean');                                    
            await expectCmpError("x < F",     xType, 'Boolean');                                    
            await expectCmpError("x < 10",    xType, 'Number');                                    
            await expectCmpError("x < 'abc'", xType, 'String');                                    
            await expectCmpError("x < ls",    xType, 'List');                                    
            await expectCmpError("x < ns",    xType, 'Namespace');                                                
            await expectCmpError("x < fn",    xType, 'Function');                                                
        });
    
        it("should compare tuples with lexicographical criteria", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("(1,2,3) < (4,5,6)", ctx)).to.equal(true);            
            expect(await evaluate("(1,2,3) < (1,2,4)", ctx)).to.equal(true);            
            expect(await evaluate("(1,2) < (1,2,4)", ctx)).to.equal(true);            
            expect(await evaluate("() < (1,2,3)", ctx)).to.equal(true);            
            expect(await evaluate("(1,2,3) < (1,2,3)", ctx)).to.equal(false);                        
            expect(await evaluate("(1,2,4) < (1,2,3)", ctx)).to.equal(false);                        
            expect(await evaluate("(1,2,4) < (1,2)", ctx)).to.equal(false);                        
            expect(await evaluate("(1,2,3) < ()", ctx)).to.equal(false);                        
        });
    });
    
    describe("X >= Y", () => {
    
        it("should return true if both X and Y are nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() >= ()", ctx)).to.equal(true);            
        });
    
        it("should return false if X is false and Y is true", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("T >= T", ctx)).to.equal(true);            
            expect(await evaluate("F >= F", ctx)).to.equal(true);     
            expect(await evaluate("T >= F", ctx)).to.equal(true);            
            expect(await evaluate("F >= T", ctx)).to.equal(false);            
        });
    
        it("should return false if X is a lower number than Y", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("1 >= 2", ctx)).to.equal(false);            
            expect(await evaluate("0 >= 2", ctx)).to.equal(false);            
            expect(await evaluate("-1 >= 2", ctx)).to.equal(false);            
            expect(await evaluate("2 >= 1", ctx)).to.equal(true);            
            expect(await evaluate("2 >= 0", ctx)).to.equal(true);            
            expect(await evaluate("2 >= (-2)", ctx)).to.equal(true);            
            expect(await evaluate("2 >= 2", ctx)).to.equal(true);            
        });
    
        it("should return false if X and Y are both strings and X precedes Y alphabetically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("'abc' >= 'def'", ctx)).to.equal(false);            
            expect(await evaluate("'abc' >= 'abd'", ctx)).to.equal(false);            
            expect(await evaluate("'ab' >= 'abc'", ctx)).to.equal(false);            
            expect(await evaluate("'' >= 'abc'", ctx)).to.equal(false);            
            expect(await evaluate("'abc' >= 'abc'", ctx)).to.equal(true);                        
            expect(await evaluate("'abd' >= 'abc'", ctx)).to.equal(true);                        
            expect(await evaluate("'abc' >= 'ab'", ctx)).to.equal(true);                        
            expect(await evaluate("'abc' >= ''", ctx)).to.equal(true);                        
        });
    
        it("should return false if X and Y are both lists and X precedes Y lexicographically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("[1,2,3] >= [4,5,6]", ctx)).to.equal(false);            
            expect(await evaluate("[1,2,3] >= [1,2,4]", ctx)).to.equal(false);            
            expect(await evaluate("[1,2] >= [1,2,4]", ctx)).to.equal(false);            
            expect(await evaluate("[] >= [1,2,3]", ctx)).to.equal(false);            
            expect(await evaluate("[1,2,3] >= [1,2,3]", ctx)).to.equal(true);                        
            expect(await evaluate("[1,2,4] >= [1,2,3]", ctx)).to.equal(true);                        
            expect(await evaluate("[1,2,4] >= [1,2]", ctx)).to.equal(true);                        
            expect(await evaluate("[1,2,3] >= []", ctx)).to.equal(true);                        
        });
    
        it("should return false if X is nothing and Y is not", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() >= ()", ctx)).to.equal(true);                                    
            expect(await evaluate("() >= T", ctx)).to.equal(false);                                    
            expect(await evaluate("() >= F", ctx)).to.equal(false);                                    
            expect(await evaluate("() >= 1", ctx)).to.equal(false);                                    
            expect(await evaluate("() >= 'abc'", ctx)).to.equal(false);                                    
            expect(await evaluate("() >= ls", ctx)).to.equal(false);                                    
            expect(await evaluate("() >= ns", ctx)).to.equal(false);                                    
            expect(await evaluate("() >= fn", ctx)).to.equal(false);                                                
        });
    
        it("should return true if Y is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() >= ()", ctx)).to.equal(true);                                    
            expect(await evaluate("T >= ()", ctx)).to.equal(true);                                    
            expect(await evaluate("F >= ()", ctx)).to.equal(true);                                    
            expect(await evaluate("1 >= ()", ctx)).to.equal(true);                                    
            expect(await evaluate("'abc' >= ()", ctx)).to.equal(true);                                    
            expect(await evaluate("ls >= ()", ctx)).to.equal(true);                                    
            expect(await evaluate("ns >= ()", ctx)).to.equal(true);                                    
            expect(await evaluate("fn >= ()", ctx)).to.equal(true);                                                            
        });
    
        it("should throw an error for any other type combination", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            var expectCmpError = (expression, xType, yType) => expectError(() => evaluate(expression, ctx), `Comparison operation not defined between ${xType} and ${yType}`);
    
            var xType='Boolean'; ctx.x = false;
            await expectCmpError("x >= 1",     xType, 'Number');                                    
            await expectCmpError("x >= 'abc'", xType, 'String');                                    
            await expectCmpError("x >= ls",    xType, 'List');                                    
            await expectCmpError("x >= ns",    xType, 'Namespace');                                    
            await expectCmpError("x >= fn",    xType, 'Function');                                                
    
            var xType='Boolean'; ctx.x = true;
            await expectCmpError("x >= 1",     xType, 'Number');                                    
            await expectCmpError("x >= 'abc'", xType, 'String');                                    
            await expectCmpError("x >= ls",    xType, 'List');                                    
            await expectCmpError("x >= ns",    xType, 'Namespace');                                    
            await expectCmpError("x >= fn",    xType, 'Function');                                                
    
            var xType='Number'; ctx.x = 10;
            await expectCmpError("x >= T",     xType, 'Boolean');                                    
            await expectCmpError("x >= F",     xType, 'Boolean');                                    
            await expectCmpError("x >= 'abc'", xType, 'String');                                    
            await expectCmpError("x >= ls",    xType, 'List');                                    
            await expectCmpError("x >= ns",    xType, 'Namespace');                                    
            await expectCmpError("x >= fn",    xType, 'Function');                                                
    
            var xType='String'; ctx.x = 'abc';
            await expectCmpError("x >= T",     xType, 'Boolean');                                    
            await expectCmpError("x >= F",     xType, 'Boolean');                                    
            await expectCmpError("x >= 10",    xType, 'Number');                                    
            await expectCmpError("x >= ls",    xType, 'List');                                    
            await expectCmpError("x >= ns",    xType, 'Namespace');                                    
            await expectCmpError("x >= fn",    xType, 'Function');                                                
    
            var xType='List'; ctx.x = [1,2,3];
            await expectCmpError("x >= T",     xType, 'Boolean');                                    
            await expectCmpError("x >= F",     xType, 'Boolean');                                    
            await expectCmpError("x >= 10",    xType, 'Number');                                    
            await expectCmpError("x >= 'abc'", xType, 'String');                                    
            await expectCmpError("x >= ns",    xType, 'Namespace');                                    
            await expectCmpError("x >= fn",    xType, 'Function');                                                
    
            var xType='Namespace'; ctx.x = {a:1,b:2};
            await expectCmpError("x >= T",     xType, 'Boolean');                                    
            await expectCmpError("x >= F",     xType, 'Boolean');                                    
            await expectCmpError("x >= 10",    xType, 'Number');                                    
            await expectCmpError("x >= 'abc'", xType, 'String');                                    
            await expectCmpError("x >= ls",    xType, 'List');                                    
            await expectCmpError("x >= ns",    xType, 'Namespace');                                    
            await expectCmpError("x >= fn",    xType, 'Function');                                                
    
            var xType='Function'; ctx.x = x=>2*x;
            await expectCmpError("x >= T",     xType, 'Boolean');                                    
            await expectCmpError("x >= F",     xType, 'Boolean');                                    
            await expectCmpError("x >= 10",    xType, 'Number');                                    
            await expectCmpError("x >= 'abc'", xType, 'String');                                    
            await expectCmpError("x >= ls",    xType, 'List');                                    
            await expectCmpError("x >= ns",    xType, 'Namespace');                                                
            await expectCmpError("x >= fn",    xType, 'Function');                                                
        });
    
        it("should compare tuples with lexicographical criteria", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("(1,2,3) >= (4,5,6)", ctx)).to.equal(false);            
            expect(await evaluate("(1,2,3) >= (1,2,4)", ctx)).to.equal(false);            
            expect(await evaluate("(1,2) >= (1,2,4)", ctx)).to.equal(false);            
            expect(await evaluate("() >= (1,2,3)", ctx)).to.equal(false);            
            expect(await evaluate("(1,2,3) >= (1,2,3)", ctx)).to.equal(true);                        
            expect(await evaluate("(1,2,4) >= (1,2,3)", ctx)).to.equal(true);                        
            expect(await evaluate("(1,2,4) >= (1,2)", ctx)).to.equal(true);                        
            expect(await evaluate("(1,2,3) >= ()", ctx)).to.equal(true);                        
        });
    });    
    
    describe("X > Y", () => {
    
        it("should return false if both X and Y are nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() > ()", ctx)).to.equal(false);            
        });
    
        it("should return true if X is true and Y is false", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("T > T", ctx)).to.equal(false);            
            expect(await evaluate("F > F", ctx)).to.equal(false);            
            expect(await evaluate("T > F", ctx)).to.equal(true);            
            expect(await evaluate("F > T", ctx)).to.equal(false);            
        });
    
        it("should return true if X is a higher number than Y", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("1 > 2", ctx)).to.equal(false);            
            expect(await evaluate("0 > 2", ctx)).to.equal(false);            
            expect(await evaluate("-1 > 2", ctx)).to.equal(false);            
            expect(await evaluate("2 > 1", ctx)).to.equal(true);            
            expect(await evaluate("2 > 0", ctx)).to.equal(true);            
            expect(await evaluate("2 > (-2)", ctx)).to.equal(true);            
            expect(await evaluate("2 > 2", ctx)).to.equal(false);            
        });
    
        it("should return true if X and Y are both strings and X follows Y alphabetically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("'abc' > 'def'", ctx)).to.equal(false);            
            expect(await evaluate("'abc' > 'abd'", ctx)).to.equal(false);            
            expect(await evaluate("'ab' > 'abc'", ctx)).to.equal(false);            
            expect(await evaluate("'' > 'abc'", ctx)).to.equal(false);            
            expect(await evaluate("'abc' > 'abc'", ctx)).to.equal(false);                        
            expect(await evaluate("'abd' > 'abc'", ctx)).to.equal(true);                        
            expect(await evaluate("'abc' > 'ab'", ctx)).to.equal(true);                        
            expect(await evaluate("'abc' > ''", ctx)).to.equal(true);                        
        });
    
        it("should return true if X and Y are both lists and X follows Y lexicographically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("[1,2,3] > [4,5,6]", ctx)).to.equal(false);            
            expect(await evaluate("[1,2,3] > [1,2,4]", ctx)).to.equal(false);            
            expect(await evaluate("[1,2] > [1,2,4]", ctx)).to.equal(false);            
            expect(await evaluate("[] > [1,2,3]", ctx)).to.equal(false);            
            expect(await evaluate("[1,2,3] > [1,2,3]", ctx)).to.equal(false);                        
            expect(await evaluate("[1,2,4] > [1,2,3]", ctx)).to.equal(true);                        
            expect(await evaluate("[1,2,4] > [1,2]", ctx)).to.equal(true);                        
            expect(await evaluate("[1,2,3] > []", ctx)).to.equal(true);                        
        });
    
        it("should return false if X is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() > ()", ctx)).to.equal(false);                                    
            expect(await evaluate("() > T", ctx)).to.equal(false);                                    
            expect(await evaluate("() > F", ctx)).to.equal(false);                                    
            expect(await evaluate("() > 1", ctx)).to.equal(false);                                    
            expect(await evaluate("() > 'abc'", ctx)).to.equal(false);                                    
            expect(await evaluate("() > ls", ctx)).to.equal(false);                                    
            expect(await evaluate("() > ns", ctx)).to.equal(false);                                    
            expect(await evaluate("() > fn", ctx)).to.equal(false);                                                
        });
    
        it("should return true if Y is nothing and X is not", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() > ()", ctx)).to.equal(false);                                    
            expect(await evaluate("T > ()", ctx)).to.equal(true);                                    
            expect(await evaluate("F > ()", ctx)).to.equal(true);                                    
            expect(await evaluate("1 > ()", ctx)).to.equal(true);                                    
            expect(await evaluate("'abc' > ()", ctx)).to.equal(true);                                    
            expect(await evaluate("ls > ()", ctx)).to.equal(true);                                    
            expect(await evaluate("ns > ()", ctx)).to.equal(true);                                    
            expect(await evaluate("fn > ()", ctx)).to.equal(true);                                                            
        });
    
        it("should throw an error for any other type combination", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            var expectCmpError = (expression, xType, yType) => expectError(() => evaluate(expression, ctx), `Comparison operation not defined between ${xType} and ${yType}`);
    
            var xType='Boolean'; ctx.x = false;
            await expectCmpError("x > 1",     xType, 'Number');                                    
            await expectCmpError("x > 'abc'", xType, 'String');                                    
            await expectCmpError("x > ls",    xType, 'List');                                    
            await expectCmpError("x > ns",    xType, 'Namespace');                                    
            await expectCmpError("x > fn",    xType, 'Function');                                                
    
            var xType='Boolean'; ctx.x = true;
            await expectCmpError("x > 1",     xType, 'Number');                                    
            await expectCmpError("x > 'abc'", xType, 'String');                                    
            await expectCmpError("x > ls",    xType, 'List');                                    
            await expectCmpError("x > ns",    xType, 'Namespace');                                    
            await expectCmpError("x > fn",    xType, 'Function');                                                
    
            var xType='Number'; ctx.x = 10;
            await expectCmpError("x > T",     xType, 'Boolean');                                    
            await expectCmpError("x > F",     xType, 'Boolean');                                    
            await expectCmpError("x > 'abc'", xType, 'String');                                    
            await expectCmpError("x > ls",    xType, 'List');                                    
            await expectCmpError("x > ns",    xType, 'Namespace');                                    
            await expectCmpError("x > fn",    xType, 'Function');                                                
    
            var xType='String'; ctx.x = 'abc';
            await expectCmpError("x > T",     xType, 'Boolean');                                    
            await expectCmpError("x > F",     xType, 'Boolean');                                    
            await expectCmpError("x > 10",    xType, 'Number');                                    
            await expectCmpError("x > ls",    xType, 'List');                                    
            await expectCmpError("x > ns",    xType, 'Namespace');                                    
            await expectCmpError("x > fn",    xType, 'Function');                                                
    
            var xType='List'; ctx.x = [1,2,3];
            await expectCmpError("x > T",     xType, 'Boolean');                                    
            await expectCmpError("x > F",     xType, 'Boolean');                                    
            await expectCmpError("x > 10",    xType, 'Number');                                    
            await expectCmpError("x > 'abc'", xType, 'String');                                    
            await expectCmpError("x > ns",    xType, 'Namespace');                                    
            await expectCmpError("x > fn",    xType, 'Function');                                                
    
            var xType='Namespace'; ctx.x = {a:1,b:2};
            await expectCmpError("x > T",     xType, 'Boolean');                                    
            await expectCmpError("x > F",     xType, 'Boolean');                                    
            await expectCmpError("x > 10",    xType, 'Number');                                    
            await expectCmpError("x > 'abc'", xType, 'String');                                    
            await expectCmpError("x > ls",    xType, 'List');                                    
            await expectCmpError("x > ns",    xType, 'Namespace');                                    
            await expectCmpError("x > fn",    xType, 'Function');                                                
    
            var xType='Function'; ctx.x = x=>2*x;
            await expectCmpError("x > T",     xType, 'Boolean');                                    
            await expectCmpError("x > F",     xType, 'Boolean');                                    
            await expectCmpError("x > 10",    xType, 'Number');                                    
            await expectCmpError("x > 'abc'", xType, 'String');                                    
            await expectCmpError("x > ls",    xType, 'List');                                    
            await expectCmpError("x > ns",    xType, 'Namespace');                                                
            await expectCmpError("x > fn",    xType, 'Function');                                                
        });
    
        it("should compare tuples with lexicographical criteria", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("(1,2,3) > (4,5,6)", ctx)).to.equal(false);            
            expect(await evaluate("(1,2,3) > (1,2,4)", ctx)).to.equal(false);            
            expect(await evaluate("(1,2) > (1,2,4)", ctx)).to.equal(false);            
            expect(await evaluate("() > (1,2,3)", ctx)).to.equal(false);            
            expect(await evaluate("(1,2,3) > (1,2,3)", ctx)).to.equal(false);                        
            expect(await evaluate("(1,2,4) > (1,2,3)", ctx)).to.equal(true);                        
            expect(await evaluate("(1,2,4) > (1,2)", ctx)).to.equal(true);                        
            expect(await evaluate("(1,2,3) > ()", ctx)).to.equal(true);                        
        });
    });
    
    describe("X <= Y", () => {
    
        it("should return true if both X and Y are nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() <= ()", ctx)).to.equal(true);            
        });
    
        it("should return false if X is true and Y is false", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("T <= T", ctx)).to.equal(true);            
            expect(await evaluate("F <= F", ctx)).to.equal(true);            
            expect(await evaluate("T <= F", ctx)).to.equal(false);            
            expect(await evaluate("F <= T", ctx)).to.equal(true);            
        });
    
        it("should return false if X is a higher number than Y", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("1 <= 2", ctx)).to.equal(true);            
            expect(await evaluate("0 <= 2", ctx)).to.equal(true);            
            expect(await evaluate("-1 <= 2", ctx)).to.equal(true);            
            expect(await evaluate("2 <= 1", ctx)).to.equal(false);            
            expect(await evaluate("2 <= 0", ctx)).to.equal(false);            
            expect(await evaluate("2 <= (-2)", ctx)).to.equal(false);            
            expect(await evaluate("2 <= 2", ctx)).to.equal(true);            
        });
    
        it("should return false if X and Y are both strings and X follows Y alphabetically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("'abc' <= 'def'", ctx)).to.equal(true);            
            expect(await evaluate("'abc' <= 'abd'", ctx)).to.equal(true);            
            expect(await evaluate("'ab' <= 'abc'", ctx)).to.equal(true);            
            expect(await evaluate("'' <= 'abc'", ctx)).to.equal(true);            
            expect(await evaluate("'abc' <= 'abc'", ctx)).to.equal(true);                        
            expect(await evaluate("'abd' <= 'abc'", ctx)).to.equal(false);                        
            expect(await evaluate("'abc' <= 'ab'", ctx)).to.equal(false);                        
            expect(await evaluate("'abc' <= ''", ctx)).to.equal(false);                        
        });
    
        it("should return false if X and Y are both lists and X follows Y lexicographically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("[1,2,3] <= [4,5,6]", ctx)).to.equal(true);            
            expect(await evaluate("[1,2,3] <= [1,2,4]", ctx)).to.equal(true);            
            expect(await evaluate("[1,2] <= [1,2,4]", ctx)).to.equal(true);            
            expect(await evaluate("[] <= [1,2,3]", ctx)).to.equal(true);            
            expect(await evaluate("[1,2,3] <= [1,2,3]", ctx)).to.equal(true);                        
            expect(await evaluate("[1,2,4] <= [1,2,3]", ctx)).to.equal(false);                        
            expect(await evaluate("[1,2,4] <= [1,2]", ctx)).to.equal(false);                        
            expect(await evaluate("[1,2,3] <= []", ctx)).to.equal(false);                        
        });
    
        it("should return true if X is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() <= ()", ctx)).to.equal(true);                                    
            expect(await evaluate("() <= T", ctx)).to.equal(true);                                    
            expect(await evaluate("() <= F", ctx)).to.equal(true);                                    
            expect(await evaluate("() <= 1", ctx)).to.equal(true);                                    
            expect(await evaluate("() <= 'abc'", ctx)).to.equal(true);                                    
            expect(await evaluate("() <= ls", ctx)).to.equal(true);                                    
            expect(await evaluate("() <= ns", ctx)).to.equal(true);                                    
            expect(await evaluate("() <= fn", ctx)).to.equal(true);                                                
        });
    
        it("should return false if Y is nothing and X is not", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() <= ()", ctx)).to.equal(true);                                    
            expect(await evaluate("T <= ()", ctx)).to.equal(false);                                    
            expect(await evaluate("F <= ()", ctx)).to.equal(false);                                    
            expect(await evaluate("1 <= ()", ctx)).to.equal(false);                                    
            expect(await evaluate("'abc' <= ()", ctx)).to.equal(false);                                    
            expect(await evaluate("ls <= ()", ctx)).to.equal(false);                                    
            expect(await evaluate("ns <= ()", ctx)).to.equal(false);                                    
            expect(await evaluate("fn <= ()", ctx)).to.equal(false);                                                            
        });
    
        it("should throw an error for any other type combination", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            var expectCmpError = (expression, xType, yType) => expectError(() => evaluate(expression, ctx), `Comparison operation not defined between ${xType} and ${yType}`);
    
            var xType='Boolean'; ctx.x = false;
            await expectCmpError("x <= 1",     xType, 'Number');                                    
            await expectCmpError("x <= 'abc'", xType, 'String');                                    
            await expectCmpError("x <= ls",    xType, 'List');                                    
            await expectCmpError("x <= ns",    xType, 'Namespace');                                    
            await expectCmpError("x <= fn",    xType, 'Function');                                                
    
            var xType='Boolean'; ctx.x = true;
            await expectCmpError("x <= 1",     xType, 'Number');                                    
            await expectCmpError("x <= 'abc'", xType, 'String');                                    
            await expectCmpError("x <= ls",    xType, 'List');                                    
            await expectCmpError("x <= ns",    xType, 'Namespace');                                    
            await expectCmpError("x <= fn",    xType, 'Function');                                                
    
            var xType='Number'; ctx.x = 10;
            await expectCmpError("x <= T",     xType, 'Boolean');                                    
            await expectCmpError("x <= F",     xType, 'Boolean');                                    
            await expectCmpError("x <= 'abc'", xType, 'String');                                    
            await expectCmpError("x <= ls",    xType, 'List');                                    
            await expectCmpError("x <= ns",    xType, 'Namespace');                                    
            await expectCmpError("x <= fn",    xType, 'Function');                                                
    
            var xType='String'; ctx.x = 'abc';
            await expectCmpError("x <= T",     xType, 'Boolean');                                    
            await expectCmpError("x <= F",     xType, 'Boolean');                                    
            await expectCmpError("x <= 10",    xType, 'Number');                                    
            await expectCmpError("x <= ls",    xType, 'List');                                    
            await expectCmpError("x <= ns",    xType, 'Namespace');                                    
            await expectCmpError("x <= fn",    xType, 'Function');                                                
    
            var xType='List'; ctx.x = [1,2,3];
            await expectCmpError("x <= T",     xType, 'Boolean');                                    
            await expectCmpError("x <= F",     xType, 'Boolean');                                    
            await expectCmpError("x <= 10",    xType, 'Number');                                    
            await expectCmpError("x <= 'abc'", xType, 'String');                                    
            await expectCmpError("x <= ns",    xType, 'Namespace');                                    
            await expectCmpError("x <= fn",    xType, 'Function');                                                
    
            var xType='Namespace'; ctx.x = {a:1,b:2};
            await expectCmpError("x <= T",     xType, 'Boolean');                                    
            await expectCmpError("x <= F",     xType, 'Boolean');                                    
            await expectCmpError("x <= 10",    xType, 'Number');                                    
            await expectCmpError("x <= 'abc'", xType, 'String');                                    
            await expectCmpError("x <= ls",    xType, 'List');                                    
            await expectCmpError("x <= ns",    xType, 'Namespace');                                    
            await expectCmpError("x <= fn",    xType, 'Function');                                                
    
            var xType='Function'; ctx.x = x=>2*x;
            await expectCmpError("x <= T",     xType, 'Boolean');                                    
            await expectCmpError("x <= F",     xType, 'Boolean');                                    
            await expectCmpError("x <= 10",    xType, 'Number');                                    
            await expectCmpError("x <= 'abc'", xType, 'String');                                    
            await expectCmpError("x <= ls",    xType, 'List');                                    
            await expectCmpError("x <= ns",    xType, 'Namespace');                                                
            await expectCmpError("x <= fn",    xType, 'Function');                                                
        });
    
        it("should compare tuples with lexicographical criteria", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("(1,2,3) <= (4,5,6)", ctx)).to.equal(true);            
            expect(await evaluate("(1,2,3) <= (1,2,4)", ctx)).to.equal(true);            
            expect(await evaluate("(1,2) <= (1,2,4)", ctx)).to.equal(true);            
            expect(await evaluate("() <= (1,2,3)", ctx)).to.equal(true);            
            expect(await evaluate("(1,2,3) <= (1,2,3)", ctx)).to.equal(true);                        
            expect(await evaluate("(1,2,4) <= (1,2,3)", ctx)).to.equal(false);                        
            expect(await evaluate("(1,2,4) <= (1,2)", ctx)).to.equal(false);                        
            expect(await evaluate("(1,2,3) <= ()", ctx)).to.equal(false);                        
        });
    });
    
    
    // MISCELLANEOUS
    
    describe("string templates", () => {
    
        it("should evaluate the expressions between ${...} when the string is enclosed between accent quotes", async () => {
            var ctx = createContext({y:2});
            expect(await evaluate("`x = ${1+y}`", ctx)).to.equal("x = 3");
        });
    
        it("should evaluate the expressions in a child context", async () => {
            var ctx = createContext({x:10, y:20});
            expect(await evaluate("`${x=2}x+y = ${x+y}`", ctx)).to.equal("x+y = 22");
            expect(ctx.x).to.equal(10);
        });
    });
    
    describe("operators precedence and grouping", () => {
    
        it("should execute assignment operations (`=`) before pairing operations (`,`)", async () => {
            var ctx = createContext();
    
            await evaluate("x = 1,2,3", ctx);
            expect(ctx.x).to.equal(1);
    
            await evaluate("x = (1,2,3)", ctx);
            expect(isTuple(ctx.x)).to.be.true;
            expect(Array.from(ctx.x)).to.deep.equal([1,2,3]);
        });
    
        it("should execute function definitions (`->`) before assignment operations (`=`)", async () => {
            var ctx = createContext();
    
            await evaluate("f = x -> [x]", ctx);
            expect(ctx.f).to.be.a("function");
            expect(await ctx.f(1)).to.deep.equal([1]);
    
            var retval = await evaluate("1, f = x -> [x], 2", ctx);
            expect(ctx.f).to.be.a("function");
            expect(isTuple(retval)).to.be.true;
            expect(Array.from(retval)).to.deep.equal([1,2]);
        });
    
        it("should execure `;` operations before function definitions (`->`)", async () => {
            var ctx = createContext({T:true, F:false});                        
            expect(await evaluate("f = (x) -> x ; 1", ctx)).to.equal(null);
            expect(await ctx.f(3)).to.equal(3);
            expect(await ctx.f()).to.equal(1);
        });
    
        it("should execure `?` operations before `;` operations", async () => {
            var ctx = createContext({T:true, F:false});                        
            expect(await evaluate("f = (x,y) -> x ? 1 ; y ? 2 ; 3", ctx)).to.equal(null);
            expect(await ctx.f(true, false)).to.equal(1);
            expect(await ctx.f(true, true)).to.equal(1);
            expect(await ctx.f(false, true)).to.equal(2);
            expect(await ctx.f(false, false)).to.equal(3);            
        });
    
        it("should execute logic operations (`&` and `|`) before `?` and `;` operations", async () => {
            var ctx = createContext({T:true, F:false});            
            expect(await evaluate("f = (x,y) -> x & y ? 1 ; x | y ? 2 ; 3", ctx)).to.equal(null);
            expect(await ctx.f(true, true)).to.equal(1);
            expect(await ctx.f(true, false)).to.equal(2);
            expect(await ctx.f(false, true)).to.equal(2);
            expect(await ctx.f(false, false)).to.equal(3);            
        });
    
        it("should execute comparison operations (`==`,`!=`,`<`,`<=`,`>=`,`>`) before logic operations (`&` and `|`)", async () => {
            var ctx = createContext({T:true, F:false});            
            expect(await evaluate("f = x -> x==0 ? 'null' ; 0.01<=x & x<0.1 ? 'small' ; 1000>x & x>=100 ? 'big' ; 'huge' ", ctx)).to.equal(null);
            expect(await ctx.f(0)).to.equal('null');
            expect(await ctx.f(0.01)).to.equal('small');
            expect(await ctx.f(0.09)).to.equal('small');
            expect(await ctx.f(999)).to.equal('big');
            expect(await ctx.f(100)).to.equal('big');
            expect(await ctx.f(1000)).to.equal('huge');
        });
    
        it("should execute sum (`+`) and subtraction (`-`) operations before comparison operations (`==`,`!=`,`<`,`<=`,`>=`,`>`)", async () => {
            var ctx = createContext({T:true, F:false});            
            expect(await evaluate("1+1<4 & 8-3==5",ctx)).to.equal(true);
        });
    
        it("should execute product (`*`) division (`/`) and modulo (`%`) operations before sum and subtraction operations (`+` and `-`)", async () => {
            var ctx = createContext({T:true, F:false});            
            expect(await evaluate("1+2*3-10/5+8%5",ctx)).to.equal(8);
        });
    
        it("should execute exponentiation (`^`) operations before product (`*`) division (`/`) and modulo (`%`) operations", async () => {
            var ctx = createContext({T:true, F:false});            
            expect(await evaluate("1+2*3^2-10/5+8%5",ctx)).to.equal(20);
        });
    
        it("should execute subcontexting (`.`) and function calls before arithmetic operations", async () => {
            var ctx = createContext({double:x=>2*x, b:10});                        
            expect(await evaluate("double 2+3", ctx)).to.equal(7);
            expect(await evaluate("double(2+3)", ctx)).to.equal(10);
    
            expect(await evaluate("{a=1,b=2}.a+b", ctx)).to.equal(11);
            expect(await evaluate("{a=1,b=2}.(a+b)", ctx)).to.equal(3);            
    
            expect(await evaluate("{f=x->2*x}.f 2", ctx)).to.equal(4);
            expect(await evaluate("(x->{a=2*x}) 4 . a", ctx)).to.equal(8);
        });
    });
    
    describe("errors stack", () => {        
        it("should add the functions stack and the expression source to the runtime errors", async () => {
            class DidNotThrow extends Error {};
            var ctx = createContext();
            await evaluate("f1 = x -> 2/x", ctx);
            await evaluate("f2 = x -> f1 x + 1", ctx)
            try {
                await evaluate("f2 [1,2,3]", ctx);
                throw DidNotThrow();
            } catch (error) {
                expect(error).to.be.not.instanceof(DidNotThrow);
                expect(error.swanStack).to.deep.equal([
                    '@function ((x)->((f1(x))+1))', 
                    '@function ((x)->(2/x))'
                ]);
                expect(error.swanStackStr).to.equal("@function ((x)->((f1(x))+1))\n@function ((x)->(2/x))");
                expect(error.source).to.equal("f2 [1,2,3]");
            }
        });
    });
});
