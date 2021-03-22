var chai = require("chai"), expect = chai.expect;

var interpreter = require("../lib/interpreter");
var Tuple = interpreter.Tuple;
var Failure = interpreter.Failure;
var parse = expression => context => interpreter.parse(expression)(context).then(tuple => Tuple(tuple).normalize());
var context = interpreter.context;
var evaluate = (expression, presets={}) => parse(expression)(context.$extend(presets));

chai.use(function (chai, utils) {
    chai.Assertion.addMethod('tuple', function (itemArray) {
        var obj = utils.flag(this, 'object');
        expect(obj).to.be.instanceof(Tuple);
        expect(Array.from(obj)).to.deep.equal(itemArray);
    })
});

async function error (fn) {
    try {
        await fn();
        throw new Error("Id din not throw!");
    } catch (error) {
        return error.message;
    } 
}


describe("SWAN EXPRESSION INTERPRETER", () => {


    // CORE

    describe("numeric literals", () => {

        it("should evaluate decimal numeric literals to numbers", async () => {
            expect(await evaluate("10")).to.equal(10);
            expect(await evaluate("0")).to.equal(0);
            expect(await evaluate("-10")).to.equal(-10);
            expect(await evaluate("3.2")).to.equal(3.2);
            expect(await evaluate("-3.2")).to.equal(-3.2);
            expect(await evaluate("1.2e3")).to.equal(1200);
        });
    });

    describe("string literals", () => {

        it(`should evaluate string literals between double quotes '""'`, async () => {
            expect(await evaluate(`"abc"`)).to.equal("abc");
            expect(await evaluate(`""`)).to.equal("");
        });

        it("should evaluate string literals between single quotes `''`", async () => {
            expect(await evaluate(`'def'`)).to.equal("def");
            expect(await evaluate(`''`)).to.equal("");
        });
    });

    describe("tuples: `exp1, exp2, exp3, ...`", () => {

        it("should return the comma-separated values as a Tuple", async () => {
            expect(await evaluate("10,'abc'")).to.be.tuple([10,'abc']);
        });

        it("should flatten tuples of tuples: `(X,Y),Z` results in `X,Y,Z`", async () => {
            expect(await evaluate("1,(2,3),4,(5,(6,7)),8,9")).to.be.tuple([1,2,3,4,5,6,7,8,9]);
        });

        it("should ignore empty tuples when flattening tuples: `X,(),Y` results in `X,Y`", async () => {
            expect(await evaluate("1,(),2")).to.be.tuple([1,2]);
            expect(await evaluate("(),(1,(),2),(),3")).to.be.tuple([1,2,3]);
        });

        it("should evaluate empty tuples `()` as null", async () => {
            expect(await evaluate("")).to.equal(null);
            expect(await evaluate("()")).to.equal(null);
            expect(await evaluate("(), (), ()")).to.equal(null);
        });

        it("should evaluate 1-uples (x,()) as x", async () => {
            expect(await evaluate("(), 10, ()")).to.equal(10);
        });
    });

    describe("lists: `[expression]`", () => {

        it("should return an array", async () => {

            var list = await evaluate("[1,'abc',3]");
            expect(list).to.deep.equal([1,"abc",3]);

            var list = await evaluate("[1]");
            expect(list).to.deep.equal([1]);

            var list = await evaluate("[]");
            expect(list).to.deep.equal([]);
        });

        it("should not flatten deep lists", async () => {
            var list = await evaluate("[[1,2],3,4,[]]")
            expect(list).to.deep.equal([[1,2],3,4,[]]);
        });
    });

    describe("name resolution", () => {

        it("should return the value mapped to the name in the current context", async () => {
            var presets = {a:10, _b:20, __c__:"xxx"};
            expect(await evaluate("a", presets)).to.equal(10);
            expect(await evaluate("_b", presets)).to.equal(20);
            expect(await evaluate("__c__", presets)).to.equal("xxx");
        });

        it("should return `null` (empty tuple) if the name is not mapped", async () => {
            expect(await evaluate("d", {a:10, _b:20})).to.equal(null);
        });

        it("should throw an error if an invalid name is used", async () => {
            class ExceptionExpected extends Error {};
            try {
                await evaluate("$a", {$a:1});
                throw new ExceptionExpected();
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
            }

            try {
                expect(await evaluate("1x")).to.equal(10);
                throw new ExceptionExpected();
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
            }
        });

        it("should not return properties inherited from javascript Object", async () => {
            expect(await evaluate("isPrototypeOf")).to.be.null;
            expect(await evaluate("hasOwnProperty")).to.be.null;
        });

        describe("name resolution in a child context", () => {

            it("should return the child name value if name is mapped in the child context", async () => {
                var presets = Object.assign(Object.create({a:10, b:20}), {a:100});
                expect(await evaluate("a", presets)).to.equal(100);
            });

            it("should return the parent name value if name is not mapped in the child context", async () => {
                var presets = Object.assign(Object.create({a:10, b:20}), {a:100});
                expect(await evaluate("b", presets)).to.equal(20);
            });

            it("should return null if the name is not mapped in the child context nor in the parent context", async () => {
                var presets = Object.assign(Object.create({a:10, b:20}), {a:100});
                expect(await evaluate("c", presets)).to.equal(null);
            });
        });
    });

    describe("TRUE constant", () => {
        it("should return true", async () => {
            expect(await evaluate("TRUE")).to.equal(true);
        });
    });

    describe("FALSE constant", () => {
        it("should return false", async () => {
            expect(await evaluate("FALSE")).to.equal(false);
        });
    });

    describe("labelling operation `name: expression`", () => {

        it("should create a new name in the current context and map it to the given value", async () => {
            var ctx = context.$extend();
            await parse("x: 10")(ctx);
            expect(ctx.x).to.equal(10);
        });

        it("should assign a tuple of values to a tuple of names", async () => {
            var ctx = context.$extend();
            await parse("(a,b,c) : (1,2,3)")(ctx);
            expect(ctx.a).to.equal(1);
            expect(ctx.b).to.equal(2);
            expect(ctx.c).to.equal(3);
        });

        it("should assign null to the last names if the values tuple is smaller than the names tuple", async () => {
            var ctx = context.$extend();
            await parse("(a,b,c,d) : (10,20)")(ctx);
            expect(ctx.a).to.equal(10);
            expect(ctx.b).to.equal(20);
            expect(ctx.c).to.be.null;
            expect(ctx.d).to.be.null;
        });

        it("should assign to the last name the tuple of remaining values if the names tuple is smaller than the values tuple", async () => {
            var ctx = context.$extend();

            await parse("(a,b) : (100,200,300)")(ctx);
            expect(ctx.a).to.equal(100);
            expect(ctx.b).to.be.tuple([200,300]);

            await parse("c : (10,20,30)")(ctx);
            expect(ctx.c).to.be.tuple([10,20,30]);
        });

        it("should overwrite an existing name-value mapping", async () => {
            var ctx = context.$extend({a:1});
            await parse("a : 2")(ctx);
            await parse("a : 3")(ctx);
            expect(ctx.a).to.equal(3);
        });

        it("should return the expression value", async () => {
            expect(await evaluate("x: 10")).to.equal(10);
            expect(await evaluate("(a,b,c) : (1,2,3)")).to.be.tuple([1,2,3]);
            expect(await evaluate("(a,b,c,d) : (10,20)")).to.be.tuple([10,20]);
            expect(await evaluate("(a,b) : (100,200,300)")).to.be.tuple([100,200,300]);
            expect(await evaluate("c : (10,20,30)")).to.be.tuple([10,20,30]);
        });
    });

    describe("assignment operation: name = expression", () => {

        it("should return null", async () => {
            expect(await evaluate("x = 10")).to.equal(null);
        });

        it("should create a new name in the current context and map it to the given value", async () => {
            var ctx = context.$extend();
            await parse("x = 10")(ctx);
            expect(ctx.x).to.equal(10);
        });

        it("should assign a tuple of values to a tuple of names", async () => {
            var ctx = context.$extend();
            await parse("(a,b,c) = (1,2,3)")(ctx);
            expect(ctx.a).to.equal(1);
            expect(ctx.b).to.equal(2);
            expect(ctx.c).to.equal(3);
        });

        it("should assign null to the last names if the values tuple is smaller than the names tuple", async () => {
            var ctx = context.$extend();
            await parse("(a,b,c,d) = (10,20)")(ctx);
            expect(ctx.a).to.equal(10);
            expect(ctx.b).to.equal(20);
            expect(ctx.c).to.be.null;
            expect(ctx.d).to.be.null;
        });

        it("should assign to the last name the tuple of remaining values if the names tuple is smaller than the values tuple", async () => {
            var ctx = context.$extend();

            await parse("(a,b) = (100,200,300)")(ctx);
            expect(ctx.a).to.equal(100);
            expect(ctx.b).to.be.tuple([200,300]);

            await parse("c = (10,20,30)")(ctx);
            expect(ctx.c).to.be.tuple([10,20,30]);
        });

        it("should overwrite an existing name-value mapping", async () => {
            var ctx = context.$extend({a:1});
            await parse("a = 2")(ctx);
            await parse("a = 3")(ctx);
            expect(ctx.a).to.equal(3);
        });
    });

    describe("namespace definition: {expression}", () => {

        it("return an object with the mapped names", async () => {
            expect(await evaluate("{x=1, y:2, z=3}")).to.deep.equal({x:1,y:2,z:3});
        });

        it("should ignore the non-assignment operations", async () => {
            expect(await evaluate("{x=1, 10, y=2, z=3}")).to.deep.equal({x:1,y:2,z:3});
        });

        it("should not assign the names to the parent context", async () => {
            var ctx = context.$extend({x:10});
            expect(await parse("{x=20}")(ctx)).to.deep.equal({x:20});
            expect(ctx.x).to.equal(10);
        });
    });

    describe("function definition: names_tuple -> expression", () => {

        it("should return a function resolving the expression in a context augumented with the argument names", async () => {
            var foo = await evaluate("(x, y) -> [y,x]");
            expect(foo).to.be.a("function");
            expect(await foo(10,20)).to.deep.equal([20,10]);
        });

        it("should follow the assignment rules when mapping argument names to parameters", async () => {

            var foo = await evaluate("(x, y) -> {a=x,b=y}");
            expect(await foo(10)).to.deep.equal({a:10, b:null});

            var retval = await foo(10,20,30);
            expect(retval.a).to.equal(10);
            expect(retval.b).to.be.tuple([20,30]);
        });

        it("should be righ-to-left associative", async () => {
            var foo = await evaluate("x -> y -> {a=x,b=y}");
            var foo10 = await foo(10);
            expect(foo10).to.be.a("function");
            expect(await foo10(20)).to.deep.equal({a:10, b:20});
        });
    });
    
    describe("'apply' operation: X Y", () => {

        describe("when X is a function", () => {

            it("should call the function with the parameter Y and return its return value", async () => {
                var presets = {
                    double: x => 2 * x,
                    sum: (x,y) => x + y
                };
                expect(await evaluate("(x -> [x]) 10", presets)).to.deep.equal([10]);
                expect(await evaluate("((x, y) -> [y,x])(10, 20)", presets)).to.deep.equal([20,10]);
                expect(await evaluate("double 25", presets)).to.equal(50);
                expect(await evaluate("sum(10, 20)", presets)).to.equal(30);
            });
        });

        describe("when X is a string", async () => {

            it("should return the Y-th character if Y is an integer", async () => {
                expect(await evaluate("'abcdef' 2")).to.equal('c');
            });

            it("should consider only the integer part of Y if Y is a decimal number", async () => {
                expect(await evaluate("'abcdef' 2.3")).to.equal('c');
            });

            it("should consider negative indexes as relative to the string end", async () => {
                expect(await evaluate("'abcdef' (-2)")).to.equal('e');
            });

            it("should return an empty string if Y is an out of range number or not a number", async () => {
                expect(await evaluate("'abcdef' 100")).to.equal("");
                expect(await evaluate("'abcdef' (-100)")).to.equal("");
                expect(await evaluate("'abcdef' ('1')")).to.equal("");
                expect(await evaluate("'abcdef' ([])")).to.equal("");
                expect(await evaluate("'abcdef' ({})")).to.equal("");
            });

            it("should return a tuple of charcters if Y is a tuple of numbers", async () => {
                expect(await evaluate("'abcdef' (1,'x',-1)")).to.be.tuple(['b','','f']);
            });
        });

        describe("when X is a list", () => {

            it("shoudl return the Y-th item if Y is an integer", async () => {
                expect(await evaluate("['a','b','c','d','e','f'] 2")).to.equal('c');
            });

            it("should consider only the integer part of Y if it is a decimal number", async () => {
                expect(await evaluate("['a','b','c','d','e','f'] 2.3")).to.equal('c');
            });

            it("should consider a negative indexe Y as relative to the list end", async () => {
                expect(await evaluate("['a','b','c','d','e','f'] (-2)")).to.equal('e');
            });

            it("should return null if the index Y is an out of range number or not a number", async () => {
                expect(await evaluate("['a','b','c','d','e','f'] 100")).to.equal(null);
                expect(await evaluate("['a','b','c','d','e','f'] (-100)")).to.equal(null);
                expect(await evaluate("['a','b','c','d','e','f'] ('1')")).to.equal(null);
                expect(await evaluate("['a','b','c','d','e','f'] ([])")).to.equal(null);
                expect(await evaluate("['a','b','c','d','e','f'] ({})")).to.equal(null);
            });

            it("should return a tuple of values if Y is a tuple of numbers", async () => {
                expect(await evaluate("['a','b','c','d','e','f'] (1,'x',-1)")).to.be.tuple(['b','f']);
            });
        });

        describe("when X is a namespace", () => {

            it("should return the value mapped to the name Y", async () => {
                expect(await evaluate("{a=1,b=2,c=3} 'c'")).to.equal(3);
            });

            it("should return null if Y is not a valid name", async () => {
                expect(await evaluate("{a=1,b=2,c=3} 1")).to.equal(null);
                expect(await evaluate("{a=1,b=2,c=3} '$key'")).to.equal(null);
            });

            it("should return null if Y is a name not mapped to any value", async () => {
                expect(await evaluate("{a=1,b=2,c=3} 'd'")).to.equal(null);
            });
            
            it("should return multiple values if Y is a tuple of names", async () => {
                expect(await evaluate("{a:1,b:2,c:3}('a',1,'c')")).to.be.tuple([1,3]);
            });
        });

        describe("when X is a number", () => {
            
            it("should throw an exception", async () => {
                expect(await error(() => evaluate("(10)(1)"))).to.equal("Apply operation not defined on Number type.");
            });
        });

        describe("when X is a boolean", () => {

            it("should throw an exception", async () => {
                expect(await error(() => evaluate("b(1)", {b:true}))).to.equal("Apply operation not defined on Boolean type.");
            });
        });

        describe("when X is a tuple", () => {

            it("should return a tuple obtained applying each item to Y", async () => {
                var presets = {
                    f: x => 2*x,
                    s: "abcdef"
                };
                expect(await evaluate("(f, s)(2)", presets)).to.be.tuple([4, 'c']);
                expect(await evaluate("(f, s)(2,3)", presets)).to.be.tuple([4, 'c', 'd']);
            });
        });
    });

    describe("tuple mapping operation: X => Y", () => {
        
        it("should apply Y to each item of X and return the resulting tuple", async () => {
            expect(await evaluate("(1,2,3) => x -> 2*x")).to.be.tuple([2,4,6]);
            expect(await evaluate("(1,2,3) => 'abcdef'")).to.be.tuple(['b','c','d']);
        });
    });

    describe("sub-contexting: namespace.expression", () => {

        it("should evaluate 'Y' in the 'X' context if 'X' is a namespace", async () => {
            var ctx = context.$extend({x:10});
            await parse("ns = {y=20, z=30, _h=40}")(ctx);
            expect(await parse("ns.y")(ctx)).to.equal(20);
            expect(await parse("ns.[1,y,z]")(ctx)).to.deep.equal([1,20,30]);
            expect(await parse("ns.x")(ctx)).to.equal(10);
            expect(await parse("ns._h")(ctx)).to.equal(40);

            var ctx = context.$extend({ns:{x:10,y:20,z:30}});
            expect(await parse("ns.[x,y,z]")(ctx)).to.deep.equal([10,20,30]);
        });

        it("should see the global contexts", async () => {
            var ctx = context.$extend({x:10});
            await parse("ns = {y=20}")(ctx);
            expect(await parse("ns.x")(ctx)).to.equal(10);
            expect(await parse("ns.y")(ctx)).to.equal(20);
        });

        it("should see the function parameters in a function expressions", async () => {
            var ctx = context.$extend({x:10});
            await parse("ns = {x=10}, nsp = {x=20}")(ctx);
            await parse("f = nsp -> nsp.x")(ctx);
            expect(await parse("f ns")(ctx)).to.equal(10);
        });

        it("should return an error if 'X' is of any other type", async () => {
            expect(await error(() => evaluate("(10).name"))).to.equal("Namespace expected on the left side of the '.' operator");
            expect(await error(() => evaluate("[].name"))).to.equal("Namespace expected on the left side of the '.' operator");
            expect(await error(() => evaluate("(x->x).name"))).to.equal("Namespace expected on the left side of the '.' operator");
        });
        
        it("should return a tuple of items, one for each item of X if X is a tuple of namespaces", async () => {
            expect(await evaluate(`({a:1},{a:2},{a:3}).a`)).to.be.tuple([1,2,3]);
        });
    });

    describe("comments", () => {

        it("should ignore the text following the `#` character up to the end of the line or of the expression", async () => {
            var expression = `
                # this is a comment
                12.345 # this is another comment
                # this is the last comment`
            expect(await evaluate(expression)).to.equal(12.345);
        });

        it("should not parse `#` characters in a string as comments", async () => {
            expect(await evaluate("'this # is a string'")).to.equal("this # is a string");
            expect(await evaluate(`"this # is a string"`)).to.equal("this # is a string");
        });
    });
    
    
    // CONSTANTS
    
    describe("TRUE", () => {
        it("should map to true", async () => {
            expect(await evaluate('TRUE')).to.equal(true);
        });
    });

    describe("FALSE", () => {
        it("should map to true", async () => {
            expect(await evaluate('FALSE')).to.equal(false);
        });
    });
    
    
    // BUILT-IN FUNCTIONS
    
    describe("quit X", () => {
        
        it("should throw a failure with attached the passed tuple as 'args' property", async () => {
            try {
                await evaluate("quit('I quit!',1,2,3)");
                throw new Error("It did not throw.");
            } catch (error) {
                expect(error).to.be.instanceof(Failure);
                expect(error.args).to.be.tuple(['I quit!',1,2,3]);
            }
        });

        it("should set the error message to the first tuple item if it is a string", async () => {
            try {
                await evaluate("quit('I quit!',1,2,3)");
                throw new Error("It did not throw.");
            } catch (error) {
                expect(error).to.be.instanceof(Failure);
                expect(error.message).to.equal('I quit!');
            }
        });

        it("should set the error message to 'Undefined error!' if the first tuple item is not a string", async () => {
            try {
                await evaluate("quit(1,2,3)");
                throw new Error("It did not throw.");
            } catch (error) {
                expect(error).to.be.instanceof(Failure);
                expect(error.message).to.equal('Undefined error!');
            }
        });
    });
    
    describe("safeFunc = try(func, ...errorHandlers)", () => {
        
        it("should return a function", async () => {
            expect(await evaluate('try(x->x, y->y, z->z)')).to.be.a("function");
        })
        
        describe("Y = safeFunc(X)", () => {
            
            it("should return the result of applying the first function to X if it doesn't throw an error", async () => {
                expect(await evaluate('try(x->2*x, y->3*y, z->4*z)(10)')).to.equal(20);
            });
            
            it("should return the result of applying the first error handler that doesn,t fail to error.args", async () => {
                expect(await evaluate(`try(
                        x -> quit(":(", x), 
                        (msg,x) -> [x], 
                        (msg,x) -> 4*x)(10)`
                    )).to.deep.equal([10]);
                    
                expect(await evaluate(`try(
                        x -> quit(":(", x), 
                        (msg,x) -> quit(":((", x), 
                        (msg,x) -> [[x]])(10)`
                    )).to.deep.equal([[10]]);                
            });
            
            it("should throw the last error if all the error handlers fail", async () => {
                try {
                    var retval = await evaluate(`try(
                            x -> quit(":(", x), 
                            (msg,x) -> quit(":((", [x], {a:x}))(10)`
                        );
                    throw new Error("It did not throw!");
                } catch (error) {
                    expect(error).to.be.instanceof(Failure);
                    expect(error.message).to.equal(":((");
                    expect(error.args).to.be.tuple([":((", [10], {a:10}]);
                }
            });
        });
    });

    describe("bool X", () => {

        it("should return X if it is a boolean", async () => {
            expect(await evaluate("bool FALSE")).to.equal(false);
            expect(await evaluate("bool TRUE")).to.equal(true);
        });

        it("should return true if X is a non-zero number", async () => {
            expect(await evaluate("bool 0")).to.equal(false);
            expect(await evaluate("bool 10")).to.equal(true);
            expect(await evaluate("bool (-1)")).to.equal(true);
        });

        it("should return true if X is a non-empty string", async () => {
            expect(await evaluate("bool ''")).to.equal(false);
            expect(await evaluate("bool 'abc'")).to.equal(true);
        });

        it("should return true if X is a non-empty list", async () => {
            expect(await evaluate("bool []")).to.equal(false);
            expect(await evaluate("bool [1,2,3]")).to.equal(true);
        });

        it("should return true if X is a non-empty namespace", async () => {
            expect(await evaluate("bool {}")).to.equal(false);
            expect(await evaluate("bool {a=1,b=2,c=3}")).to.equal(true);
        });

        it("should return true if X is a function", async () => {
            expect(await evaluate("bool (x->x)")).to.equal(true);
            expect(await evaluate("bool jsFn", {jsFn:x=>2*x})).to.equal(true);
        });

        it("should return true if X is a tuple with at least one true item", async () => {
            expect(await evaluate("bool (0,0,0)")).to.equal(false);
            expect(await evaluate("bool (0,1,-1)")).to.equal(true);
        });

        it("should return false if X is an empty tuple", async () => {
            expect(await evaluate("bool ()")).to.equal(false);
        });
    });

    describe("not X", () => {

        it("should return !X if it is a boolean", async () => {
            expect(await evaluate("not FALSE")).to.equal(!false);
            expect(await evaluate("not TRUE")).to.equal(!true);
        });

        it("should return false if X is a non-zero number", async () => {
            expect(await evaluate("not 0")).to.equal(!false);
            expect(await evaluate("not 10")).to.equal(!true);
            expect(await evaluate("not (-1)")).to.equal(!true);
        });

        it("should return false if X is a non-empty string", async () => {
            expect(await evaluate("not ''")).to.equal(!false);
            expect(await evaluate("not 'abc'")).to.equal(!true);
        });

        it("should return false if X is a non-empty list", async () => {
            expect(await evaluate("not []")).to.equal(!false);
            expect(await evaluate("not [1,2,3]")).to.equal(!true);
        });

        it("should return false if X is a non-empty namespace", async () => {
            expect(await evaluate("not {}")).to.equal(!false);
            expect(await evaluate("not {a=1,b=2,c=3}")).to.equal(!true);
        });

        it("should return false if X is a function", async () => {
            expect(await evaluate("not (x->x)")).to.equal(!true);
            expect(await evaluate("not jsFn", {jsFn:x=>2*x})).to.equal(!true);
        });

        it("should return false if X is a tuple with at least one true item", async () => {
            expect(await evaluate("not (0,0,0)")).to.equal(!false);
            expect(await evaluate("not (0,1,-1)")).to.equal(!true);
        });

        it("should return true if X is an empty tuple", async () => {
            expect(await evaluate("not ()")).to.equal(!false);
        });
    });

    describe("str X", () => {

        it("should return an empty string if X is nothing", async () => {
            expect(await evaluate("str ()")).to.equal("");
        });

        it("should return 'TRUE' if X is true", async () => {
            expect(await evaluate("str TRUE")).to.equal("TRUE");
        });

        it("should return 'FALSE' if X is false", async () => {
            expect(await evaluate("str FALSE")).to.equal("FALSE");
        });

        it("should return String(X) if X is a number", async () => {
            expect(await evaluate("str 123.4")).to.equal("123.4");
        });

        it("should return X itself if it is a string", async () => {
            expect(await evaluate("str 'abc'")).to.equal("abc");
        });

        it("should return '[[Function]]' if X is a function", async () => {
            expect(await evaluate("str jsFn", {jsFn: x => 2*x})).to.equal("[[Function]]");
            expect(await evaluate("str (x->x)", {jsFn: x => 2*x})).to.equal("[[Function]]");
        });

        it("should return '[[List of n items]]' when X is a list with n items", async () => {
            expect(await evaluate("str[1,2,'abc']")).to.equal("[[List of 3 items]]")
        });

        it("should return '[[Namespace of n items]]' when n is the number of items", async () => {
            expect(await evaluate("str{a=1,b=2,c=3}")).to.equal("[[Namespace of 3 items]]");
            expect(await evaluate("str ns", {ns:{a:1,b:2,c:3,$d:4}})).to.equal("[[Namespace of 3 items]]");
        });

        it("should concatenate the serialized item if X is a tuple", async () => {
            expect(await evaluate("str('it is ',TRUE,' that 1+2 is ',3)")).to.equal("it is TRUE that 1+2 is 3");
        });
    });

    describe("enum X", () => {
        
        it("shoule return the tuple of the first X integers if X is a number", async () => {
            expect(await evaluate('enum 5')).to.be.tuple([0,1,2,3,4]);
            expect(await evaluate('enum 5.1')).to.be.tuple([0,1,2,3,4,5]);
            expect(await evaluate('enum (-3)')).to.be.tuple([0,-1,-2]);
            expect(await evaluate('enum (-3.1)')).to.be.tuple([0,-1,-2,-3]);
            expect(await evaluate("enum 1")).to.equal(0);
            expect(await evaluate("enum 0")).to.equal(null);
        });

        it("should return the tuple `(x1,x2,x3,...)` when X is the list `[x1,x2,x3,...]`", async () => {
            expect(await evaluate("enum [10,20,30]")).to.be.tuple([10,20,30]);
            expect(await evaluate("enum ls", {ls:[10,20,30]})).to.be.tuple([10,20,30]);
            expect(await evaluate("enum [1]")).to.equal(1);
            expect(await evaluate("enum []")).to.equal(null);
        });

        it("should return the tuple `('a','b','c')` when X is the string `'abc'`", async () => {
            expect(await evaluate("enum 'abc'")).to.be.tuple(['a','b','c']);
            expect(await evaluate("enum s", {s:"abc"})).to.be.tuple(['a','b','c']);
            expect(await evaluate("enum 'a'")).to.equal("a");
            expect(await evaluate("enum ''")).to.equal(null);
        });

        it("should return the tuple `('name1','name2',...)` when X is the namespace `{name1:val1, name2:val2, ...}`", async () => {
            expect(await evaluate("enum {a:1,b:2,c:3}")).to.be.tuple(['a','b','c']);
            expect(await evaluate("enum ns", {ns:{a:1,b:2,c:3,$d:4}})).to.be.tuple(['a','b','c']);
            expect(await evaluate("enum {a:1}")).to.equal("a");
            expect(await evaluate("enum {}")).to.equal(null);
        });
        
        it("should throw an error when X is of any other type", async () => {
            var message = type => `${type} is not enumerable.`;
            expect(await error(() => evaluate("enum TRUE"))).to.equal(message('Boolean'));
            expect(await error(() => evaluate("enum FALSE"))).to.equal(message('Boolean'));
            expect(await error(() => evaluate("enum fn", {fn:x=>x}))).to.equal(message('Function'));
        });

        it("should concatenate the enumeration of each item if X is a tuple", async () => {
            expect(await evaluate("enum ('abc',[1,2,3])")).to.be.tuple(['a','b','c',1,2,3]);
        });
    });

    describe("type x", () => {

        it("should return Nothing if `x` is an empty tuple", async () => {
            expect(await evaluate("type()")).to.equal(null);
        });

        it("should return 'Boolean' if `x` is a boolean value", async () => {
            expect(await evaluate("type TRUE")).to.equal("Boolean");
            expect(await evaluate("type FALSE")).to.equal("Boolean");
        });

        it("should return 'Number' if `x` is a number", async () => {
            expect(await evaluate("type 1")).to.equal("Number");
        });

        it("should return 'String' if `x` is a string", async () => {
            expect(await evaluate("type 'abc'")).to.equal("String");
        });

        it("should return 'List' if `x` is a list", async () => {
            expect(await evaluate("type [1,2,3]")).to.equal("List");
        });

        it("should return 'Namespace' if `x` is a namespace", async () => {
            expect(await evaluate("type {x:1}")).to.equal("Namespace");
        });

        it("should return 'Function' if `x` is a function", async () => {
            expect(await evaluate("type(()->())")).to.equal("Function");
        });

        it("should return a tuple of types if `x` is a tuple", async () => {
            expect(await evaluate("type(TRUE,1,'abc')")).to.be.tuple(['Boolean', 'Number', 'String']);
        });
    });

    describe("size X", () => {

        it("should return the length of X if X is a string", async () => {
            var size = await evaluate("size 'abc'");
            expect(size).to.equal(3);
        });

        it("should return the length of X if X is a list", async () => {
            var size = await evaluate("size [1,2,3]");
            expect(size).to.equal(3);
        });

        it("should return the number of own names if X is a namespace", async () => {
            var size = await evaluate("size {a=1,b=2,c=3}");
            expect(size).to.equal(3);

            var ctx = {o: Object.assign(Object.create({x:1,y:2,a:10}), {a:1,b:2,c:3,$d:4})};
            var size = await evaluate("size o", ctx);
            expect(size).to.equal(5);
        });
        
        it("should return a tuple containing the size of each item if X is a tuple", async () => {
            expect(await evaluate("size('abc', [1,2,3,4], {a:1})")).to.be.tuple([3,4,1]);
            expect(await evaluate("size()")).to.be.null;
        });

        it("should throw an error if X is of any other type", async () => {
            var message = type => `Size not defined for ${type} type.`;
            expect(await error(() => evaluate("size TRUE"))).to.equal(message('Boolean'));
            expect(await error(() => evaluate("size 1"))).to.equal(message("Number"));
            expect(await error(() => evaluate("size (x->2*x)"))).to.equal(message("Function"));
        });
    });


    // LOGIC OPERATORS

    describe("X | Y", () => {

        it("should return X if `bool X` is true", async () => {

            // true or true
            expect(await evaluate("TRUE | TRUE")).to.equal(true);
            expect(await evaluate("TRUE | 10")).to.equal(true);
            expect(await evaluate("10 | TTRUE")).to.equal(10);
            expect(await evaluate("10 | 10")).to.equal(10);

            // true or false
            expect(await evaluate("TRUE | FALSE")).to.equal(true);
            expect(await evaluate("TRUE | 0")).to.equal(true);
            expect(await evaluate("10 | FALSE")).to.equal(10);
            expect(await evaluate("10 | 0")).to.equal(10);
        })

        it("should return Y if `bool X` is false", async () => {

            // false or true
            expect(await evaluate("FALSE | TRUE")).to.equal(true);
            expect(await evaluate("FALSE | 10")).to.equal(10);
            expect(await evaluate("0 | TRUE")).to.equal(true);
            expect(await evaluate("0 | 10")).to.equal(10);

            // false or false
            expect(await evaluate("FALSE | FALSE")).to.equal(false);
            expect(await evaluate("FALSE | 0")).to.equal(0);
            expect(await evaluate("0 | FALSE")).to.equal(false);
            expect(await evaluate("0 | 0")).to.equal(0);
        })
    });

    describe("X & Y", () => {

        it("should return Y if `bool X` is true", async () => {

            // true or true
            expect(await evaluate("TRUE & TRUE")).to.equal(true);
            expect(await evaluate("TRUE & 10")).to.equal(10);
            expect(await evaluate("10 & TRUE")).to.equal(true);
            expect(await evaluate("10 & 10")).to.equal(10);

            // true or false
            expect(await evaluate("TRUE & FALSE")).to.equal(false);
            expect(await evaluate("TRUE & 0")).to.equal(0);
            expect(await evaluate("10 & FALSE")).to.equal(false);
            expect(await evaluate("10 & 0")).to.equal(0);
        })

        it("should return X if `bool X` is false", async () => {

            // false or true
            expect(await evaluate("FALSE & TRUE")).to.equal(false);
            expect(await evaluate("FALSE & 10")).to.equal(false);
            expect(await evaluate("0 & TRUE")).to.equal(0);
            expect(await evaluate("0 & 10")).to.equal(0);

            // false or false
            expect(await evaluate("FALSE & FALSE")).to.equal(false);
            expect(await evaluate("FALSE & 0")).to.equal(false);
            expect(await evaluate("0 & FALSE")).to.equal(0);
            expect(await evaluate("0 & 0")).to.equal(0);
        })
    });

    describe("X ? Y", () => {

        it("should return Y is `bool X` is true", async () => {
            expect(await evaluate("TRUE ? [1,2,3]")).to.deep.equal([1,2,3]);
            expect(await evaluate("10 ? [1,2,3]")).to.deep.equal([1,2,3]);
        });

        it("should return null if `bool X` is false", async () => {
            expect(await evaluate("FALSE ? [1,2,3]")).to.be.null;
            expect(await evaluate("0 ? [1,2,3]")).to.be.null;
        });
    });

    describe("X ; Y", () => {

        it("should return X if it is not `null`", async () => {
            expect(await evaluate("[1,2,3] ; [3,4,5]")).to.deep.equal([1,2,3]);
        });

        it("should return Y if X is `null`", async () => {
            expect(await evaluate("() ; [3,4,5]")).to.deep.equal([3,4,5]);
        });
    });


    // ARITHMETIC OPERATORS

    describe("X + Y", () => {

        it("should return Y if X is nothing", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("() + ()", presets)).to.equal(null);
            expect(await evaluate("() + T", presets)).to.equal(true);
            expect(await evaluate("() + F", presets)).to.equal(false);
            expect(await evaluate("() + 10", presets)).to.equal(10);
            expect(await evaluate("() + 'abc'", presets)).to.equal("abc");
            expect(await evaluate("() + fn", presets)).to.equal(presets.fn);
            expect(await evaluate("() + ls", presets)).to.deep.equal([1,2,3]);
            expect(await evaluate("() + ns", presets)).to.deep.equal({a:1,b:2,c:3});

            var tuple = await evaluate("() + (1,2,3)", presets);
            expect(tuple instanceof Tuple).to.be.true;
            expect(Array.from(tuple)).to.deep.equal([1,2,3]);
        });

        it("should return X if Y is nothing", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("() + ()", presets)).to.equal(null);
            expect(await evaluate("T + ()", presets)).to.equal(true);
            expect(await evaluate("F + ()", presets)).to.equal(false);
            expect(await evaluate("10 + ()", presets)).to.equal(10);
            expect(await evaluate("'abc' + ()", presets)).to.equal("abc");
            expect(await evaluate("fn + ()", presets)).to.equal(presets.fn);
            expect(await evaluate("ls + ()", presets)).to.deep.equal([1,2,3]);
            expect(await evaluate("ns + ()", presets)).to.deep.equal({a:1,b:2,c:3});

            var tuple = await evaluate("(1,2,3) + ()", presets);
            expect(tuple instanceof Tuple).to.be.true;
            expect(Array.from(tuple)).to.deep.equal([1,2,3]);
        });

        it("should return `X||Y` if both X and Y are booleans", async () => {
            var presets = {T:true, F:false};
            expect(await evaluate("T + T", presets)).to.be.true;
            expect(await evaluate("T + F", presets)).to.be.true;
            expect(await evaluate("F + T", presets)).to.be.true;
            expect(await evaluate("F + F", presets)).to.be.false;
        });

        it("should return `X+Y` if both X and Y are numbers", async () => {
            expect(await evaluate("10 + 1")).to.equal(11);
            expect(await evaluate("10 + 0")).to.equal(10);
            expect(await evaluate("10 + (-2)")).to.equal(8);
        });

        it("should concatenate X and Y if they are both strings", async () => {
            expect(await evaluate("'abc' + 'def'")).to.equal("abcdef");
            expect(await evaluate("'abc' + ''")).to.equal("abc");
            expect(await evaluate("'' + 'def'")).to.equal("def");
        });

        it("should concatenate X and Y if they are both lists", async () => {
            expect(await evaluate("[1,2,3] + [4,5,6]")).to.deep.equal([1,2,3,4,5,6]);
            expect(await evaluate("[1,2,3] + []")).to.deep.equal([1,2,3]);
            expect(await evaluate("[] + [4,5,6]")).to.deep.equal([4,5,6]);
        });

        it("should merge X and Y if they are both namespaces", async () => {
            expect(await evaluate("{a=1,b=2} + {b=20,c=30}")).to.deep.equal({a:1,b:20,c:30});
            expect(await evaluate("{a=1,b=2} + {}")).to.deep.equal({a:1,b:2});
            expect(await evaluate("{} + {b=20,c=30}")).to.deep.equal({b:20,c:30});
        });

        it("should throw an error for all the other singleton types", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x;
            for (let [L,R] of [
                    [T,n], [T,s], [T,ls], [T,ns], [T,fn],
                    [F,n], [F,s], [F,ls], [F,ns], [F,fn],
                    [n,T], [n,F], [n,s], [n,ls], [n,ns], [n,fn],
                    [s,T], [s,F], [s,n], [s,ls], [s,ns], [s,fn],
                    [ls,T], [ls,F], [ls,n], [ls,s], [ls,ns], [ls,fn],
                    [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn],
                    [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns] ]) {
                
                var LType = context.type(L);
                var RType = context.type(R);
                expect(await error(() => evaluate("L + R", {L,R}))).to.equal(`Sum operation not defined between ${LType} and ${RType}`);
            }
        });

        it("should return (x1+y1, x2+y2, ...) if X and/or Y is a tuple", async () => {
            var presets = {T:true, F:false};
            expect(Array.from(await evaluate("(T, 1, 'a', [1], {a=1}) + (F, 2, 'b', [2], {b=2})", presets))).to.deep.equal([true, 3, "ab", [1,2], {a:1,b:2}])
            expect(Array.from(await evaluate("(T, 1, 'a', [1], {a=1}) + (F, 2, 'b')", presets))).to.deep.equal([true, 3, "ab", [1], {a:1}])
            expect(Array.from(await evaluate("(T, 1, 'a') + (F, 2, 'b', [2], {b=2})", presets))).to.deep.equal([true, 3, "ab", [2], {b:2}])
            expect(Array.from(await evaluate("10 + (1, 2, 3)", presets))).to.deep.equal([11, 2, 3])
            expect(Array.from(await evaluate("(1, 2, 3) + 10", presets))).to.deep.equal([11, 2, 3])
        });
    });

    describe("X - Y", () => {

        it("should return X if Y is nothing", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("() - ()", presets)).to.equal(null);
            expect(await evaluate("T - ()", presets)).to.equal(true);
            expect(await evaluate("F - ()", presets)).to.equal(false);
            expect(await evaluate("10 - ()", presets)).to.equal(10);
            expect(await evaluate("'abc' - ()", presets)).to.equal("abc");
            expect(await evaluate("fn - ()", presets)).to.equal(presets.fn);
            expect(await evaluate("ls - ()", presets)).to.deep.equal(presets.ls);
            expect(await evaluate("ns - ()", presets)).to.deep.equal(presets.ns);
            expect(Array.from(await evaluate("(1,2,3) - ()", presets))).to.deep.equal([1,2,3]);
        });

        it("should throw an error if X is nothing", async () => {
            for (let R of [true, false, 10, 'abc', [1,2,3], {a:1}, x=>x]) {
                var RType = context.type(R);
                expect(await error(() => evaluate("() - R", {R}))).to.equal(`Subtraction operation not defined between NOTHING and ${RType}`)
            }
        });

        it("should return `X-Y` if both X and Y are numbers", async () => {
            var presets = {T:true, F:false};
            expect(await evaluate("10 - 1", presets)).to.equal(9);
            expect(await evaluate("20 - 0", presets)).to.equal(20);
            expect(await evaluate("10 - (-7)", presets)).to.equal(17);
        });

        it("should throw a runtime error for all the other singleton types", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x;
            for (let [L,R] of [
                    [T,n], [T,s], [T,ls], [T,ns], [T,fn],
                    [F,n], [F,s], [F,ls], [F,ns], [F,fn],
                    [n,T], [n,F], [n,s], [n,ls], [n,ns], [n,fn],
                    [s,T], [s,F], [s,n], [s,ls], [s,ns], [s,fn],
                    [ls,T], [ls,F], [ls,n], [ls,s], [ls,ns], [ls,fn],
                    [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn],
                    [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns] ]) {
                
                var LType = context.type(L);
                var RType = context.type(R);
                expect(await error(() => evaluate("L - R", {L,R}))).to.equal(`Subtraction operation not defined between ${LType} and ${RType}`);
            }            
        });

        it("should return (x1-y1, x2-y2, ...) if X and/or Y is a tuple", async () => {
            var presets = {};
            expect(Array.from(await evaluate("(10,20,30) - (1,2,3)", presets))).to.deep.equal([9,18,27]);
            expect(Array.from(await evaluate("(10,20,30) - (1,2)", presets))).to.deep.equal([9,18,30]);
            expect(Array.from(await evaluate("(10,20,30) - 1", presets))).to.deep.equal([9,20,30]);
        });
    });

    describe("X * Y", () => {

        it("should return () if either X or Y is nothing", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};

            expect(await evaluate("() * ()", presets)).to.equal(null);
            expect(await evaluate("() * T", presets)).to.equal(null);
            expect(await evaluate("() * F", presets)).to.equal(null);
            expect(await evaluate("() * 10", presets)).to.equal(null);
            expect(await evaluate("() * 'abc'", presets)).to.equal(null);
            expect(await evaluate("() * fn", presets)).to.equal(null);
            expect(await evaluate("() * ls", presets)).to.equal(null);
            expect(await evaluate("() * ns", presets)).to.equal(null);
            expect(await evaluate("() * (1,2,3)", presets)).to.equal(null);

            expect(await evaluate("() * ()", presets)).to.equal(null);
            expect(await evaluate("T * ()", presets)).to.equal(null);
            expect(await evaluate("F * ()", presets)).to.equal(null);
            expect(await evaluate("10 * ()", presets)).to.equal(null);
            expect(await evaluate("'abc' * ()", presets)).to.equal(null);
            expect(await evaluate("fn * ()", presets)).to.equal(null);
            expect(await evaluate("ls * ()", presets)).to.equal(null);
            expect(await evaluate("ns * ()", presets)).to.equal(null);
            expect(await evaluate("(1,2,3) * ()", presets)).to.equal(null);
        });

        it("should return `X&&Y` if both X and Y are booleans", async () => {
            var presets = {T:true, F:false};
            expect(await evaluate("T * T", presets)).to.equal(true);
            expect(await evaluate("T * F", presets)).to.equal(false);
            expect(await evaluate("F * T", presets)).to.equal(false);
            expect(await evaluate("F * F", presets)).to.equal(false);
        });

        it("should return `X*Y` if both X and Y are numbers", async () => {
            expect(await evaluate("10 * 2")).to.equal(20);
            expect(await evaluate("10 * 0")).to.equal(0);
            expect(await evaluate("10 * (-2)")).to.equal(-20);
        });

        it("should concatenate X times Y if X is a number and Y is a string", async () => {
            expect(await evaluate("3 * 'Abc'")).to.equal("AbcAbcAbc");
            expect(await evaluate("3.1 * 'Abc'")).to.equal("AbcAbcAbc");
            expect(await evaluate("3.9 * 'Abc'")).to.equal("AbcAbcAbc");
            expect(await evaluate("0 * 'Abc'")).to.equal("");
            expect(await evaluate("-2 * 'Abc'")).to.equal("");
        });

        it("should concatenate Y times X if Y is a number and X is a string", async () => {
            expect(await evaluate("'Abc' * 3")).to.equal("AbcAbcAbc");
            expect(await evaluate("'Abc' * 3.1")).to.equal("AbcAbcAbc");
            expect(await evaluate("'Abc' * 3.9")).to.equal("AbcAbcAbc");
            expect(await evaluate("'Abc' * 0")).to.equal("");
            expect(await evaluate("'Abc' * (-2)")).to.equal("");
        });

        it("should concatenate X times Y if X is a number and Y is a list", async () => {
            expect(await evaluate("3 * [1,2,3]")).to.deep.equal([1,2,3,1,2,3,1,2,3]);
            expect(await evaluate("3.1 * [1,2,3]")).to.deep.equal([1,2,3,1,2,3,1,2,3]);
            expect(await evaluate("3.9 * [1,2,3]")).to.deep.equal([1,2,3,1,2,3,1,2,3]);
            expect(await evaluate("0 * [1,2,3]")).to.deep.equal([]);
            expect(await evaluate("-2 * [1,2,3]")).to.deep.equal([]);
        });

        it("should concatenate Y times X if Y is a number and X is a list", async () => {
            expect(await evaluate("[1,2,3] * 3")).to.deep.equal([1,2,3,1,2,3,1,2,3]);
            expect(await evaluate("[1,2,3] * 3.1")).to.deep.equal([1,2,3,1,2,3,1,2,3]);
            expect(await evaluate("[1,2,3] * 3.9")).to.deep.equal([1,2,3,1,2,3,1,2,3]);
            expect(await evaluate("[1,2,3] * 0")).to.deep.equal([]);
            expect(await evaluate("[1,2,3] * (-2)")).to.deep.equal([]);
        });

        it("should throw error for all the other singleton types", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x;
            for (let [L,R] of [
                    [T,n], [T,s], [T,ls], [T,ns], [T,fn],
                    [F,n], [F,s], [F,ls], [F,ns], [F,fn],
                    [n,T], [n,F], [n,ns], [n,fn],
                    [s,T], [s,F], [s,ls], [s,ns], [s,fn],
                    [ls,T], [ls,F], [ls,s], [ls,ns], [ls,fn],
                    [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn],
                    [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns] ]) {
                
                var LType = context.type(L);
                var RType = context.type(R);
                expect(await error(() => evaluate("L * R", {L,R}))).to.equal(`Product operation not defined between ${LType} and ${RType}`);
            }                        
        });

        it("should return (x1*y1, x2*y2, ...) if X and/or Y is a tuple", async () => {
            var presets = {T:true, F:false};
            expect(Array.from(await evaluate("(T, 3, 'a', [1]) * (F, 2, 2, 2)",presets))).to.deep.equal([false, 6, "aa", [1,1]]);
            expect(Array.from(await evaluate("(10,20,30) * (2,3,4)",presets))).to.deep.equal([20,60,120]);
            expect(Array.from(await evaluate("(10,20,30) * (2,3)",presets))).to.deep.equal([20,60]);
            expect(Array.from(await evaluate("(10,20) * (2,3,4)",presets))).to.deep.equal([20,60]);
            expect(await evaluate("10 * (2,3,4)",presets)).to.equal(20);
            expect(await evaluate("(10,20,30) * 2",presets)).to.equal(20);
        });
    });

    describe("X / Y", () => {

        it("should return nothing if X is nothing", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("() / ()", presets)).to.equal(null);
            expect(await evaluate("() / T", presets)).to.equal(null);
            expect(await evaluate("() / F", presets)).to.equal(null);
            expect(await evaluate("() / 10", presets)).to.equal(null);
            expect(await evaluate("() / 'abc'", presets)).to.equal(null);
            expect(await evaluate("() / fn", presets)).to.equal(null);
            expect(await evaluate("() / ls", presets)).to.equal(null);
            expect(await evaluate("() / ns", presets)).to.equal(null);
        });
        
        it("should throw an error if Y is NOTHING", async () => {
            for (let L of [true, false, 10, 'abc', [1,2,3], {x:1}, x=>x]) {
                var LType = context.type(L);
                expect(await error(() => evaluate("L / ()", {L}))).to.equal(`Division operation not defined between ${LType} and NOTHING`);
            }
        });

        it("should return `X/Y` if both X and Y are numbers", async () => {
            expect(await evaluate("10 / 2")).to.equal(5);
            expect(await evaluate("20 / 0")).to.equal(Infinity);
            expect(await evaluate("10 / (-2)")).to.equal(-5);
        });

        it("should throw an error for all the other singleton types", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x;
            for (let [L,R] of [
                    [T,n], [T,s], [T,ls], [T,ns], [T,fn],
                    [F,n], [F,s], [F,ls], [F,ns], [F,fn],
                    [n,T], [n,F], [n,s], [n,ns], [n,fn],
                    [s,T], [s,F], [s,n], [s,ls], [s,ns], [s,fn],
                    [ls,T], [ls,F], [ls,n], [ls,s], [ls,ns], [ls,fn],
                    [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn],
                    [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns] ]) {
                
                var LType = context.type(L);
                var RType = context.type(R);
                expect(await error(() => evaluate("L / R", {L,R}))).to.equal(`Division operation not defined between ${LType} and ${RType}`);
            }                        
        });

        it("should return (x1/y1, x2/y2, ...) if X and/or Y is a tuple", async () => {
            expect(Array.from(await evaluate("(10,20,30) / (2,5,3)"))).to.deep.equal([5,4,10]);
            expect(Array.from(await evaluate("(10,20) / (2,5,3)"))).to.deep.equal([5,4]);
            expect(await evaluate("10 / (2,5,3)")).to.equal(5);
            expect(await evaluate("() / (2,4,3)")).to.equal(null);
            expect(await error(() => evaluate("(10,20,30) / (2,4)"))).to.equal(`Division operation not defined between Number and NOTHING`);
            expect(await error(() => evaluate("(10,20,30) / 2"))).to.equal(`Division operation not defined between Number and NOTHING`);
        });
    });

    describe("X % Y", () => {

        it("should return NOTHING if X is nothing", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("() % ()", presets)).to.equal(null);
            expect(await evaluate("() % T", presets)).to.equal(null);
            expect(await evaluate("() % F", presets)).to.equal(null);
            expect(await evaluate("() % 10", presets)).to.equal(null);
            expect(await evaluate("() % 'abc'", presets)).to.equal(null);
            expect(await evaluate("() % fn", presets)).to.equal(null);
            expect(await evaluate("() % ls", presets)).to.equal(null);
            expect(await evaluate("() % ns", presets)).to.equal(null);
        });

        it("should throw an error if Y is NOTHING", async () => {
            var ctx = context.$extend();
            for (let L of [true, false, 10, 'abc', [1,2,3], {x:1}, x=>x]) {
                var LType = context.type(L);
                expect(await error(() => evaluate("L % ()", {L}))).to.equal(`Modulo operation not defined between ${LType} and NOTHING`);
            }
        });

        it("should return `X/Y` if both X and Y are numbers", async () => {
            expect(await evaluate("10 % 4")).to.equal(2);
            expect(await evaluate("10 % (-4)")).to.equal(2);
        });

        it("should return an error for all the other singleton types", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x;
            for (let [L,R] of [
                    [T,n], [T,s], [T,ls], [T,ns], [T,fn],
                    [F,n], [F,s], [F,ls], [F,ns], [F,fn],
                    [n,T], [n,F], [n,s], [n,ns], [n,fn],
                    [s,T], [s,F], [s,n], [s,ls], [s,ns], [s,fn],
                    [ls,T], [ls,F], [ls,n], [ls,s], [ls,ns], [ls,fn],
                    [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn],
                    [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns] ]) {
                
                var LType = context.type(L);
                var RType = context.type(R);
                expect(await error(() => evaluate("L % R", {L,R}))).to.equal(`Modulo operation not defined between ${LType} and ${RType}`);
            }            
        });

        it("should return (x1/y1, x2/y2, ...) if X and/or Y is a tuple", async () => {
            expect(Array.from(await evaluate("(10,20,30) % (4,7,8)"))).to.deep.equal([2,6,6]);
            expect(Array.from(await evaluate("(10,20) % (4,7,8)"))).to.deep.equal([2,6]);
            expect(await evaluate("10 % (4,7,8)")).to.equal(2);
            expect(await evaluate("() % (4,7,8)")).to.equal(null);
        });
    });

    describe("X ^ Y", () => {

        it("should return nothing if X is nothing", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("() ^ ()", presets)).to.equal(null);
            expect(await evaluate("() ^ T", presets)).to.equal(null);
            expect(await evaluate("() ^ F", presets)).to.equal(null);
            expect(await evaluate("() ^ 10", presets)).to.equal(null);
            expect(await evaluate("() ^ 'abc'", presets)).to.equal(null);
            expect(await evaluate("() ^ fn", presets)).to.equal(null);
            expect(await evaluate("() ^ ls", presets)).to.equal(null);
            expect(await evaluate("() ^ ns", presets)).to.equal(null);
        });

        it("should throw an error if Y is NOTHING", async () => {
            for (let L of [true, false, 10, 'abc', [1,2,3], {x:1}, x=>x]) {
                var LType = context.type(L);
                expect(await error(() => evaluate("L ^ ()", {L}))).to.equal(`Exponentiation operation not defined between ${LType} and NOTHING`)
            }
        });

        it("should return `X**Y` if both X and Y are numbers", async () => {
            expect(await evaluate("10 ^ 2")).to.equal(100);
            expect(await evaluate("20 ^ 0")).to.equal(1);
            expect(await evaluate("10 ^ (-2)")).to.equal(0.01);
        });

        it("should throw an error for all the other singleton types", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x;
            for (let [L,R] of [
                    [T,n], [T,s], [T,ls], [T,ns], [T,fn],
                    [F,n], [F,s], [F,ls], [F,ns], [F,fn],
                    [n,T], [n,F], [n,s], [n,ns], [n,fn],
                    [s,T], [s,F], [s,n], [s,ls], [s,ns], [s,fn],
                    [ls,T], [ls,F], [ls,n], [ls,s], [ls,ns], [ls,fn],
                    [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn],
                    [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns] ]) {
                
                var LType = context.type(L);
                var RType = context.type(R);
                expect(await error(() => evaluate("L ^ R", {L,R}))).to.equal(`Exponentiation operation not defined between ${LType} and ${RType}`);
            }            
        });

        it("should return (x1^y1, x2^y2, ...) if X and/or Y is a tuple", async () => {
            expect(Array.from(await evaluate("(10,20,30) ^ (2,3,4)"))).to.deep.equal([10**2,20**3,30**4]);
            expect(Array.from(await evaluate("(10,20) ^ (2,3,4)"))).to.deep.equal([10**2,20**3]);
            expect(await evaluate("10 ^ (2,3,4)")).to.equal(10**2);
            expect(await evaluate("() ^ (2,3,4)")).to.equal(null);
        });
    });


    // COMPARISON OPERATORS

    describe("X == Y", () => {

        it("should return true if both X and Y are nothing", async () => {
            expect(await evaluate("() == ()")).to.equal(true);
        });

        it("should return true if X and Y are both true or both false", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("T == T", presets)).to.equal(true);
            expect(await evaluate("F == F", presets)).to.equal(true);
            expect(await evaluate("T == F", presets)).to.equal(false);
            expect(await evaluate("F == T", presets)).to.equal(false);
        });

        it("should return true if X and Y are the same number", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("3 == 3", presets)).to.equal(true);
            expect(await evaluate("0 == 0", presets)).to.equal(true);
            expect(await evaluate("-3 == -3", presets)).to.equal(true);
            expect(await evaluate("3 == 2", presets)).to.equal(false);
            expect(await evaluate("0 == -4", presets)).to.equal(false);
        });

        it("should return true if X and Y are the same string", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("'abc' == 'abc'", presets)).to.equal(true);
            expect(await evaluate("'' == ''", presets)).to.equal(true);
            expect(await evaluate("'abc' == 'def'", presets)).to.equal(false);
            expect(await evaluate("'abc' == ''", presets)).to.equal(false);
        });

        it("should return true if X and Y are both lists with equal items", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("[1,2,3] == [1,2,3]", presets)).to.equal(true);
            expect(await evaluate("[] == []", presets)).to.equal(true);
            expect(await evaluate("[1,2,3] == [4,5,6]", presets)).to.equal(false);
            expect(await evaluate("[1,2,3] == []", presets)).to.equal(false);
        });

        it("should return true if X and Y are both namespace with sname name:value pairs", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("{a=1,b=2} == {a=1,b=2}", presets)).to.equal(true);
            expect(await evaluate("{} == {}", presets)).to.equal(true);
            expect(await evaluate("{a=1,b=2} == {a=1,c=2}", presets)).to.equal(false);
            expect(await evaluate("{a=1,b=2} == {a=1,b=3}", presets)).to.equal(false);
            expect(await evaluate("{a=1,b=2} == {a=1}", presets)).to.equal(false);
            expect(await evaluate("{a=1,b=2} == {}", presets)).to.equal(false);
            expect(await evaluate("{a=1} == {a=1,b=2}", presets)).to.equal(false);
            expect(await evaluate("{} == {a=1,b=2}", presets)).to.equal(false);
            
            const ns1 = {x:10};
            presets.ns2 = Object.assign(Object.create(ns1), {y:20});
            expect(await evaluate("ns2 == {x:10,y:20}", presets)).to.equal(true);
        });

        it("should return true if X and Y are the same function", async () => {
            var presets = {fn1:x=>2*x, fn2:x=>2*x};
            expect(await evaluate("fn1 == fn1", presets)).to.equal(true);
            expect(await evaluate("fn1 == fn2", presets)).to.equal(false);
            expect(await evaluate("(x->2*x) == (x->2*x)", presets)).to.equal(false);
            expect(await evaluate("(x->2*x) == fn1", presets)).to.equal(false);
            expect(await evaluate("fn1 == (x->2*x)", presets)).to.equal(false);
        });

        it("should return false if X and Y are of different types", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};

            expect(await evaluate("() == T", presets)).to.equal(false);
            expect(await evaluate("() == F", presets)).to.equal(false);
            expect(await evaluate("() == 1", presets)).to.equal(false);
            expect(await evaluate("() == 'abc'", presets)).to.equal(false);
            expect(await evaluate("() == ls", presets)).to.equal(false);
            expect(await evaluate("() == ns", presets)).to.equal(false);
            expect(await evaluate("() == fn", presets)).to.equal(false);

            expect(await evaluate("T == ()", presets)).to.equal(false);
            expect(await evaluate("T == 1", presets)).to.equal(false);
            expect(await evaluate("T == 'abc'", presets)).to.equal(false);
            expect(await evaluate("T == ls", presets)).to.equal(false);
            expect(await evaluate("T == ns", presets)).to.equal(false);
            expect(await evaluate("T == fn", presets)).to.equal(false);

            expect(await evaluate("F == ()", presets)).to.equal(false);
            expect(await evaluate("F == 1", presets)).to.equal(false);
            expect(await evaluate("F == 'abc'", presets)).to.equal(false);
            expect(await evaluate("F == ls", presets)).to.equal(false);
            expect(await evaluate("F == ns", presets)).to.equal(false);
            expect(await evaluate("F == fn", presets)).to.equal(false);

            expect(await evaluate("1 == ()", presets)).to.equal(false);
            expect(await evaluate("1 == T", presets)).to.equal(false);
            expect(await evaluate("1 == F", presets)).to.equal(false);
            expect(await evaluate("1 == 'abc'", presets)).to.equal(false);
            expect(await evaluate("1 == ls", presets)).to.equal(false);
            expect(await evaluate("1 == ns", presets)).to.equal(false);
            expect(await evaluate("1 == fn", presets)).to.equal(false);

            expect(await evaluate("'abc' == ()", presets)).to.equal(false);
            expect(await evaluate("'abc' == T", presets)).to.equal(false);
            expect(await evaluate("'abc' == F", presets)).to.equal(false);
            expect(await evaluate("'abc' == 1", presets)).to.equal(false);
            expect(await evaluate("'abc' == ls", presets)).to.equal(false);
            expect(await evaluate("'abc' == ns", presets)).to.equal(false);
            expect(await evaluate("'abc' == fn", presets)).to.equal(false);

            expect(await evaluate("ls == ()", presets)).to.equal(false);
            expect(await evaluate("ls == T", presets)).to.equal(false);
            expect(await evaluate("ls == F", presets)).to.equal(false);
            expect(await evaluate("ls == 1", presets)).to.equal(false);
            expect(await evaluate("ls == 'abc'", presets)).to.equal(false);
            expect(await evaluate("ls == ns", presets)).to.equal(false);
            expect(await evaluate("ls == fn", presets)).to.equal(false);

            expect(await evaluate("ns == ()", presets)).to.equal(false);
            expect(await evaluate("ns == T", presets)).to.equal(false);
            expect(await evaluate("ns == F", presets)).to.equal(false);
            expect(await evaluate("ns == 1", presets)).to.equal(false);
            expect(await evaluate("ns == 'abc'", presets)).to.equal(false);
            expect(await evaluate("ns == ls", presets)).to.equal(false);
            expect(await evaluate("ns == fn", presets)).to.equal(false);

            expect(await evaluate("fn == ()", presets)).to.equal(false);
            expect(await evaluate("fn == T", presets)).to.equal(false);
            expect(await evaluate("fn == F", presets)).to.equal(false);
            expect(await evaluate("fn == 1", presets)).to.equal(false);
            expect(await evaluate("fn == 'abc'", presets)).to.equal(false);
            expect(await evaluate("fn == ls", presets)).to.equal(false);
            expect(await evaluate("fn == ns", presets)).to.equal(false);
        });

        it("should compare tuples with lexicographical criteria", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("(1,2,3) == (1,2,3)", presets)).to.equal(true);
            expect(await evaluate("(1,2,3) == (1,2)", presets)).to.equal(false);
            expect(await evaluate("(1,2) == (1,2,3)", presets)).to.equal(false);
            expect(await evaluate("1 == (1,2,3)", presets)).to.equal(false);
            expect(await evaluate("(1,2,3) == 1", presets)).to.equal(false);
        });
    });

    describe("X != Y", () => {

        it("should return false if both X and Y are nothing", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("() != ()", presets)).to.equal(false);
        });

        it("should return false if X and Y are both false or both true", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("T != T", presets)).to.equal(false);
            expect(await evaluate("F != F", presets)).to.equal(false);
            expect(await evaluate("T != F", presets)).to.equal(true);
            expect(await evaluate("F != T", presets)).to.equal(true);
        });

        it("should return false if X and Y are the same number", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("3 != 3", presets)).to.equal(false);
            expect(await evaluate("0 != 0", presets)).to.equal(false);
            expect(await evaluate("-3 != -3", presets)).to.equal(false);
            expect(await evaluate("3 != 2", presets)).to.equal(true);
            expect(await evaluate("0 != -4", presets)).to.equal(true);
        });

        it("should return false if X and Y are the same string", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("'abc' != 'abc'", presets)).to.equal(false);
            expect(await evaluate("'' != ''", presets)).to.equal(false);
            expect(await evaluate("'abc' != 'def'", presets)).to.equal(true);
            expect(await evaluate("'abc' != ''", presets)).to.equal(true);
        });

        it("should return false if X and Y are both lists with equal items", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("[1,2,3] != [1,2,3]", presets)).to.equal(false);
            expect(await evaluate("[] != []", presets)).to.equal(false);
            expect(await evaluate("[1,2,3] != [4,5,6]", presets)).to.equal(true);
            expect(await evaluate("[1,2,3] != []", presets)).to.equal(true);
        });

        it("should return false if X and Y are both namespace with sname name:value pairs", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("{a=1,b=2} != {a=1,b=2}", presets)).to.equal(false);
            expect(await evaluate("{} != {}", presets)).to.equal(false);
            expect(await evaluate("{a=1,b=2} != {a=1,c=2}", presets)).to.equal(true);
            expect(await evaluate("{a=1,b=2} != {a=1,b=3}", presets)).to.equal(true);
            expect(await evaluate("{a=1,b=2} != {a=1}", presets)).to.equal(true);
            expect(await evaluate("{a=1,b=2} != {}", presets)).to.equal(true);
            expect(await evaluate("{a=1} != {a=1,b=2}", presets)).to.equal(true);
            expect(await evaluate("{} != {a=1,b=2}", presets)).to.equal(true);
        });

        it("should return false if X and Y are the same function", async () => {
            var presets = {fn1:x=>2*x, fn2:x=>2*x};
            expect(await evaluate("fn1 != fn1", presets)).to.equal(false);
            expect(await evaluate("fn1 != fn2", presets)).to.equal(true);
            expect(await evaluate("(x->2*x) != (x->2*x)", presets)).to.equal(true);
            expect(await evaluate("(x->2*x) != fn1", presets)).to.equal(true);
            expect(await evaluate("fn1 != (x->2*x)", presets)).to.equal(true);
        });

        it("should return true if X and Y are of different types", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};

            expect(await evaluate("() != T", presets)).to.equal(true);
            expect(await evaluate("() != F", presets)).to.equal(true);
            expect(await evaluate("() != 1", presets)).to.equal(true);
            expect(await evaluate("() != 'abc'", presets)).to.equal(true);
            expect(await evaluate("() != ls", presets)).to.equal(true);
            expect(await evaluate("() != ns", presets)).to.equal(true);
            expect(await evaluate("() != fn", presets)).to.equal(true);

            expect(await evaluate("T != ()", presets)).to.equal(true);
            expect(await evaluate("T != 1", presets)).to.equal(true);
            expect(await evaluate("T != 'abc'", presets)).to.equal(true);
            expect(await evaluate("T != ls", presets)).to.equal(true);
            expect(await evaluate("T != ns", presets)).to.equal(true);
            expect(await evaluate("T != fn", presets)).to.equal(true);

            expect(await evaluate("F != ()", presets)).to.equal(true);
            expect(await evaluate("F != 1", presets)).to.equal(true);
            expect(await evaluate("F != 'abc'", presets)).to.equal(true);
            expect(await evaluate("F != ls", presets)).to.equal(true);
            expect(await evaluate("F != ns", presets)).to.equal(true);
            expect(await evaluate("F != fn", presets)).to.equal(true);

            expect(await evaluate("1 != ()", presets)).to.equal(true);
            expect(await evaluate("1 != T", presets)).to.equal(true);
            expect(await evaluate("1 != F", presets)).to.equal(true);
            expect(await evaluate("1 != 'abc'", presets)).to.equal(true);
            expect(await evaluate("1 != ls", presets)).to.equal(true);
            expect(await evaluate("1 != ns", presets)).to.equal(true);
            expect(await evaluate("1 != fn", presets)).to.equal(true);

            expect(await evaluate("'abc' != ()", presets)).to.equal(true);
            expect(await evaluate("'abc' != T", presets)).to.equal(true);
            expect(await evaluate("'abc' != F", presets)).to.equal(true);
            expect(await evaluate("'abc' != 1", presets)).to.equal(true);
            expect(await evaluate("'abc' != ls", presets)).to.equal(true);
            expect(await evaluate("'abc' != ns", presets)).to.equal(true);
            expect(await evaluate("'abc' != fn", presets)).to.equal(true);

            expect(await evaluate("ls != ()", presets)).to.equal(true);
            expect(await evaluate("ls != T", presets)).to.equal(true);
            expect(await evaluate("ls != F", presets)).to.equal(true);
            expect(await evaluate("ls != 1", presets)).to.equal(true);
            expect(await evaluate("ls != 'abc'", presets)).to.equal(true);
            expect(await evaluate("ls != ns", presets)).to.equal(true);
            expect(await evaluate("ls != fn", presets)).to.equal(true);

            expect(await evaluate("ns != ()", presets)).to.equal(true);
            expect(await evaluate("ns != T", presets)).to.equal(true);
            expect(await evaluate("ns != F", presets)).to.equal(true);
            expect(await evaluate("ns != 1", presets)).to.equal(true);
            expect(await evaluate("ns != 'abc'", presets)).to.equal(true);
            expect(await evaluate("ns != ls", presets)).to.equal(true);
            expect(await evaluate("ns != fn", presets)).to.equal(true);

            expect(await evaluate("fn != ()", presets)).to.equal(true);
            expect(await evaluate("fn != T", presets)).to.equal(true);
            expect(await evaluate("fn != F", presets)).to.equal(true);
            expect(await evaluate("fn != 1", presets)).to.equal(true);
            expect(await evaluate("fn != 'abc'", presets)).to.equal(true);
            expect(await evaluate("fn != ls", presets)).to.equal(true);
            expect(await evaluate("fn != ns", presets)).to.equal(true);
        });

        it("should compare tuples with lexicographical criteria", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("(1,2,3) != (1,2,3)", presets)).to.equal(false);
            expect(await evaluate("(1,2,3) != (1,2)", presets)).to.equal(true);
            expect(await evaluate("(1,2) != (1,2,3)", presets)).to.equal(true);
            expect(await evaluate("1 != (1,2,3)", presets)).to.equal(true);
            expect(await evaluate("(1,2,3) != 1", presets)).to.equal(true);
        });
    });

    describe("X < Y", () => {

        it("should return false if both X and Y are nothing", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("() < ()", presets)).to.equal(false);
        });

        it("should return true if X is false and Y is true", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("T < T", presets)).to.equal(false);
            expect(await evaluate("F < F", presets)).to.equal(false);
            expect(await evaluate("T < F", presets)).to.equal(false);
            expect(await evaluate("F < T", presets)).to.equal(true);
        });

        it("should return true if X is a lower number than Y", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("1 < 2", presets)).to.equal(true);
            expect(await evaluate("0 < 2", presets)).to.equal(true);
            expect(await evaluate("-1 < 2", presets)).to.equal(true);
            expect(await evaluate("2 < 1", presets)).to.equal(false);
            expect(await evaluate("2 < 0", presets)).to.equal(false);
            expect(await evaluate("2 < (-2)", presets)).to.equal(false);
            expect(await evaluate("2 < 2", presets)).to.equal(false);
        });

        it("should return true if X and Y are both strings and X precedes Y alphabetically", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("'abc' < 'def'", presets)).to.equal(true);
            expect(await evaluate("'abc' < 'abd'", presets)).to.equal(true);
            expect(await evaluate("'ab' < 'abc'", presets)).to.equal(true);
            expect(await evaluate("'' < 'abc'", presets)).to.equal(true);
            expect(await evaluate("'abc' < 'abc'", presets)).to.equal(false);
            expect(await evaluate("'abd' < 'abc'", presets)).to.equal(false);
            expect(await evaluate("'abc' < 'ab'", presets)).to.equal(false);
            expect(await evaluate("'abc' < ''", presets)).to.equal(false);
        });

        it("should return true if X and Y are both lists and X precedes Y lexicographically", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("[1,2,3] < [4,5,6]", presets)).to.equal(true);
            expect(await evaluate("[1,2,3] < [1,2,4]", presets)).to.equal(true);
            expect(await evaluate("[1,2] < [1,2,4]", presets)).to.equal(true);
            expect(await evaluate("[] < [1,2,3]", presets)).to.equal(true);
            expect(await evaluate("[1,2,3] < [1,2,3]", presets)).to.equal(false);
            expect(await evaluate("[1,2,4] < [1,2,3]", presets)).to.equal(false);
            expect(await evaluate("[1,2,4] < [1,2]", presets)).to.equal(false);
            expect(await evaluate("[1,2,3] < []", presets)).to.equal(false);
        });

        it("should return true if X is nothing and Y is not", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("() < ()", presets)).to.equal(false);
            expect(await evaluate("() < T", presets)).to.equal(true);
            expect(await evaluate("() < F", presets)).to.equal(true);
            expect(await evaluate("() < 1", presets)).to.equal(true);
            expect(await evaluate("() < 'abc'", presets)).to.equal(true);
            expect(await evaluate("() < ls", presets)).to.equal(true);
            expect(await evaluate("() < ns", presets)).to.equal(true);
            expect(await evaluate("() < fn", presets)).to.equal(true);
        });

        it("should return false if Y is nothing and X is not", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("() < ()", presets)).to.equal(false);
            expect(await evaluate("T < ()", presets)).to.equal(false);
            expect(await evaluate("F < ()", presets)).to.equal(false);
            expect(await evaluate("1 < ()", presets)).to.equal(false);
            expect(await evaluate("'abc' < ()", presets)).to.equal(false);
            expect(await evaluate("ls < ()", presets)).to.equal(false);
            expect(await evaluate("ns < ()", presets)).to.equal(false);
            expect(await evaluate("fn < ()", presets)).to.equal(false);
        });

        it("should thow an error for any other type combination", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x;
            for (let [L,R] of [
                    [T,n], [T,s], [T,ls], [T,ns], [T,fn],
                    [F,n], [F,s], [F,ls], [F,ns], [F,fn],
                    [n,T], [n,F], [n,s], [n,ns], [n,fn],
                    [s,T], [s,F], [s,n], [s,ls], [s,ns], [s,fn],
                    [ls,T], [ls,F], [ls,n], [ls,s], [ls,ns], [ls,fn],
                    [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn],
                    [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns] ]) {
                
                var LType = context.type(L);
                var RType = context.type(R);
                expect(await error(() => evaluate("L < R", {L,R}))).to.equal(`Comparison operation not defined between ${LType} and ${RType}`);
            }                        
        });

        it("should compare tuples with lexicographical criteria", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("(1,2,3) < (4,5,6)", presets)).to.equal(true);
            expect(await evaluate("(1,2,3) < (1,2,4)", presets)).to.equal(true);
            expect(await evaluate("(1,2) < (1,2,4)", presets)).to.equal(true);
            expect(await evaluate("() < (1,2,3)", presets)).to.equal(true);
            expect(await evaluate("(1,2,3) < (1,2,3)", presets)).to.equal(false);
            expect(await evaluate("(1,2,4) < (1,2,3)", presets)).to.equal(false);
            expect(await evaluate("(1,2,4) < (1,2)", presets)).to.equal(false);
            expect(await evaluate("(1,2,3) < ()", presets)).to.equal(false);
        });
    });

    describe("X >= Y", () => {

        it("should return true if both X and Y are nothing", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("() >= ()", presets)).to.equal(true);
        });

        it("should return false if X is false and Y is true", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("T >= T", presets)).to.equal(true);
            expect(await evaluate("F >= F", presets)).to.equal(true);
            expect(await evaluate("T >= F", presets)).to.equal(true);
            expect(await evaluate("F >= T", presets)).to.equal(false);
        });

        it("should return false if X is a lower number than Y", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("1 >= 2", presets)).to.equal(false);
            expect(await evaluate("0 >= 2", presets)).to.equal(false);
            expect(await evaluate("-1 >= 2", presets)).to.equal(false);
            expect(await evaluate("2 >= 1", presets)).to.equal(true);
            expect(await evaluate("2 >= 0", presets)).to.equal(true);
            expect(await evaluate("2 >= (-2)", presets)).to.equal(true);
            expect(await evaluate("2 >= 2", presets)).to.equal(true);
        });

        it("should return false if X and Y are both strings and X precedes Y alphabetically", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("'abc' >= 'def'", presets)).to.equal(false);
            expect(await evaluate("'abc' >= 'abd'", presets)).to.equal(false);
            expect(await evaluate("'ab' >= 'abc'", presets)).to.equal(false);
            expect(await evaluate("'' >= 'abc'", presets)).to.equal(false);
            expect(await evaluate("'abc' >= 'abc'", presets)).to.equal(true);
            expect(await evaluate("'abd' >= 'abc'", presets)).to.equal(true);
            expect(await evaluate("'abc' >= 'ab'", presets)).to.equal(true);
            expect(await evaluate("'abc' >= ''", presets)).to.equal(true);
        });

        it("should return false if X and Y are both lists and X precedes Y lexicographically", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("[1,2,3] >= [4,5,6]", presets)).to.equal(false);
            expect(await evaluate("[1,2,3] >= [1,2,4]", presets)).to.equal(false);
            expect(await evaluate("[1,2] >= [1,2,4]", presets)).to.equal(false);
            expect(await evaluate("[] >= [1,2,3]", presets)).to.equal(false);
            expect(await evaluate("[1,2,3] >= [1,2,3]", presets)).to.equal(true);
            expect(await evaluate("[1,2,4] >= [1,2,3]", presets)).to.equal(true);
            expect(await evaluate("[1,2,4] >= [1,2]", presets)).to.equal(true);
            expect(await evaluate("[1,2,3] >= []", presets)).to.equal(true);
        });

        it("should return false if X is nothing and Y is not", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("() >= ()", presets)).to.equal(true);
            expect(await evaluate("() >= T", presets)).to.equal(false);
            expect(await evaluate("() >= F", presets)).to.equal(false);
            expect(await evaluate("() >= 1", presets)).to.equal(false);
            expect(await evaluate("() >= 'abc'", presets)).to.equal(false);
            expect(await evaluate("() >= ls", presets)).to.equal(false);
            expect(await evaluate("() >= ns", presets)).to.equal(false);
            expect(await evaluate("() >= fn", presets)).to.equal(false);
        });

        it("should return true if Y is nothing", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("() >= ()", presets)).to.equal(true);
            expect(await evaluate("T >= ()", presets)).to.equal(true);
            expect(await evaluate("F >= ()", presets)).to.equal(true);
            expect(await evaluate("1 >= ()", presets)).to.equal(true);
            expect(await evaluate("'abc' >= ()", presets)).to.equal(true);
            expect(await evaluate("ls >= ()", presets)).to.equal(true);
            expect(await evaluate("ns >= ()", presets)).to.equal(true);
            expect(await evaluate("fn >= ()", presets)).to.equal(true);
        });

        it("should throw an error for any other type combination", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x;
            for (let [L,R] of [
                    [T,n], [T,s], [T,ls], [T,ns], [T,fn],
                    [F,n], [F,s], [F,ls], [F,ns], [F,fn],
                    [n,T], [n,F], [n,s], [n,ns], [n,fn],
                    [s,T], [s,F], [s,n], [s,ls], [s,ns], [s,fn],
                    [ls,T], [ls,F], [ls,n], [ls,s], [ls,ns], [ls,fn],
                    [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn],
                    [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns] ]) {
                
                var LType = context.type(L);
                var RType = context.type(R);
                expect(await error(() => evaluate("L >= R", {L,R}))).to.equal(`Comparison operation not defined between ${LType} and ${RType}`);
            }                        
        });

        it("should compare tuples with lexicographical criteria", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("(1,2,3) >= (4,5,6)", presets)).to.equal(false);
            expect(await evaluate("(1,2,3) >= (1,2,4)", presets)).to.equal(false);
            expect(await evaluate("(1,2) >= (1,2,4)", presets)).to.equal(false);
            expect(await evaluate("() >= (1,2,3)", presets)).to.equal(false);
            expect(await evaluate("(1,2,3) >= (1,2,3)", presets)).to.equal(true);
            expect(await evaluate("(1,2,4) >= (1,2,3)", presets)).to.equal(true);
            expect(await evaluate("(1,2,4) >= (1,2)", presets)).to.equal(true);
            expect(await evaluate("(1,2,3) >= ()", presets)).to.equal(true);
        });
    });

    describe("X > Y", () => {

        it("should return false if both X and Y are nothing", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("() > ()", presets)).to.equal(false);
        });

        it("should return true if X is true and Y is false", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("T > T", presets)).to.equal(false);
            expect(await evaluate("F > F", presets)).to.equal(false);
            expect(await evaluate("T > F", presets)).to.equal(true);
            expect(await evaluate("F > T", presets)).to.equal(false);
        });

        it("should return true if X is a higher number than Y", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("1 > 2", presets)).to.equal(false);
            expect(await evaluate("0 > 2", presets)).to.equal(false);
            expect(await evaluate("-1 > 2", presets)).to.equal(false);
            expect(await evaluate("2 > 1", presets)).to.equal(true);
            expect(await evaluate("2 > 0", presets)).to.equal(true);
            expect(await evaluate("2 > (-2)", presets)).to.equal(true);
            expect(await evaluate("2 > 2", presets)).to.equal(false);
        });

        it("should return true if X and Y are both strings and X follows Y alphabetically", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("'abc' > 'def'", presets)).to.equal(false);
            expect(await evaluate("'abc' > 'abd'", presets)).to.equal(false);
            expect(await evaluate("'ab' > 'abc'", presets)).to.equal(false);
            expect(await evaluate("'' > 'abc'", presets)).to.equal(false);
            expect(await evaluate("'abc' > 'abc'", presets)).to.equal(false);
            expect(await evaluate("'abd' > 'abc'", presets)).to.equal(true);
            expect(await evaluate("'abc' > 'ab'", presets)).to.equal(true);
            expect(await evaluate("'abc' > ''", presets)).to.equal(true);
        });

        it("should return true if X and Y are both lists and X follows Y lexicographically", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("[1,2,3] > [4,5,6]", presets)).to.equal(false);
            expect(await evaluate("[1,2,3] > [1,2,4]", presets)).to.equal(false);
            expect(await evaluate("[1,2] > [1,2,4]", presets)).to.equal(false);
            expect(await evaluate("[] > [1,2,3]", presets)).to.equal(false);
            expect(await evaluate("[1,2,3] > [1,2,3]", presets)).to.equal(false);
            expect(await evaluate("[1,2,4] > [1,2,3]", presets)).to.equal(true);
            expect(await evaluate("[1,2,4] > [1,2]", presets)).to.equal(true);
            expect(await evaluate("[1,2,3] > []", presets)).to.equal(true);
        });

        it("should return false if X is nothing", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("() > ()", presets)).to.equal(false);
            expect(await evaluate("() > T", presets)).to.equal(false);
            expect(await evaluate("() > F", presets)).to.equal(false);
            expect(await evaluate("() > 1", presets)).to.equal(false);
            expect(await evaluate("() > 'abc'", presets)).to.equal(false);
            expect(await evaluate("() > ls", presets)).to.equal(false);
            expect(await evaluate("() > ns", presets)).to.equal(false);
            expect(await evaluate("() > fn", presets)).to.equal(false);
        });

        it("should return true if Y is nothing and X is not", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("() > ()", presets)).to.equal(false);
            expect(await evaluate("T > ()", presets)).to.equal(true);
            expect(await evaluate("F > ()", presets)).to.equal(true);
            expect(await evaluate("1 > ()", presets)).to.equal(true);
            expect(await evaluate("'abc' > ()", presets)).to.equal(true);
            expect(await evaluate("ls > ()", presets)).to.equal(true);
            expect(await evaluate("ns > ()", presets)).to.equal(true);
            expect(await evaluate("fn > ()", presets)).to.equal(true);
        });

        it("should throw an error for any other type combination", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x;
            for (let [L,R] of [
                    [T,n], [T,s], [T,ls], [T,ns], [T,fn],
                    [F,n], [F,s], [F,ls], [F,ns], [F,fn],
                    [n,T], [n,F], [n,s], [n,ns], [n,fn],
                    [s,T], [s,F], [s,n], [s,ls], [s,ns], [s,fn],
                    [ls,T], [ls,F], [ls,n], [ls,s], [ls,ns], [ls,fn],
                    [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn],
                    [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns] ]) {
                
                var LType = context.type(L);
                var RType = context.type(R);
                expect(await error(() => evaluate("L > R", {L,R}))).to.equal(`Comparison operation not defined between ${LType} and ${RType}`);
            }                        
        });

        it("should compare tuples with lexicographical criteria", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("(1,2,3) > (4,5,6)", presets)).to.equal(false);
            expect(await evaluate("(1,2,3) > (1,2,4)", presets)).to.equal(false);
            expect(await evaluate("(1,2) > (1,2,4)", presets)).to.equal(false);
            expect(await evaluate("() > (1,2,3)", presets)).to.equal(false);
            expect(await evaluate("(1,2,3) > (1,2,3)", presets)).to.equal(false);
            expect(await evaluate("(1,2,4) > (1,2,3)", presets)).to.equal(true);
            expect(await evaluate("(1,2,4) > (1,2)", presets)).to.equal(true);
            expect(await evaluate("(1,2,3) > ()", presets)).to.equal(true);
        });
    });

    describe("X <= Y", () => {

        it("should return true if both X and Y are nothing", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("() <= ()", presets)).to.equal(true);
        });

        it("should return false if X is true and Y is false", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("T <= T", presets)).to.equal(true);
            expect(await evaluate("F <= F", presets)).to.equal(true);
            expect(await evaluate("T <= F", presets)).to.equal(false);
            expect(await evaluate("F <= T", presets)).to.equal(true);
        });

        it("should return false if X is a higher number than Y", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("1 <= 2", presets)).to.equal(true);
            expect(await evaluate("0 <= 2", presets)).to.equal(true);
            expect(await evaluate("-1 <= 2", presets)).to.equal(true);
            expect(await evaluate("2 <= 1", presets)).to.equal(false);
            expect(await evaluate("2 <= 0", presets)).to.equal(false);
            expect(await evaluate("2 <= (-2)", presets)).to.equal(false);
            expect(await evaluate("2 <= 2", presets)).to.equal(true);
        });

        it("should return false if X and Y are both strings and X follows Y alphabetically", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("'abc' <= 'def'", presets)).to.equal(true);
            expect(await evaluate("'abc' <= 'abd'", presets)).to.equal(true);
            expect(await evaluate("'ab' <= 'abc'", presets)).to.equal(true);
            expect(await evaluate("'' <= 'abc'", presets)).to.equal(true);
            expect(await evaluate("'abc' <= 'abc'", presets)).to.equal(true);
            expect(await evaluate("'abd' <= 'abc'", presets)).to.equal(false);
            expect(await evaluate("'abc' <= 'ab'", presets)).to.equal(false);
            expect(await evaluate("'abc' <= ''", presets)).to.equal(false);
        });

        it("should return false if X and Y are both lists and X follows Y lexicographically", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("[1,2,3] <= [4,5,6]", presets)).to.equal(true);
            expect(await evaluate("[1,2,3] <= [1,2,4]", presets)).to.equal(true);
            expect(await evaluate("[1,2] <= [1,2,4]", presets)).to.equal(true);
            expect(await evaluate("[] <= [1,2,3]", presets)).to.equal(true);
            expect(await evaluate("[1,2,3] <= [1,2,3]", presets)).to.equal(true);
            expect(await evaluate("[1,2,4] <= [1,2,3]", presets)).to.equal(false);
            expect(await evaluate("[1,2,4] <= [1,2]", presets)).to.equal(false);
            expect(await evaluate("[1,2,3] <= []", presets)).to.equal(false);
        });

        it("should return true if X is nothing", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("() <= ()", presets)).to.equal(true);
            expect(await evaluate("() <= T", presets)).to.equal(true);
            expect(await evaluate("() <= F", presets)).to.equal(true);
            expect(await evaluate("() <= 1", presets)).to.equal(true);
            expect(await evaluate("() <= 'abc'", presets)).to.equal(true);
            expect(await evaluate("() <= ls", presets)).to.equal(true);
            expect(await evaluate("() <= ns", presets)).to.equal(true);
            expect(await evaluate("() <= fn", presets)).to.equal(true);
        });

        it("should return false if Y is nothing and X is not", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("() <= ()", presets)).to.equal(true);
            expect(await evaluate("T <= ()", presets)).to.equal(false);
            expect(await evaluate("F <= ()", presets)).to.equal(false);
            expect(await evaluate("1 <= ()", presets)).to.equal(false);
            expect(await evaluate("'abc' <= ()", presets)).to.equal(false);
            expect(await evaluate("ls <= ()", presets)).to.equal(false);
            expect(await evaluate("ns <= ()", presets)).to.equal(false);
            expect(await evaluate("fn <= ()", presets)).to.equal(false);
        });

        it("should throw an error for any other type combination", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x;
            for (let [L,R] of [
                    [T,n], [T,s], [T,ls], [T,ns], [T,fn],
                    [F,n], [F,s], [F,ls], [F,ns], [F,fn],
                    [n,T], [n,F], [n,s], [n,ns], [n,fn],
                    [s,T], [s,F], [s,n], [s,ls], [s,ns], [s,fn],
                    [ls,T], [ls,F], [ls,n], [ls,s], [ls,ns], [ls,fn],
                    [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn],
                    [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns] ]) {
                
                var LType = context.type(L);
                var RType = context.type(R);
                expect(await error(() => evaluate("L <= R", {L,R}))).to.equal(`Comparison operation not defined between ${LType} and ${RType}`);
            }                        
        });

        it("should compare tuples with lexicographical criteria", async () => {
            var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await evaluate("(1,2,3) <= (4,5,6)", presets)).to.equal(true);
            expect(await evaluate("(1,2,3) <= (1,2,4)", presets)).to.equal(true);
            expect(await evaluate("(1,2) <= (1,2,4)", presets)).to.equal(true);
            expect(await evaluate("() <= (1,2,3)", presets)).to.equal(true);
            expect(await evaluate("(1,2,3) <= (1,2,3)", presets)).to.equal(true);
            expect(await evaluate("(1,2,4) <= (1,2,3)", presets)).to.equal(false);
            expect(await evaluate("(1,2,4) <= (1,2)", presets)).to.equal(false);
            expect(await evaluate("(1,2,3) <= ()", presets)).to.equal(false);
        });
    });


    // MISCELLANEOUS

    describe("string templates", () => {

        it("should evaluate string literals between accent quotes '``'", async () => {
            expect(await evaluate("`ab\nc`")).to.equal("ab\nc");
            expect(await evaluate("``")).to.equal("");
        });

        it("should replace expressions between `${` and `}` with their value", async () => {
            expect(await evaluate("`aaa ${2*x} bbb`", {x:10})).to.equal("aaa 20 bbb");
        });
    });

    describe("operators precedence and grouping", () => {

        it("should execute assignment operations (`=`) before pairing operations (`,`)", async () => {
            var ctx = context.$extend();

            await parse("x = 1,2,3")(ctx);
            expect(ctx.x).to.equal(1);

            await parse("x = (1,2,3)")(ctx);
            expect(ctx.x).to.be.tuple([1,2,3]);
        });

        it("should execute tuple mapping (`=>`) before assignment operations (`=`)", async () => {
            var ctx = context.$extend();
            await parse("t = (1,2) => 'abcdef'")(ctx);
            expect(ctx.t).to.be.tuple(['b','c']);
        });

        it("should execute function definitions (`->`) before tuple mapping operations (`=>`) and assignment operations", async () => {
            var ctx = context.$extend();

            await parse("f = x -> [x]")(ctx);
            expect(ctx.f).to.be.a("function");
            expect(await ctx.f(1)).to.deep.equal([1]);

            var retval = await parse("1, f = x -> [x], 2")(ctx);
            expect(ctx.f).to.be.a("function");
            expect(retval).to.be.tuple([1,2]);

            await parse("t = (1,2) => x -> [x]")(ctx);
            expect(ctx.t).to.be.tuple([[1],[2]]);
        });

        it("should execure `;` operations before function definitions (`->`)", async () => {
            var ctx = context.$extend({T:true, F:false});
            expect(await parse("f = (x) -> x ; 1")(ctx)).to.equal(null);
            expect(await ctx.f(3)).to.equal(3);
            expect(await ctx.f()).to.equal(1);
        });

        it("should execure `?` operations before `;` operations", async () => {
            var ctx = context.$extend({T:true, F:false});
            expect(await parse("f = (x,y) -> x ? 1 ; y ? 2 ; 3")(ctx)).to.equal(null);
            expect(await ctx.f(true, false)).to.equal(1);
            expect(await ctx.f(true, true)).to.equal(1);
            expect(await ctx.f(false, true)).to.equal(2);
            expect(await ctx.f(false, false)).to.equal(3);
        });

        it("should execute logic operations (`&` and `|`) before `?` and `;` operations", async () => {
            var ctx = context.$extend({T:true, F:false});
            expect(await parse("f = (x,y) -> x & y ? 1 ; x | y ? 2 ; 3")(ctx)).to.equal(null);
            expect(await ctx.f(true, true)).to.equal(1);
            expect(await ctx.f(true, false)).to.equal(2);
            expect(await ctx.f(false, true)).to.equal(2);
            expect(await ctx.f(false, false)).to.equal(3);
        });

        it("should execute comparison operations (`==`,`!=`,`<`,`<=`,`>=`,`>`) before logic operations (`&` and `|`)", async () => {
            var ctx = context.$extend({T:true, F:false});
            expect(await parse("f = x -> x==0 ? 'null' ; 0.01<=x & x<0.1 ? 'small' ; 1000>x & x>=100 ? 'big' ; 'huge' ")(ctx)).to.equal(null);
            expect(await ctx.f(0)).to.equal('null');
            expect(await ctx.f(0.01)).to.equal('small');
            expect(await ctx.f(0.09)).to.equal('small');
            expect(await ctx.f(999)).to.equal('big');
            expect(await ctx.f(100)).to.equal('big');
            expect(await ctx.f(1000)).to.equal('huge');
        });

        it("should execute sum (`+`) and subtraction (`-`) operations before comparison operations (`==`,`!=`,`<`,`<=`,`>=`,`>`)", async () => {
            var ctx = context.$extend({T:true, F:false});
            expect(await parse("1+1<4 & 8-3==5")(ctx)).to.equal(true);
        });

        it("should execute product (`*`) division (`/`) and modulo (`%`) operations before sum and subtraction operations (`+` and `-`)", async () => {
            var ctx = context.$extend({T:true, F:false});
            expect(await parse("1+2*3-10/5+8%5")(ctx)).to.equal(8);
        });

        it("should execute exponentiation (`^`) operations before product (`*`) division (`/`) and modulo (`%`) operations", async () => {
            var ctx = context.$extend({T:true, F:false});
            expect(await parse("1+2*3^2-10/5+8%5")(ctx)).to.equal(20);
        });

        it("should execute subcontexting (`.`) and function calls before arithmetic operations", async () => {
            var ctx = context.$extend({double:x=>2*x, b:10});
            expect(await parse("double 2+3")(ctx)).to.equal(7);
            expect(await parse("double(2+3)")(ctx)).to.equal(10);

            expect(await parse("{a=1,b=2}.a+b")(ctx)).to.equal(11);
            expect(await parse("{a=1,b=2}.(a+b)")(ctx)).to.equal(3);

            expect(await parse("{f=x->2*x}.f 2")(ctx)).to.equal(4);
            expect(await parse("(x->{a=2*x}) 4 . a")(ctx)).to.equal(8);
        });
    });
});
