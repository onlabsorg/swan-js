const chai = require("chai"), expect = chai.expect;

const {parse} = require("../lib/interpreter");
const {Bool, Undefined, Tuple, wrap, unwrap} = require("../lib/types");
const Lexer = require("../lib/lexer");


chai.use(function (chai, utils) {
    chai.Assertion.addMethod('Tuple', function (itemArray) {
        var obj = utils.flag(this, 'object');
        expect(obj[Symbol.iterator]).to.be.a("function");
        expect(Array.from(obj)).to.deep.equal(itemArray);
    });
    chai.Assertion.addMethod('Undefined', function (type) {
        var obj = utils.flag(this, 'object');
        expect(obj).to.be.instanceof(Undefined);
        expect(obj.type).to.equal(type);
    });
});



describe("SWAN EXPRESSION INTERPRETER", () => {


    // CORE

    describe("numeric literals", () => {

        it("should evaluate decimal numeric literals to numbers", async () => {
            expect(await parse("10"   )()).to.equal(10);
            expect(await parse("0"    )()).to.equal(0);
            expect(await parse("3.2"  )()).to.equal(3.2);
            expect(await parse("1.2e3")()).to.equal(1200);
        });
    });

    describe("string literals", () => {

        it(`should evaluate string literals between double quotes '""'`, async () => {
            expect(await parse(`"abc"`)()).to.equal("abc");
            expect(await parse(`""`   )()).to.equal("");
        });

        it("should evaluate string literals between single quotes `''`", async () => {
            expect(await parse(`'def'`)()).to.equal("def");
            expect(await parse(`''`   )()).to.equal("");
        });
    });

    describe("tuples: `exp1, exp2, exp3, ...`", () => {
    
        it("should return the comma-separated values as a Tuple", async () => {
            expect(await parse("10,'abc'")()).to.be.Tuple([10,'abc']);
        });
    
        it("should flatten tuples of tuples: `(X,Y),Z` results in `X,Y,Z`", async () => {
            expect(await parse("1,(2,3),4,(5,(6,7)),8,9")()).to.be.Tuple([1,2,3,4,5,6,7,8,9]);
        });
    
        it("should ignore empty tuples when flattening tuples: `X,(),Y` results in `X,Y`", async () => {
            expect(await parse("1,(),2")()).to.be.Tuple([1,2]);
            expect(await parse("(),(1,(),2),(),3")()).to.be.Tuple([1,2,3]);
        });
    
        it("should evaluate empty tuples `()` as null", async () => {
            expect(await parse(""          )()).to.equal(null);
            expect(await parse("()"        )()).to.equal(null);
            expect(await parse("(), (), ()")()).to.equal(null);
        });
    
        it("should evaluate 1-uples (x,()) as x", async () => {
            expect(await parse("(), 10, ()")()).to.equal(10);
        });
    });
    
    describe("lists: `[expression]`", () => {
    
        it("should return an array", async () => {
            expect(await parse("[1,'abc',3]")()).to.deep.equal([1,"abc",3]);
            expect(await parse("[1]"        )()).to.deep.equal([1]);
            expect(await parse("[]"         )()).to.deep.equal([]);
        });
    
        it("should not flatten deep lists", async () => {
            expect(await parse("[[1,2],3,4,[]]")()).to.deep.equal([[1,2],3,4,[]]);
        });
    });
    
    describe("name resolution", () => {
    
        it("should return the value mapped to the name in the current context", async () => {
            var context = {a:10, _b:20, __c__:"xxx"};
            expect(await parse("a"    )(context)).to.equal(10);
            expect(await parse("_b"   )(context)).to.equal(20);
            expect(await parse("__c__")(context)).to.equal("xxx");
        });
    
        it("should return `Undefined NameReference` if the name is not mapped", async () => {
            const undef = await parse("undefined_key")({a:10, _b:20});
            expect(undef).to.be.Undefined("NameReference");
            expect(undef.value.unwrap()).to.equal("undefined_key");
        });
    
        it("should return `Undefined NameReference` if name is a property inherited from Object", async () => {
            var undef = await parse("isPrototypeOf")({});
            expect(undef).to.be.Undefined("NameReference");
            expect(undef.value.unwrap()).to.equal("isPrototypeOf");
            
            var undef = await parse("hasOwnProperty")({});
            expect(undef).to.be.Undefined("NameReference");
            expect(undef.value.unwrap()).to.equal("hasOwnProperty");
        });
    
        describe("name resolution in a child context", () => {
    
            it("should return the child name value if name is mapped in the child context", async () => {
                var context = Object.assign(Object.create({a:10, b:20}), {a:100});
                expect(await parse("a")(context)).to.equal(100);
            });
    
            it("should return the parent name value if name is not mapped in the child context", async () => {
                var context = Object.assign(Object.create({a:10, b:20}), {a:100});
                expect(await parse("b")(context)).to.equal(20);
            });
    
            it("should return `Undefined NameReference` if the name is not mapped in the child context nor in the parent context", async () => {
                var context = Object.assign(Object.create({a:10, b:20}), {a:100});
                const undef = await parse("undefined_key")(context);
                expect(undef).to.be.Undefined("NameReference");
                expect(undef.value.unwrap()).to.equal("undefined_key");
            });
        });
    });
    
    describe("labelling operation `name: expression`", () => {
    
        it("should create a new name in the current context and map it to the given value", async () => {
            var context = {};
            var value = await parse("x: 10")(context);
            expect(context.x).to.equal(10);
        });
    
        it("should assign a tuple of values to a tuple of names", async () => {
            var context = {};
            var value = await parse("(a,b,c) : (1,2,3)")(context);
            expect(context.a).to.equal(1);
            expect(context.b).to.equal(2);
            expect(context.c).to.equal(3);
        });
    
        it("should assign null to the last names if the values tuple is smaller than the names tuple", async () => {
            var context = {};
            await parse("(a,b,c,d) : (10,20)")(context);
            expect(context.a).to.equal(10);
            expect(context.b).to.equal(20);
            expect(context.c).to.be.null;
            expect(context.d).to.be.null;
        });
    
        it("should assign to the last name the tuple of remaining values if the names tuple is smaller than the values tuple", async () => {
            var context = {};
    
            await parse("(a,b) : (100,200,300)")(context);
            expect(context.a).to.equal(100);
            expect(context.b).to.be.Tuple([200,300]);
    
            await parse("c : (10,20,30)")(context);
            expect(context.c).to.be.Tuple([10,20,30]);
        });
    
        it("should overwrite an existing name-value mapping", async () => {
            var context = {};
            await parse("a : 2")(context);
            await parse("a : 3")(context);
            expect(context.a).to.equal(3);
        });
    
        it("should return the expression value", async () => {
            expect(await parse("x: 10"                )()).to.equal(10);
            expect(await parse("(a,b,c) : (1,2,3)"    )()).to.be.Tuple([1,2,3]);
            expect(await parse("(a,b,c,d) : (10,20)"  )()).to.be.Tuple([10,20]);
            expect(await parse("(a,b) : (100,200,300)")()).to.be.Tuple([100,200,300]);
            expect(await parse("c : (10,20,30)"       )()).to.be.Tuple([10,20,30]);
        });
        
        describe("when non valid names are provided at the left-hand side of the expression", () => {
            
            it("should not define any name", async () => {                
                var context = {};
                
                await parse("'abc' : 2")(context);
                expect(context.$name).to.be.undefined;
                
                await parse("(name1, 3*2) : (10, 20)")(context)
                expect(context.name1).to.be.undefined;
            });
            
            it("should return `Undefined`", async () => {
                var context = {};
                
                var undef = await parse("'abc' : 2")(context);
                expect(undef).to.be.Undefined('LabellingOperation');
                expect(undef.children[0]).to.be.Undefined('StringLiteral')
                expect(undef.children[1].unwrap()).to.equal(2);

                var undef = await parse("3*2 : 2")(context);
                expect(undef).to.be.Undefined('LabellingOperation');
                expect(undef.children[0]).to.be.Undefined('MulOperation')
                expect(undef.children[0].children[0]).to.be.Undefined('NumberLiteral');
                expect(undef.children[0].children[0].value.unwrap()).to.equal(3);
                expect(undef.children[0].children[1]).to.be.Undefined('NumberLiteral');
                expect(undef.children[0].children[1].value.unwrap()).to.equal(2);
                expect(undef.children[1].unwrap()).to.equal(2);
            });
        });
    });
    
    describe("assignment operation: name = expression", () => {
        
        it("should create a new name in the current context and map it to the given value", async () => {
            var context = {};
            var value = await parse("x = 10")(context);
            expect(context.x).to.equal(10);
        });
    
        it("should assign a tuple of values to a tuple of names", async () => {
            var context = {};
            var value = await parse("(a,b,c) = (1,2,3)")(context);
            expect(context.a).to.equal(1);
            expect(context.b).to.equal(2);
            expect(context.c).to.equal(3);
        });
    
        it("should assign null to the last names if the values tuple is smaller than the names tuple", async () => {
            var context = {};
            await parse("(a,b,c,d) = (10,20)")(context);
            expect(context.a).to.equal(10);
            expect(context.b).to.equal(20);
            expect(context.c).to.be.null;
            expect(context.d).to.be.null;
        });
    
        it("should assign to the last name the tuple of remaining values if the names tuple is smaller than the values tuple", async () => {
            var context = {};
    
            await parse("(a,b) = (100,200,300)")(context);
            expect(context.a).to.equal(100);
            expect(context.b).to.be.Tuple([200,300]);
    
            await parse("c = (10,20,30)")(context);
            expect(context.c).to.be.Tuple([10,20,30]);
        });
    
        it("should overwrite an existing name-value mapping", async () => {
            var context = {};
            await parse("a = 2")(context);
            await parse("a = 3")(context);
            expect(context.a).to.equal(3);
        });
    
        it("should return an empty tuple", async () => {
            expect(await parse("x = 10"               )()).to.be.null;
            expect(await parse("(a,b,c) = (1,2,3)"    )()).to.be.null;
            expect(await parse("(a,b,c,d) = (10,20)"  )()).to.be.null;
            expect(await parse("(a,b) = (100,200,300)")()).to.be.null;
            expect(await parse("c = (10,20,30)"       )()).to.be.null;
        });
        
        describe("when non valid names are provided at the left-hand side of the expression", () => {
            
            it("should not define any name", async () => {                
                var context = {};
                
                await parse("'abc' = 2")(context);
                expect(context.$name).to.be.undefined;
                
                await parse("(name1, 3*2) = (10, 20)")(context)
                expect(context.name1).to.be.undefined;
            });
            
            it("should return `Undefined`", async () => {
                var context = {};
                
                var undef = await parse("'abc' = 2")(context);
                expect(undef).to.be.Undefined('AssignmentOperation');
                expect(undef.children[0]).to.be.Undefined('StringLiteral')
                expect(undef.children[1].unwrap()).to.equal(2);

                var undef = await parse("3*2 = 2")(context);
                expect(undef).to.be.Undefined('AssignmentOperation');
                expect(undef.children[0]).to.be.Undefined('MulOperation')
                expect(undef.children[0].children[0]).to.be.Undefined('NumberLiteral');
                expect(undef.children[0].children[0].value.unwrap()).to.equal(3);
                expect(undef.children[0].children[1]).to.be.Undefined('NumberLiteral');
                expect(undef.children[0].children[1].value.unwrap()).to.equal(2);
                expect(undef.children[1].unwrap()).to.equal(2);
            });
        });
    });
    
    describe("namespace definition: {expression}", () => {
    
        it("return an object with the mapped names", async () => {
            expect(await parse("{x=1, y:2, z=3}")()).to.deep.equal({x:1,y:2,z:3});
        });
    
        it("should ignore the non-assignment operations", async () => {
            expect(await parse("{x=1, 10, y=2, z=3}")()).to.deep.equal({x:1,y:2,z:3});
        });
    
        it("should not assign the names to the parent context", async () => {
            var context = {x:10};
            expect(await parse("{x=20}")(context)).to.deep.equal({x:20});
            expect(context.x).to.equal(10);
        });
    });
    
    describe("function definition: names_tuple -> expression", () => {
    
        it("should return a function resolving the expression in a context augumented with the argument names", async () => {
            var foo = await parse("(x, y) -> [y,x]")();
            expect(foo).to.be.a("function");
            expect(await foo(10,20)).to.deep.equal([20,10]);
        });
    
        it("should follow the assignment rules when mapping argument names to parameters", async () => {
    
            var foo = await parse("(x, y) -> {a=x,b=y}")();
            expect(await foo(10)).to.deep.equal({a:10, b:null});
    
            var retval = await foo(10,20,30);
            expect(retval.a).to.equal(10);
            expect(retval.b).to.be.Tuple([20,30]);
        });
    
        it("should be righ-to-left associative", async () => {
            var foo = await parse("x -> y -> {a=x,b=y}")();
            var foo10 = await foo(10);
            expect(foo10).to.be.a("function");
            expect(await foo10(20)).to.deep.equal({a:10, b:20});
        });
    });
    
    describe("'apply' operation: Y X`", () => {
    
        describe("when `Y` is a function", () => {
    
            it("should call F with the parameter X and return its return value", async () => {
                var context = {
                    double: x => 2 * x,
                    sum: (x,y) => x + y
                };
                expect(await parse("(x -> [x]) 10"            )(context)).to.deep.equal([10]);
                expect(await parse("((x, y) -> [y,x])(10, 20)")(context)).to.deep.equal([20,10]);
                expect(await parse("double 25"                )(context)).to.equal(50);
                expect(await parse("sum(10, 20)"              )(context)).to.equal(30);
            });
    
            it("should return Undefined if F throws an error", async () => {
                var error = new Error('Test error');
                var context = {fn: x => {throw error}};
                var undef = await parse('fn 10')(context);
                expect(undef).to.be.Undefined('Term');
                expect(undef.value).to.equal(error);
            });
    
            it("should return Undefined if F returns Undefined", async () => {
                var undef = new Undefined();
                var context = {fn: x => undef};
                expect(await parse('fn 10')(context)).to.equal(undef);
            });
        });
        
        describe("when `Y` is a string", () => {
            
            it("should return the X-th character if X is an integer", async () => {
                expect(await parse("'abcdef' 2")({})).to.equal('c');
            });
    
            it("should consider only the integer part of X if X is a decimal number", async () => {
                expect(await parse("'abcdef' 2.3")({})).to.equal('c');
            });
    
            it("should consider negative indexes as relative to the string end", async () => {
                expect(await parse("'abcdef'(i)")({i:-2})).to.equal('e');
            });
    
            it("should return an empty string if X is an out of range number or not a number", async () => {
                expect(await parse("'abcdef'(i)")({i:100 })).to.equal("");
                expect(await parse("'abcdef'(i)")({i:-100})).to.equal("");
                expect(await parse("'abcdef'(i)")({i:'1' })).to.equal("");
                expect(await parse("'abcdef'(i)")({i:[]  })).to.equal("");
                expect(await parse("'abcdef'(i)")({i:{}  })).to.equal("");
            });
    
            it("should return an tuple ot characters if X is a tuple", async () => {
                expect(await parse("'abcdef'(1,'x',3)")({})).to.be.Tuple(['b','','d']);
            });            
        })
        
        describe("when `Y` is a list", () => {
            
            it("should return the X-th item if X is an integer", async () => {
                const context = {
                    list: [10, 20, 30, 40, 50, 60]
                }
                expect(await parse("list 2")(context)).to.equal(30);
            });
    
            it("should consider only the integer part of X if X is a decimal number", async () => {
                const context = {
                    list: [10, 20, 30, 40, 50, 60]
                }
                expect(await parse("list 2.3")(context)).to.equal(30);
            });
    
            it("should consider negative indexes as relative to the list end", async () => {
                const context = {
                    list: [10, 20, 30, 40, 50, 60],
                    i: -2
                }
                expect(await parse("list(i)")(context)).to.equal(50);
            });
    
            it("should return () if X is an out of range number or not a number", async () => {
                const context = {
                    list: [10, 20, 30, 40, 50, 60],
                    i:-100
                }
                expect(await parse("list(100)")(context)).to.be.null;
                expect(await parse("list(i)"  )(context)).to.be.null;
                expect(await parse("list('1')")(context)).to.be.null;
                expect(await parse("list([])" )(context)).to.be.null;
                expect(await parse("list({i})")(context)).to.be.null;
            });
    
            it("should return a tuple of list items if X is a tuple", async () => {
                const context = {
                    list: [10, 20, 30, 40, 50, 60],
                }
                expect(await parse("list(1,'x',3)")(context)).to.be.Tuple([20,40]);
            });            
        })
        
        describe("when `Y` is a namespace", () => {
            
            it("should return the value mapped to X if X is a valid name", async () => {
                var context = {
                    ns: {abc:10, def:20}
                };
                expect(await parse("ns 'abc'" )(context)).to.equal(10);
                expect(await parse("ns('def')")(context)).to.equal(20);
            });
            
            it("shoudl return () if X is not a valid name or a name not mapped to a value", async () => {
                var context = {
                    ns: {abc:10, def:20}
                };
                expect(await parse("ns '123'"  )(context)).to.be.null;
                expect(await parse("ns 123"    )(context)).to.be.null;
                expect(await parse("ns [1,2,3]")(context)).to.be.null;
            });

            it("shoudl return () if X is a name inherited from Object", async () => {
                var context = {
                    ns: {abc:10, def:20}
                };
                expect(await parse("ns 'isPrototypeOf'" )(context)).to.be.null;
                expect(await parse("ns 'hasOwnProperty'")(context)).to.be.null;
            });

            it("shoudl return a tuple of value if X is a tuple with more than one item", async () => {
                var context = {
                    ns: {abc:10, def:20}
                };
                expect(await parse("ns('abc',2,'def')" )(context)).to.be.Tuple([10, 20]);
            });
        });
    
        describe("when Y is of any other type", () => {
    
            it("should return Undefined ApplyOperation", async () => {
                for (let Y of [true, false, 10, new Undefined]) {
                    const undef = await parse("Y(1)")({Y});
                    expect(undef).to.be.Undefined('ApplyOperation');
                    expect(undef.children[0].unwrap()).to.equal(Y);
                    expect(undef.children[1].unwrap()).to.equal(1);
                }
            });            
        });
    
        describe("when Y is a tuple", () => {
    
            it("should return a tuple obtained applying each item of Y to X", async () => {
                var context = {
                    f: (x,y) => x+y,
                    s: 'abc'
                };
                var tuple = await parse('(f,s)(1,2)')(context);
                expect(tuple).to.be.Tuple([3,'b','c']);
            });
        });
    });
    
    // describe("tuple mapping operation: X => Y", () => {
    // 
    //     it("should apply Y to each item of X and return the resulting tuple", async () => {
    //         expect(await evaluate("(1,2,3) => x -> 2*x")).to.be.Tuple([2,4,6]);
    //         var tuple = await evaluate("(1,2,3) => 'abcdef'");
    //         expect(tuple).to.be.instanceof(Tuple);
    //         expect(Array.from(tuple)[0]).to.be.Undefined('application', "abcdef");
    //         expect(Array.from(tuple)[1]).to.be.Undefined('application', "abcdef");
    //         expect(Array.from(tuple)[2]).to.be.Undefined('application', "abcdef");
    //     });
    // });
    
    describe("sub-contexting: X.Y", () => {
    
        describe("when X is a namespace", () => {
            
            it("should evaluate 'Y' in the 'X' context if 'X' is a namespace", async () => {
                var context = {x: 10};
                await parse("ns = {y=20, z=30, _h=40}")(context);
                expect(await parse("ns.y"      )(context)).to.equal(20);
                expect(await parse("ns.[1,y,z]")(context)).to.deep.equal([1,20,30]);
                expect(await parse("ns.x"      )(context)).to.equal(10);
                expect(await parse("ns._h"     )(context)).to.equal(40);
        
                var context = { ns:{x:10,y:20,z:30} };
                expect(await parse("ns.[x,y,z]")(context)).to.deep.equal([10,20,30]);
            });
        
            it("should see the global contexts", async () => {
                var context = {x:10};
                await parse("ns = {y=20}")(context);
                expect(await parse("ns.x")(context)).to.equal(10);
                expect(await parse("ns.y")(context)).to.equal(20);
            });
        
            it("should see the function parameters in a function expressions", async () => {
                var context = {x:10};
                await parse("ns = {x=10}, nsp = {x=20}")(context);
                await parse("f = nsp -> nsp.x")(context);
                expect(await parse("f ns")(context)).to.equal(10);
            });            
        });
    
        describe("when X is of any other type", () => {
            
            it("should return Undefined SubcontextingOperation", async () => {
                var undef = await parse("(10).name")({});
                expect(undef).to.be.Undefined("SubcontextingOperation");
                expect(undef.children[0].unwrap()).to.equal(10);
                
                var undef = await parse("[].name")({});
                expect(undef).to.be.Undefined("SubcontextingOperation");
                expect(undef.children[0].unwrap()).to.deep.equal([]);
                
                var context = {fn: x=>2*x};
                var undef = await parse("fn.name")(context);
                expect(undef).to.be.Undefined("SubcontextingOperation");
                expect(undef.children[0].unwrap()).to.equal(context.fn);
            });
        });

        describe("when X is a tuple", () => {
            
            it("should return a tuple of items, one for each item of X", async () => {
                expect(await parse(`({a:1},{a:2},{a:3}).a`)({})).to.be.Tuple([1,2,3]);
            });
        });
    });
    
    describe("comments", () => {
    
        it("should ignore the text following the `#` character up to the end of the line or of the expression", async () => {
            var expression = `
                # this is a comment
                12.345 # this is another comment
                # this is the last comment`
            expect(await parse(expression)({})).to.equal(12.345);
        });
    
        it("should not parse `#` characters in a string as comments", async () => {
            expect(await parse("'this # is a string'")({})).to.equal("this # is a string");
            expect(await parse(`"this # is a string"`)({})).to.equal("this # is a string");
        });
    });



    // UNARY OPERATORS

    describe("+X", () => {
    
        it("should return X", async () => {
            for (let X of [true, false, "abc", [1,2,3], {x:1}, x=>x, new Undefined()]) {
                expect(await parse("+X")({X})).to.deep.equal(X);
            }
            expect(await parse("+(1,2,3)")({})).to.be.Tuple([1,2,3]);
            expect(await parse("+()")({})).to.be.null;
        });
    });
    
    describe("-X", () => {
    
        it("should return -1*X if X is a number", async () => {
            expect(await parse("-3")({})).to.equal(-3);
            expect(await parse("-x")({x:10})).to.equal(-10);
        });
    
        it("should return Undefined NegationOperation if X is not a number", async () => {
            for (let X of [true, false, "abc", [1,2,3], {x:1}, x=>x, new Undefined()]) {
                const undef = await parse("-X")({X});
                expect(undef).to.be.Undefined('NegationOperation');
                expect(undef.children[0].unwrap()).to.deep.equal(X);
            }
        });
    
        it("should apply the operator to each item of X if X is a Tuple", async () => {
            expect(await parse("-(10, -2, 3)")({})).to.be.Tuple([-10, 2, -3]);
            var tuple = await parse("-(3, x, s)")({x:-10, s:'abc'});
            expect(Array.from(tuple)[0]).to.equal(-3);
            expect(Array.from(tuple)[1]).to.equal(10);
            expect(Array.from(tuple)[2]).to.be.Undefined('NegationOperation');
            expect(Array.from(tuple)[2].children[0].unwrap()).to.equal('abc');
        });
    });

    
    
    // LOGIC OPERATORS
    
    describe("X | Y", () => {
    
        it("should return X if it booleanizes to true", async () => {
            const context = {TRUE:true, FALSE:false};
    
            // true or true
            expect(await parse("TRUE | TRUE")(context)).to.equal(true);
            expect(await parse("TRUE | 10"  )(context)).to.equal(true);
            expect(await parse("10 | TTRUE" )(context)).to.equal(10);
            expect(await parse("10 | 10"    )(context)).to.equal(10);
    
            // true or false
            expect(await parse("TRUE | FALSE")(context)).to.equal(true);
            expect(await parse("TRUE | 0"    )(context)).to.equal(true);
            expect(await parse("10 | FALSE"  )(context)).to.equal(10);
            expect(await parse("10 | 0"      )(context)).to.equal(10);    
        })
    
        it("should return Y if X booleanizes to false", async () => {
            const context = {TRUE:true, FALSE:false};
    
            // false or true
            expect(await parse("FALSE | TRUE")(context)).to.equal(true);
            expect(await parse("FALSE | 10"  )(context)).to.equal(10);
            expect(await parse("0 | TRUE"    )(context)).to.equal(true);
            expect(await parse("0 | 10"      )(context)).to.equal(10);
    
            // false or false
            expect(await parse("FALSE | FALSE")(context)).to.equal(false);
            expect(await parse("FALSE | 0"    )(context)).to.equal(0);
            expect(await parse("0 | FALSE"    )(context)).to.equal(false);
            expect(await parse("0 | 0"        )(context)).to.equal(0);
        })
    });
    
    describe("X & Y", () => {
    
        it("should return Y if X booleanizes to true", async () => {
            const context = {TRUE:true, FALSE:false};
    
            // true or true
            expect(await parse("TRUE & TRUE")(context)).to.equal(true);
            expect(await parse("TRUE & 10"  )(context)).to.equal(10);
            expect(await parse("10 & TRUE"  )(context)).to.equal(true);
            expect(await parse("10 & 10"    )(context)).to.equal(10);
    
            // true or false
            expect(await parse("TRUE & FALSE")(context)).to.equal(false);
            expect(await parse("TRUE & 0"    )(context)).to.equal(0);
            expect(await parse("10 & FALSE"  )(context)).to.equal(false);
            expect(await parse("10 & 0"      )(context)).to.equal(0);
        });
    
        it("should return X if it booleanizes to false", async () => {
            const context = {TRUE:true, FALSE:false};
    
            // false or true
            expect(await parse("FALSE & TRUE")(context)).to.equal(false);
            expect(await parse("FALSE & 10"  )(context)).to.equal(false);
            expect(await parse("0 & TRUE"    )(context)).to.equal(0);
            expect(await parse("0 & 10"      )(context)).to.equal(0);
    
            // false or false
            expect(await parse("FALSE & FALSE")(context)).to.equal(false);
            expect(await parse("FALSE & 0"    )(context)).to.equal(false);
            expect(await parse("0 & FALSE"    )(context)).to.equal(0);
            expect(await parse("0 & 0"        )(context)).to.equal(0);
        });
    });
    
    describe("X ? Y", () => {
    
        it("should return Y is X booleanizes to true", async () => {
            const context = {TRUE:true, FALSE:false};

            expect(await parse("TRUE ? [1,2,3]")(context)).to.deep.equal([1,2,3]);
            expect(await parse("10 ? [1,2,3]"  )(context)).to.deep.equal([1,2,3]);
        });
    
        it("should return null if X booleanizes to false", async () => {
            const context = {TRUE:true, FALSE:false};

            expect(await parse("FALSE ? [1,2,3]")(context)).to.be.null;
            expect(await parse("0 ? [1,2,3]"    )(context)).to.be.null;
        });
    });
    
    describe("X ; Y", () => {
    
        it("should return X if it is not ()", async () => {
            expect(await parse("[1,2,3] ; [3,4,5]")({})).to.deep.equal([1,2,3]);
        });
    
        it("should return Y if X is ()", async () => {
            expect(await parse("() ; [3,4,5]")({})).to.deep.equal([3,4,5]);
        });
    });
    
    
    
    
    
    // // CONSTANTS
    // 
    // describe("TRUE constant", () => {
    //     it("should return true", async () => {
    //         expect(await evaluate("TRUE")).to.equal(true);
    //     });
    // });
    // 
    // describe("FALSE constant", () => {
    //     it("should return false", async () => {
    //         expect(await evaluate("FALSE")).to.equal(false);
    //     });
    // });
    // 
    // describe("INFINITY constant", () => {
    //     it("should return Infinity", async () => {
    //         expect(await evaluate("INFINITY")).to.equal(Infinity);
    //     });
    // });
    // 
    // 
    // // BUILT-IN FUNCTIONS
    // 
    // describe("undefined X", () => {
    // 
    //     it("should return Undefined", async () => {
    //         var u = await evaluate("undefined('testing', 1)");
    //         expect(u).to.be.Undefined("testing", 1);
    // 
    //         var u = await evaluate("undefined('testing', 1, [])");
    //         expect(u).to.be.Undefined("testing", 1, []);
    // 
    //         var u = await evaluate("undefined('testing', 1, [], {})");
    //         expect(u).to.be.Undefined("testing", 1, [], {});
    // 
    //         var u = await evaluate("undefined('testing', null)");
    //         expect(u).to.be.Undefined("testing");
    //     });
    // });
    // 
    // describe("bool X", () => {
    // 
    //     it("should return X if it is a boolean", async () => {
    //         expect(await evaluate("bool FALSE")).to.equal(false);
    //         expect(await evaluate("bool TRUE")).to.equal(true);
    //     });
    // 
    //     it("should return true if X is a non-zero number", async () => {
    //         expect(await evaluate("bool 0")).to.equal(false);
    //         expect(await evaluate("bool 10")).to.equal(true);
    //         expect(await evaluate("bool (-1)")).to.equal(true);
    //     });
    // 
    //     it("should return true if X is a non-empty string", async () => {
    //         expect(await evaluate("bool ''")).to.equal(false);
    //         expect(await evaluate("bool 'abc'")).to.equal(true);
    //     });
    // 
    //     it("should return true if X is a non-empty list", async () => {
    //         expect(await evaluate("bool []")).to.equal(false);
    //         expect(await evaluate("bool [1,2,3]")).to.equal(true);
    //     });
    // 
    //     it("should return true if X is a non-empty namespace", async () => {
    //         expect(await evaluate("bool {}")).to.equal(false);
    //         expect(await evaluate("bool {a=1,b=2,c=3}")).to.equal(true);
    //     });
    // 
    //     it("should return true if X is a function", async () => {
    //         expect(await evaluate("bool (x->x)")).to.equal(true);
    //         expect(await evaluate("bool jsFn", {jsFn:x=>2*x})).to.equal(true);
    //     });
    // 
    //     it("should return true if X is a tuple with at least one true item", async () => {
    //         expect(await evaluate("bool (0,0,0)")).to.equal(false);
    //         expect(await evaluate("bool (0,1,-1)")).to.equal(true);
    //     });
    // 
    //     it("should return false if X is an empty tuple", async () => {
    //         expect(await evaluate("bool ()")).to.equal(false);
    //     });
    // 
    //     it("should return Undefined if any of the X items is Undefined", async () => {
    //         var presets = {
    //             un1: new Undefined('text1'),
    //             un2: new Undefined('test2'),
    //         };
    //         expect(await evaluate("bool un1", presets)).to.be.Undefined('booleanization', presets.un1);
    //         expect(await evaluate("bool (0,un1,un2)", presets)).to.be.Undefined('booleanization', presets.un1);
    //     });
    // });
    // 
    // describe("not X", () => {
    // 
    //     it("should return !X if it is a boolean", async () => {
    //         expect(await evaluate("not FALSE")).to.equal(!false);
    //         expect(await evaluate("not TRUE")).to.equal(!true);
    //     });
    // 
    //     it("should return false if X is a non-zero number", async () => {
    //         expect(await evaluate("not 0")).to.equal(!false);
    //         expect(await evaluate("not 10")).to.equal(!true);
    //         expect(await evaluate("not (-1)")).to.equal(!true);
    //     });
    // 
    //     it("should return false if X is a non-empty string", async () => {
    //         expect(await evaluate("not ''")).to.equal(!false);
    //         expect(await evaluate("not 'abc'")).to.equal(!true);
    //     });
    // 
    //     it("should return false if X is a non-empty list", async () => {
    //         expect(await evaluate("not []")).to.equal(!false);
    //         expect(await evaluate("not [1,2,3]")).to.equal(!true);
    //     });
    // 
    //     it("should return false if X is a non-empty namespace", async () => {
    //         expect(await evaluate("not {}")).to.equal(!false);
    //         expect(await evaluate("not {a=1,b=2,c=3}")).to.equal(!true);
    //     });
    // 
    //     it("should return false if X is a function", async () => {
    //         expect(await evaluate("not (x->x)")).to.equal(!true);
    //         expect(await evaluate("not jsFn", {jsFn:x=>2*x})).to.equal(!true);
    //     });
    // 
    //     it("should return false if X is a tuple with at least one true item", async () => {
    //         expect(await evaluate("not (0,0,0)")).to.equal(!false);
    //         expect(await evaluate("not (0,1,-1)")).to.equal(!true);
    //     });
    // 
    //     it("should return true if X is an empty tuple", async () => {
    //         expect(await evaluate("not ()")).to.equal(!false);
    //     });
    // 
    //     it("should return Undefined if any of the X items is undefined", async () => {
    //         var presets = {
    //             un1: new Undefined('text1'),
    //             un2: new Undefined('test2'),
    //         };
    //         expect(await evaluate("not un1", presets)).to.be.Undefined('booleanization', presets.un1);
    //         expect(await evaluate("not (0,un1,un2)", presets)).to.be.Undefined('booleanization', presets.un1);
    //     });
    // });
    // 
    // describe("str X", () => {
    // 
    //     it("should return an empty string if X is nothing", async () => {
    //         expect(await evaluate("str ()")).to.equal("");
    //     });
    // 
    //     it("should return 'TRUE' if X is true", async () => {
    //         expect(await evaluate("str TRUE")).to.equal("TRUE");
    //     });
    // 
    //     it("should return 'FALSE' if X is false", async () => {
    //         expect(await evaluate("str FALSE")).to.equal("FALSE");
    //     });
    // 
    //     it("should return String(X) if X is a number", async () => {
    //         expect(await evaluate("str 123.4")).to.equal("123.4");
    //     });
    // 
    //     it("should return X itself if it is a string", async () => {
    //         expect(await evaluate("str 'abc'")).to.equal("abc");
    //     });
    // 
    //     it("should return '[[Function]]' if X is a function", async () => {
    //         expect(await evaluate("str jsFn", {jsFn: x => 2*x})).to.equal("[[Function]]");
    //         expect(await evaluate("str (x->x)", {jsFn: x => 2*x})).to.equal("[[Function]]");
    //     });
    // 
    //     it("should return '[[List of n items]]' when X is a list with n items", async () => {
    //         expect(await evaluate("str[1,2,'abc']")).to.equal("[[List of 3 items]]")
    //     });
    // 
    //     it("should return '[[Namespace of n items]]' when X is a namestpace with n items", async () => {
    //         expect(await evaluate("str{a=1,b=2,c=3}")).to.equal("[[Namespace of 3 items]]");
    //         expect(await evaluate("str ns", {ns:{a:1,b:2,c:3,$d:4}})).to.equal("[[Namespace of 3 items]]");
    //     });
    // 
    //     it("shoulr return `X.__str__` if `X` is a namespace and `X.__str__` is a string", async () => {
    //         expect(await evaluate("str{__str__:'custom string'}")).to.equal("custom string");
    //         expect(await evaluate("str{a=1,b=2,__str__=3}")).to.equal("[[Namespace of 3 items]]");            
    //     });
    // 
    //     it("Should return '[[Undefined: arg1, arg2, ...]]' if X is Undefined", async () => {
    //         var presets = {un: new Undefined("test", 10, [1,2,3], new Position("\n1+2", 2))};
    //         console.log(await evaluate("str un", presets));
    //         expect(await evaluate("str un", presets)).to.equal("[[Undefined: test, 10, [[List of 3 items]], @2:1]]");
    //     });
    // 
    //     it("should concatenate the serialized item if X is a tuple", async () => {
    //         expect(await evaluate("str('it is ',TRUE,' that 1+2 is ',3)")).to.equal("it is TRUE that 1+2 is 3");
    //     });
    // });
    // 
    // describe("enum X", () => {
    // 
    //     it("shoule return the tuple of the first X integers if X is a number", async () => {
    //         expect(await evaluate('enum 5')).to.be.Tuple([0,1,2,3,4]);
    //         expect(await evaluate('enum 5.1')).to.be.Tuple([0,1,2,3,4,5]);
    //         expect(await evaluate('enum (-3)')).to.be.Tuple([0,-1,-2]);
    //         expect(await evaluate('enum (-3.1)')).to.be.Tuple([0,-1,-2,-3]);
    //         expect(await evaluate("enum 1")).to.equal(0);
    //         expect(await evaluate("enum 0")).to.equal(null);
    //     });
    // 
    //     it("should return the tuple `(x1,x2,x3,...)` when X is the list `[x1,x2,x3,...]`", async () => {
    //         expect(await evaluate("enum [10,20,30]")).to.be.Tuple([10,20,30]);
    //         expect(await evaluate("enum ls", {ls:[10,20,30]})).to.be.Tuple([10,20,30]);
    //         expect(await evaluate("enum [1]")).to.equal(1);
    //         expect(await evaluate("enum []")).to.equal(null);
    // 
    //         // it doesn't complain if a list item is Undefined
    //         var presets = {un: new Undefined('Test exception!')};
    //         expect(await evaluate("enum [1,un,2]", presets)).to.be.Tuple([1,presets.un,2]);
    //         expect(await evaluate("enum [un]", presets)).to.equal(presets.un);
    //     });
    // 
    //     it("should return the tuple `('a','b','c')` when X is the string `'abc'`", async () => {
    //         expect(await evaluate("enum 'abc'")).to.be.Tuple(['a','b','c']);
    //         expect(await evaluate("enum s", {s:"abc"})).to.be.Tuple(['a','b','c']);
    //         expect(await evaluate("enum 'a'")).to.equal("a");
    //         expect(await evaluate("enum ''")).to.equal(null);
    //     });
    // 
    //     it("should return the tuple `('name1','name2',...)` when X is the namespace `{name1:val1, name2:val2, ...}`", async () => {
    //         expect(await evaluate("enum {a:1,b:2,c:3}")).to.be.Tuple(['a','b','c']);
    //         expect(await evaluate("enum ns", {ns:{a:1,b:2,c:3,$d:4}})).to.be.Tuple(['a','b','c']);
    //         expect(await evaluate("enum {a:1}")).to.equal("a");
    //         expect(await evaluate("enum {}")).to.equal(null);
    //     });
    // 
    //     it("should return Undefined when X is of any other type", async () => {
    //         expect(await evaluate("enum TRUE")).to.be.Undefined("enumeration", true);
    //         expect(await evaluate("enum FALSE")).to.be.Undefined("enumeration", false);
    // 
    //         var presets = {un: new Undefined(), fn: x=>2*x};
    //         expect(await evaluate("enum fn", presets)).to.be.Undefined("enumeration", presets.fn);
    //         expect(await evaluate("enum un", presets)).to.be.Undefined('enumeration', presets.un);
    //     });
    // 
    //     it("should concatenate the enumeration of each item if X is a tuple", async () => {
    //         expect(await evaluate("enum ('abc',[1,2,3])")).to.be.Tuple(['a','b','c',1,2,3]);
    //     });
    // });
    // 
    // describe("type X", () => {
    // 
    //     it("should return Nothing if `X` is an empty tuple", async () => {
    //         expect(await evaluate("type()")).to.equal(null);
    //     });
    // 
    //     it("should return 'Undefined' if `X` is an Undefined object", async () => {
    //         var presets = {un: new Undefined()};
    //         expect(await evaluate("type un", presets)).to.equal('Undefined');
    //     });
    // 
    //     it("should return 'Boolean' if `X` is a boolean value", async () => {
    //         expect(await evaluate("type TRUE")).to.equal("Boolean");
    //         expect(await evaluate("type FALSE")).to.equal("Boolean");
    //     });
    // 
    //     it("should return 'Number' if `X` is a number", async () => {
    //         expect(await evaluate("type 1")).to.equal("Number");
    //     });
    // 
    //     it("should return 'String' if `X` is a string", async () => {
    //         expect(await evaluate("type 'abc'")).to.equal("String");
    //     });
    // 
    //     it("should return 'List' if `X` is a list", async () => {
    //         expect(await evaluate("type [1,2,3]")).to.equal("List");
    //     });
    // 
    //     it("should return 'Namespace' if `X` is a namespace", async () => {
    //         expect(await evaluate("type {x:1}")).to.equal("Namespace");
    //     });
    // 
    //     it("should return 'Function' if `X` is a function", async () => {
    //         expect(await evaluate("type(()->())")).to.equal("Function");
    //     });
    // 
    //     it("should return a tuple of types if `X` is a tuple", async () => {
    //         expect(await evaluate("type(TRUE,1,'abc')")).to.be.Tuple(['Boolean', 'Number', 'String']);
    // 
    //         // it should not complain fi a tuple item is Undefined
    //         var presets = {un: new Undefined()}
    //         expect(await evaluate("type(TRUE,un,'abc')", presets)).to.be.Tuple(['Boolean', 'Undefined', 'String']);
    //     });
    // });
    // 
    // describe("size X", () => {
    // 
    //     it("should return the length of X if X is a string", async () => {
    //         var size = await evaluate("size 'abc'");
    //         expect(size).to.equal(3);
    //     });
    // 
    //     it("should return the length of X if X is a list", async () => {
    //         var size = await evaluate("size [1,2,3]");
    //         expect(size).to.equal(3);
    //     });
    // 
    //     it("should return the number of own names if X is a namespace", async () => {
    //         var size = await evaluate("size {a=1,b=2,c=3}");
    //         expect(size).to.equal(3);
    // 
    //         var ctx = {o: Object.assign(Object.create({x:1,y:2,a:10}), {a:1,b:2,c:3,$d:4})};
    //         var size = await evaluate("size o", ctx);
    //         expect(size).to.equal(5);
    //     });
    // 
    //     it("should return Undefined if X is of any other type", async () => {
    //         expect(await evaluate("size TRUE")).to.be.Undefined('size', true);
    //         expect(await evaluate("size 1")).to.be.Undefined('size', 1);
    // 
    //         var presets = {un: new Undefined(), fn: x=>2*x};
    //         expect(await evaluate("size fn", presets)).to.be.Undefined('size', presets.fn);
    //         expect(await evaluate("size un", presets)).to.be.Undefined('size', presets.un);
    //     });
    // 
    //     it("should return a tuple containing the size of each item if X is a tuple", async () => {
    //         expect(await evaluate("size('abc', [1,2,3,4], {a:1})")).to.be.Tuple([3,4,1]);
    //         expect(await evaluate("size()")).to.be.null;
    // 
    //         // it should not complain fi a tuple item is Undefined
    //         var presets = {un: new Undefined};
    //         var size = await evaluate("size('abc', un, 10)", presets);
    //         expect(size).to.be.instanceof(Tuple);
    //         expect(Array.from(size)[0]).to.equal(3);
    //         expect(Array.from(size)[1]).to.be.Undefined('size', presets.un);
    //         expect(Array.from(size)[2]).to.be.Undefined('size', 10);
    //     });
    // });
    // 
    
    
    // // ARITHMETIC OPERATORS
    // 
    // describe("X + Y", () => {
    // 
    //     it("should return Y if X is nothing", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false,
    //                 un: new Undefined()};
    //         expect(await evaluate("() + ()", presets)).to.equal(null);
    //         expect(await evaluate("() + T", presets)).to.equal(true);
    //         expect(await evaluate("() + F", presets)).to.equal(false);
    //         expect(await evaluate("() + 10", presets)).to.equal(10);
    //         expect(await evaluate("() + 'abc'", presets)).to.equal("abc");
    //         expect(await evaluate("() + fn", presets)).to.equal(presets.fn);
    //         expect(await evaluate("() + ls", presets)).to.deep.equal([1,2,3]);
    //         expect(await evaluate("() + ns", presets)).to.deep.equal({a:1,b:2,c:3});
    //         expect(await evaluate("() + un", presets)).to.deep.equal(presets.un);
    // 
    //         var tuple = await evaluate("() + (1,2,3)", presets);
    //         expect(tuple instanceof Tuple).to.be.true;
    //         expect(Array.from(tuple)).to.deep.equal([1,2,3]);
    //     });
    // 
    //     it("should return X if Y is nothing", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false,
    //                 un: new Undefined()};
    //         expect(await evaluate("() + ()", presets)).to.equal(null);
    //         expect(await evaluate("T + ()", presets)).to.equal(true);
    //         expect(await evaluate("F + ()", presets)).to.equal(false);
    //         expect(await evaluate("10 + ()", presets)).to.equal(10);
    //         expect(await evaluate("'abc' + ()", presets)).to.equal("abc");
    //         expect(await evaluate("fn + ()", presets)).to.equal(presets.fn);
    //         expect(await evaluate("ls + ()", presets)).to.deep.equal([1,2,3]);
    //         expect(await evaluate("ns + ()", presets)).to.deep.equal({a:1,b:2,c:3});
    //         expect(await evaluate("un + ()", presets)).to.deep.equal(presets.un);
    // 
    //         var tuple = await evaluate("(1,2,3) + ()", presets);
    //         expect(tuple instanceof Tuple).to.be.true;
    //         expect(Array.from(tuple)).to.deep.equal([1,2,3]);
    //     });
    // 
    //     it("should return `X||Y` if both X and Y are booleans", async () => {
    //         var presets = {T:true, F:false};
    //         expect(await evaluate("T + T", presets)).to.be.true;
    //         expect(await evaluate("T + F", presets)).to.be.true;
    //         expect(await evaluate("F + T", presets)).to.be.true;
    //         expect(await evaluate("F + F", presets)).to.be.false;
    //     });
    // 
    //     it("should return `X+Y` if both X and Y are numbers", async () => {
    //         expect(await evaluate("10 + 1")).to.equal(11);
    //         expect(await evaluate("10 + 0")).to.equal(10);
    //         expect(await evaluate("10 + (-2)")).to.equal(8);
    //     });
    // 
    //     it("should concatenate X and Y if they are both strings", async () => {
    //         expect(await evaluate("'abc' + 'def'")).to.equal("abcdef");
    //         expect(await evaluate("'abc' + ''")).to.equal("abc");
    //         expect(await evaluate("'' + 'def'")).to.equal("def");
    //     });
    // 
    //     it("should concatenate X and Y if they are both lists", async () => {
    //         expect(await evaluate("[1,2,3] + [4,5,6]")).to.deep.equal([1,2,3,4,5,6]);
    //         expect(await evaluate("[1,2,3] + []")).to.deep.equal([1,2,3]);
    //         expect(await evaluate("[] + [4,5,6]")).to.deep.equal([4,5,6]);
    //     });
    // 
    //     it("should merge X and Y if they are both namespaces", async () => {
    //         expect(await evaluate("{a=1,b=2} + {b=20,c=30}")).to.deep.equal({a:1,b:20,c:30});
    //         expect(await evaluate("{a=1,b=2} + {}")).to.deep.equal({a:1,b:2});
    //         expect(await evaluate("{} + {b=20,c=30}")).to.deep.equal({b:20,c:30});
    // 
    //         var presets = {
    //             ns1: {a:1, un: new Undefined()},
    //             ns2: {b:2, un: new Undefined()},
    //         }
    //         expect(await evaluate("ns1 + ns2", presets)).to.deep.equal({a:1, b:2, un:presets.ns2.un});
    //     });
    // 
    //     it("should return Undefined for all the other type combinations", async () => {
    //         var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined();
    //         for (let [L,R] of [
    //                 [T,n], [T,s], [T,ls], [T,ns], [T,fn], [T,u],
    //                 [F,n], [F,s], [F,ls], [F,ns], [F,fn], [F, u],
    //                 [n,T], [n,F], [n,s], [n,ls], [n,ns], [n,fn], [n,u],
    //                 [s,T], [s,F], [s,n], [s,ls], [s,ns], [s,fn], [s,u],
    //                 [ls,T], [ls,F], [ls,n], [ls,s], [ls,ns], [ls,fn], [ls,u],
    //                 [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn], [ns,u],
    //                 [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns], [fn,u],
    //                 [u,T], [u,F], [u,n], [u,s], [u,ls], [u,ns], [u,fn], [u,u] ]) {
    // 
    //             var LType = context.type(L);
    //             var RType = context.type(R);
    //             expect(await evaluate("L + R", {L,R})).to.be.Undefined('sum', L, R, new Position("L + R", 2));
    //         }
    //     });
    // 
    //     it("should return (x1+y1, x2+y2, ...) if X and/or Y is a tuple", async () => {
    //         var presets = {T:true, F:false};
    //         expect(Array.from(await evaluate("(T, 1, 'a', [1], {a=1}) + (F, 2, 'b', [2], {b=2})", presets))).to.deep.equal([true, 3, "ab", [1,2], {a:1,b:2}])
    //         expect(Array.from(await evaluate("(T, 1, 'a', [1], {a=1}) + (F, 2, 'b')", presets))).to.deep.equal([true, 3, "ab", [1], {a:1}])
    //         expect(Array.from(await evaluate("(T, 1, 'a') + (F, 2, 'b', [2], {b=2})", presets))).to.deep.equal([true, 3, "ab", [2], {b:2}])
    //         expect(Array.from(await evaluate("10 + (1, 2, 3)", presets))).to.deep.equal([11, 2, 3])
    //         expect(Array.from(await evaluate("(1, 2, 3) + 10", presets))).to.deep.equal([11, 2, 3])
    // 
    //         // partial exception
    //         var source = "(10,20,30) + (1,2,[])";
    //         var tuple = await evaluate(source);
    //         expect(tuple).to.be.instanceof(Tuple);
    //         expect(Array.from(tuple)[0]).to.equal(11);
    //         expect(Array.from(tuple)[1]).to.equal(22);
    //         expect(Array.from(tuple)[2]).to.be.Undefined('sum', 30, [], new Position(source, 11));
    //     });
    // });
    // 
    // describe("X - Y", () => {
    // 
    //     it("should return X if Y is nothing", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("() - ()", presets)).to.equal(null);
    //         expect(await evaluate("T - ()", presets)).to.equal(true);
    //         expect(await evaluate("F - ()", presets)).to.equal(false);
    //         expect(await evaluate("10 - ()", presets)).to.equal(10);
    //         expect(await evaluate("'abc' - ()", presets)).to.equal("abc");
    //         expect(await evaluate("fn - ()", presets)).to.equal(presets.fn);
    //         expect(await evaluate("ls - ()", presets)).to.deep.equal(presets.ls);
    //         expect(await evaluate("ns - ()", presets)).to.deep.equal(presets.ns);
    //         expect(Array.from(await evaluate("(1,2,3) - ()", presets))).to.deep.equal([1,2,3]);
    //     });
    // 
    //     it("should return Undefined if X is nothing", async () => {
    //         for (let R of [true, false, 10, 'abc', [1,2,3], {a:1}, x=>x]) {
    //             var RType = context.type(R);
    //             expect(await evaluate("() - R", {R})).to.be.Undefined('subtraction', R, new Position("() - R", 3));
    //         }
    //     });
    // 
    //     it("should return `X-Y` if both X and Y are numbers", async () => {
    //         var presets = {T:true, F:false};
    //         expect(await evaluate("10 - 1", presets)).to.equal(9);
    //         expect(await evaluate("20 - 0", presets)).to.equal(20);
    //         expect(await evaluate("10 - (-7)", presets)).to.equal(17);
    //     });
    // 
    //     it("should return Undefined for all the other type combinations", async () => {
    //         var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined();
    //         for (let [L,R] of [
    //                 [T,n], [T,s], [T,ls], [T,ns], [T,fn], [T,u],
    //                 [F,n], [F,s], [F,ls], [F,ns], [F,fn], [F,u],
    //                 [n,T], [n,F], [n,s], [n,ls], [n,ns], [n,fn], [n,u],
    //                 [s,T], [s,F], [s,n], [s,ls], [s,ns], [s,fn], [s,u],
    //                 [ls,T], [ls,F], [ls,n], [ls,s], [ls,ns], [ls,fn], [ls,u],
    //                 [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn], [ns,u],
    //                 [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns], [fn,u],
    //                 [u,T], [u,F], [u,n], [u,s], [u,ls], [u,ns], [u,fn], [u,u] ]) {
    // 
    //             var LType = context.type(L);
    //             var RType = context.type(R);
    //             expect(await evaluate("L - R", {L,R})).to.be.Undefined('subtraction', L, R, new Position("L - R", 2));
    //         }            
    //     });
    // 
    //     it("should return (x1-y1, x2-y2, ...) if X and/or Y is a tuple", async () => {
    //         var presets = {};
    //         expect(Array.from(await evaluate("(10,20,30) - (1,2,3)", presets))).to.deep.equal([9,18,27]);
    //         expect(Array.from(await evaluate("(10,20,30) - (1,2)", presets))).to.deep.equal([9,18,30]);
    //         expect(Array.from(await evaluate("(10,20,30) - 1", presets))).to.deep.equal([9,20,30]);
    // 
    //         // partial exception
    //         var source = "(10,20,30) - (1,2,[])";
    //         var tuple = await evaluate(source);
    //         expect(tuple).to.be.instanceof(Tuple);
    //         expect(Array.from(tuple)[0]).to.equal(9);
    //         expect(Array.from(tuple)[1]).to.equal(18);
    //         expect(Array.from(tuple)[2]).to.be.Undefined('subtraction', 30, [], new Position(source, 11));
    //     });
    // });
    // 
    // describe("X * Y", () => {
    // 
    //     it("should return () if either X or Y is nothing", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false,
    //                 un: new Undefined()};
    // 
    //         expect(await evaluate("() * ()", presets)).to.equal(null);
    //         expect(await evaluate("() * T", presets)).to.equal(null);
    //         expect(await evaluate("() * F", presets)).to.equal(null);
    //         expect(await evaluate("() * 10", presets)).to.equal(null);
    //         expect(await evaluate("() * 'abc'", presets)).to.equal(null);
    //         expect(await evaluate("() * fn", presets)).to.equal(null);
    //         expect(await evaluate("() * ls", presets)).to.equal(null);
    //         expect(await evaluate("() * ns", presets)).to.equal(null);
    //         expect(await evaluate("() * (1,2,3)", presets)).to.equal(null);
    //         expect(await evaluate("() * un", presets)).to.equal(null);
    // 
    //         expect(await evaluate("() * ()", presets)).to.equal(null);
    //         expect(await evaluate("T * ()", presets)).to.equal(null);
    //         expect(await evaluate("F * ()", presets)).to.equal(null);
    //         expect(await evaluate("10 * ()", presets)).to.equal(null);
    //         expect(await evaluate("'abc' * ()", presets)).to.equal(null);
    //         expect(await evaluate("fn * ()", presets)).to.equal(null);
    //         expect(await evaluate("ls * ()", presets)).to.equal(null);
    //         expect(await evaluate("ns * ()", presets)).to.equal(null);
    //         expect(await evaluate("(1,2,3) * ()", presets)).to.equal(null);
    //         expect(await evaluate("un * ()", presets)).to.equal(null);
    //     });
    // 
    //     it("should return `X&&Y` if both X and Y are booleans", async () => {
    //         var presets = {T:true, F:false};
    //         expect(await evaluate("T * T", presets)).to.equal(true);
    //         expect(await evaluate("T * F", presets)).to.equal(false);
    //         expect(await evaluate("F * T", presets)).to.equal(false);
    //         expect(await evaluate("F * F", presets)).to.equal(false);
    //     });
    // 
    //     it("should return `X*Y` if both X and Y are numbers", async () => {
    //         expect(await evaluate("10 * 2")).to.equal(20);
    //         expect(await evaluate("10 * 0")).to.equal(0);
    //         expect(await evaluate("10 * (-2)")).to.equal(-20);
    //     });
    // 
    //     it("should concatenate X times Y if X is a number and Y is a string", async () => {
    //         expect(await evaluate("3 * 'Abc'")).to.equal("AbcAbcAbc");
    //         expect(await evaluate("3.1 * 'Abc'")).to.equal("AbcAbcAbc");
    //         expect(await evaluate("3.9 * 'Abc'")).to.equal("AbcAbcAbc");
    //         expect(await evaluate("0 * 'Abc'")).to.equal("");
    //         expect(await evaluate("-2 * 'Abc'")).to.equal("");
    //     });
    // 
    //     it("should concatenate Y times X if Y is a number and X is a string", async () => {
    //         expect(await evaluate("'Abc' * 3")).to.equal("AbcAbcAbc");
    //         expect(await evaluate("'Abc' * 3.1")).to.equal("AbcAbcAbc");
    //         expect(await evaluate("'Abc' * 3.9")).to.equal("AbcAbcAbc");
    //         expect(await evaluate("'Abc' * 0")).to.equal("");
    //         expect(await evaluate("'Abc' * (-2)")).to.equal("");
    //     });
    // 
    //     it("should concatenate X times Y if X is a number and Y is a list", async () => {
    //         expect(await evaluate("3 * [1,2,3]")).to.deep.equal([1,2,3,1,2,3,1,2,3]);
    //         expect(await evaluate("3.1 * [1,2,3]")).to.deep.equal([1,2,3,1,2,3,1,2,3]);
    //         expect(await evaluate("3.9 * [1,2,3]")).to.deep.equal([1,2,3,1,2,3,1,2,3]);
    //         expect(await evaluate("0 * [1,2,3]")).to.deep.equal([]);
    //         expect(await evaluate("-2 * [1,2,3]")).to.deep.equal([]);
    //     });
    // 
    //     it("should concatenate Y times X if Y is a number and X is a list", async () => {
    //         expect(await evaluate("[1,2,3] * 3")).to.deep.equal([1,2,3,1,2,3,1,2,3]);
    //         expect(await evaluate("[1,2,3] * 3.1")).to.deep.equal([1,2,3,1,2,3,1,2,3]);
    //         expect(await evaluate("[1,2,3] * 3.9")).to.deep.equal([1,2,3,1,2,3,1,2,3]);
    //         expect(await evaluate("[1,2,3] * 0")).to.deep.equal([]);
    //         expect(await evaluate("[1,2,3] * (-2)")).to.deep.equal([]);
    //     });
    // 
    //     it("should return Undefined for all the other type combinations", async () => {
    //         var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined();
    //         for (let [L,R] of [
    //                 [T,n], [T,s], [T,ls], [T,ns], [T,fn], [T,u],
    //                 [F,n], [F,s], [F,ls], [F,ns], [F,fn], [F,u],
    //                 [n,T], [n,F], [n,ns], [n,fn], [n,u],
    //                 [s,T], [s,F], [s,ls], [s,ns], [s,fn], [s,u],
    //                 [ls,T], [ls,F], [ls,s], [ls,ns], [ls,fn], [ls,u],
    //                 [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn], [ns,u],
    //                 [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns], [fn,u],
    //                 [u,T], [u,F], [u,n], [u,s], [u,ls], [u,ns], [u,fn], [u,u] ]) {
    // 
    //             var LType = context.type(L);
    //             var RType = context.type(R);
    //             expect(await evaluate("L * R", {L,R})).to.be.Undefined('product', L, R, new Position("L * R", 2));
    //         }                        
    //     });
    // 
    //     it("should return (x1*y1, x2*y2, ...) if X and/or Y is a tuple", async () => {
    //         var presets = {T:true, F:false};
    //         expect(Array.from(await evaluate("(T, 3, 'a', [1]) * (F, 2, 2, 2)",presets))).to.deep.equal([false, 6, "aa", [1,1]]);
    //         expect(Array.from(await evaluate("(10,20,30) * (2,3,4)",presets))).to.deep.equal([20,60,120]);
    //         expect(Array.from(await evaluate("(10,20,30) * (2,3)",presets))).to.deep.equal([20,60]);
    //         expect(Array.from(await evaluate("(10,20) * (2,3,4)",presets))).to.deep.equal([20,60]);
    //         expect(await evaluate("10 * (2,3,4)",presets)).to.equal(20);
    //         expect(await evaluate("(10,20,30) * 2",presets)).to.equal(20);
    // 
    //         // partial exception
    //         var source = "(10,20,30) * (1,2,{})";
    //         var tuple = await evaluate(source);
    //         expect(tuple).to.be.instanceof(Tuple);
    //         expect(Array.from(tuple)[0]).to.equal(10);
    //         expect(Array.from(tuple)[1]).to.equal(40);
    //         expect(Array.from(tuple)[2]).to.be.Undefined('product', 30, {}, new Position(source, 11));
    //     });
    // });
    // 
    // describe("X / Y", () => {
    // 
    //     it("should return nothing if X is nothing", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("() / ()", presets)).to.equal(null);
    //         expect(await evaluate("() / T", presets)).to.equal(null);
    //         expect(await evaluate("() / F", presets)).to.equal(null);
    //         expect(await evaluate("() / 10", presets)).to.equal(null);
    //         expect(await evaluate("() / 'abc'", presets)).to.equal(null);
    //         expect(await evaluate("() / fn", presets)).to.equal(null);
    //         expect(await evaluate("() / ls", presets)).to.equal(null);
    //         expect(await evaluate("() / ns", presets)).to.equal(null);
    //     });
    // 
    //     it("should return Undefined if Y is NOTHING", async () => {
    //         for (let L of [true, false, 10, 'abc', [1,2,3], {x:1}, x=>x]) {
    //             var LType = context.type(L);
    //             expect(await evaluate("L / ()", {L})).to.be.Undefined('division', L, new Position("L / ()", 2));
    //         }
    //     });
    // 
    //     it("should return `X/Y` if both X and Y are numbers", async () => {
    //         expect(await evaluate("10 / 2")).to.equal(5);
    //         expect(await evaluate("20 / 0")).to.equal(Infinity);
    //         expect(await evaluate("10 / (-2)")).to.equal(-5);
    //     });
    // 
    //     it("should return Undefined for all the other type combinations", async () => {
    //         var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined();
    //         for (let [L,R] of [
    //                 [T,n], [T,s], [T,ls], [T,ns], [T,fn], [T,u],
    //                 [F,n], [F,s], [F,ls], [F,ns], [F,fn], [F,u],
    //                 [n,T], [n,F], [n,s], [n,ns], [n,fn], [n,u],
    //                 [s,T], [s,F], [s,n], [s,ls], [s,ns], [s,fn], [s,u],
    //                 [ls,T], [ls,F], [ls,n], [ls,s], [ls,ns], [ls,fn], [ls,u],
    //                 [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn], [ns,u],
    //                 [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns], [fn,u],
    //                 [u,T], [u,F], [u,n], [u,s], [u,ls], [u,ns], [u,fn], [u,u] ]) {
    // 
    //             var LType = context.type(L);
    //             var RType = context.type(R);
    //             expect(await evaluate("L / R", {L,R})).to.be.Undefined('division', L, R, new Position("L / R", 2));
    //         }                        
    //     });
    // 
    //     it("should return (x1/y1, x2/y2, ...) if X and/or Y is a tuple", async () => {
    //         expect(Array.from(await evaluate("(10,20,30) / (2,5,3)"))).to.deep.equal([5,4,10]);
    //         expect(Array.from(await evaluate("(10,20) / (2,5,3)"))).to.deep.equal([5,4]);
    //         expect(await evaluate("10 / (2,5,3)")).to.equal(5);
    //         expect(await evaluate("() / (2,4,3)")).to.equal(null);
    // 
    //         // partial exception
    //         var source = "(10,20,30) / (2,5)";
    //         var tuple = await evaluate(source);
    //         expect(tuple).to.be.instanceof(Tuple);
    //         expect(Array.from(tuple)[0]).to.equal(5);
    //         expect(Array.from(tuple)[1]).to.equal(4);
    //         expect(Array.from(tuple)[2]).to.be.Undefined('division', 30, new Position(source, 11));
    //     });
    // });
    // 
    // describe("X % Y", () => {
    // 
    //     it("should return NOTHING if X is nothing", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("() % ()", presets)).to.equal(null);
    //         expect(await evaluate("() % T", presets)).to.equal(null);
    //         expect(await evaluate("() % F", presets)).to.equal(null);
    //         expect(await evaluate("() % 10", presets)).to.equal(null);
    //         expect(await evaluate("() % 'abc'", presets)).to.equal(null);
    //         expect(await evaluate("() % fn", presets)).to.equal(null);
    //         expect(await evaluate("() % ls", presets)).to.equal(null);
    //         expect(await evaluate("() % ns", presets)).to.equal(null);
    //     });
    // 
    //     it("should return Undefined if Y is NOTHING", async () => {
    //         for (let L of [true, false, 10, 'abc', [1,2,3], {x:1}, x=>x]) {
    //             var LType = context.type(L);
    //             expect(await evaluate("L % ()", {L})).to.be.Undefined('modulo', L, new Position("L % ()", 2));
    //         }
    //     });
    // 
    //     it("should return `X%Y` if both X and Y are numbers", async () => {
    //         expect(await evaluate("10 % 4")).to.equal(2);
    //         expect(await evaluate("10 % (-4)")).to.equal(2);
    //     });
    // 
    //     it("should return Undefined for all the other type combinations", async () => {
    //         var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined();
    //         for (let [L,R] of [
    //                 [T,n], [T,s], [T,ls], [T,ns], [T,fn], [T,u],
    //                 [F,n], [F,s], [F,ls], [F,ns], [F,fn], [F,u],
    //                 [n,T], [n,F], [n,s], [n,ns], [n,fn], [n,u],
    //                 [s,T], [s,F], [s,n], [s,ls], [s,ns], [s,fn], [s,u],
    //                 [ls,T], [ls,F], [ls,n], [ls,s], [ls,ns], [ls,fn], [ls,u],
    //                 [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn], [ns,u],
    //                 [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns], [fn,u],
    //                 [u,T], [u,F], [u,n], [u,s], [u,ls], [u,ns], [u,fn], [u,u] ]) {
    // 
    //             var LType = context.type(L);
    //             var RType = context.type(R);
    //             expect(await evaluate("L % R", {L,R})).to.be.Undefined('modulo', L, R, new Position("L % R", 2));
    //         }            
    //     });
    // 
    //     it("should return (x1/y1, x2/y2, ...) if X and/or Y is a tuple", async () => {
    //         expect(Array.from(await evaluate("(10,20,30) % (4,7,8)"))).to.deep.equal([2,6,6]);
    //         expect(Array.from(await evaluate("(10,20) % (4,7,8)"))).to.deep.equal([2,6]);
    //         expect(await evaluate("10 % (4,7,8)")).to.equal(2);
    //         expect(await evaluate("() % (4,7,8)")).to.equal(null);
    // 
    //         // partial exception
    //         var source = "(10,20,30) % (3,6)";
    //         var tuple = await evaluate(source);
    //         expect(tuple).to.be.instanceof(Tuple);
    //         expect(Array.from(tuple)[0]).to.equal(1);
    //         expect(Array.from(tuple)[1]).to.equal(2);
    //         expect(Array.from(tuple)[2]).to.be.Undefined('modulo', 30, new Position(source, 11));
    //     });
    // });
    // 
    // describe("X ^ Y", () => {
    // 
    //     it("should return nothing if X is nothing", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("() ^ ()", presets)).to.equal(null);
    //         expect(await evaluate("() ^ T", presets)).to.equal(null);
    //         expect(await evaluate("() ^ F", presets)).to.equal(null);
    //         expect(await evaluate("() ^ 10", presets)).to.equal(null);
    //         expect(await evaluate("() ^ 'abc'", presets)).to.equal(null);
    //         expect(await evaluate("() ^ fn", presets)).to.equal(null);
    //         expect(await evaluate("() ^ ls", presets)).to.equal(null);
    //         expect(await evaluate("() ^ ns", presets)).to.equal(null);
    //     });
    // 
    //     it("should return Undefined if Y is NOTHING", async () => {
    //         for (let L of [true, false, 10, 'abc', [1,2,3], {x:1}, x=>x]) {
    //             var LType = context.type(L);
    //             expect(await evaluate("L ^ ()", {L})).to.be.Undefined('exponentiation', L, new Position("L ^ ()", 2));
    //         }
    //     });
    // 
    //     it("should return `X**Y` if both X and Y are numbers", async () => {
    //         expect(await evaluate("10 ^ 2")).to.equal(100);
    //         expect(await evaluate("20 ^ 0")).to.equal(1);
    //         expect(await evaluate("10 ^ (-2)")).to.equal(0.01);
    //     });
    // 
    //     it("should return Undefined for all the other type combinations", async () => {
    //         var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined();
    //         for (let [L,R] of [
    //                 [T,n], [T,s], [T,ls], [T,ns], [T,fn], [T,u],
    //                 [F,n], [F,s], [F,ls], [F,ns], [F,fn], [F,u],
    //                 [n,T], [n,F], [n,s], [n,ns], [n,fn], [n,u],
    //                 [s,T], [s,F], [s,n], [s,ls], [s,ns], [s,fn], [s,u],
    //                 [ls,T], [ls,F], [ls,n], [ls,s], [ls,ns], [ls,fn], [ls,u],
    //                 [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn], [ns,u],
    //                 [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns], [fn,u],
    //                 [u,T], [u,F], [u,n], [u,s], [u,ls], [u,ns], [u,fn], [u,u] ]) {
    // 
    //             var LType = context.type(L);
    //             var RType = context.type(R);
    //             expect(await evaluate("L ^ R", {L,R})).to.be.Undefined('exponentiation', L, R, new Position("L ^ R", 2));
    //         }
    //     });
    // 
    //     it("should return (x1^y1, x2^y2, ...) if X and/or Y is a tuple", async () => {
    //         expect(Array.from(await evaluate("(10,20,30) ^ (2,3,4)"))).to.deep.equal([10**2,20**3,30**4]);
    //         expect(Array.from(await evaluate("(10,20) ^ (2,3,4)"))).to.deep.equal([10**2,20**3]);
    //         expect(await evaluate("10 ^ (2,3,4)")).to.equal(10**2);
    //         expect(await evaluate("() ^ (2,3,4)")).to.equal(null);
    // 
    //         // partial exception
    //         var source = "(2,3,4) ^ (2,3)";
    //         var tuple = await evaluate(source);
    //         expect(tuple).to.be.instanceof(Tuple);
    //         expect(Array.from(tuple)[0]).to.equal(4);
    //         expect(Array.from(tuple)[1]).to.equal(27);
    //         expect(Array.from(tuple)[2]).to.be.Undefined("exponentiation", 4, new Position(source, 8));
    //     });
    // });
    // 
    // 
    // // COMPARISON OPERATORS
    // 
    // describe("X == Y", () => {
    // 
    //     it("should return true if both X and Y are nothing", async () => {
    //         expect(await evaluate("() == ()")).to.equal(true);
    //     });
    // 
    //     it("should return true if X and Y are both true or both false", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("T == T", presets)).to.equal(true);
    //         expect(await evaluate("F == F", presets)).to.equal(true);
    //         expect(await evaluate("T == F", presets)).to.equal(false);
    //         expect(await evaluate("F == T", presets)).to.equal(false);
    //     });
    // 
    //     it("should return true if X and Y are the same number", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("3 == 3", presets)).to.equal(true);
    //         expect(await evaluate("0 == 0", presets)).to.equal(true);
    //         expect(await evaluate("-3 == -3", presets)).to.equal(true);
    //         expect(await evaluate("3 == 2", presets)).to.equal(false);
    //         expect(await evaluate("0 == -4", presets)).to.equal(false);
    //     });
    // 
    //     it("should return true if X and Y are the same string", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("'abc' == 'abc'", presets)).to.equal(true);
    //         expect(await evaluate("'' == ''", presets)).to.equal(true);
    //         expect(await evaluate("'abc' == 'def'", presets)).to.equal(false);
    //         expect(await evaluate("'abc' == ''", presets)).to.equal(false);
    //     });
    // 
    //     it("should return true if X and Y are both lists with equal items", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("[1,2,3] == [1,2,3]", presets)).to.equal(true);
    //         expect(await evaluate("[] == []", presets)).to.equal(true);
    //         expect(await evaluate("[1,2,3] == [4,5,6]", presets)).to.equal(false);
    //         expect(await evaluate("[1,2,3] == []", presets)).to.equal(false);
    //     });
    // 
    //     it("should return true if X and Y are both namespace with sname name:value pairs", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("{a=1,b=2} == {a=1,b=2}", presets)).to.equal(true);
    //         expect(await evaluate("{} == {}", presets)).to.equal(true);
    //         expect(await evaluate("{a=1,b=2} == {a=1,c=2}", presets)).to.equal(false);
    //         expect(await evaluate("{a=1,b=2} == {a=1,b=3}", presets)).to.equal(false);
    //         expect(await evaluate("{a=1,b=2} == {a=1}", presets)).to.equal(false);
    //         expect(await evaluate("{a=1,b=2} == {}", presets)).to.equal(false);
    //         expect(await evaluate("{a=1} == {a=1,b=2}", presets)).to.equal(false);
    //         expect(await evaluate("{} == {a=1,b=2}", presets)).to.equal(false);
    // 
    //         const ns1 = {x:10};
    //         presets.ns2 = Object.assign(Object.create(ns1), {y:20});
    //         expect(await evaluate("ns2 == {x:10,y:20}", presets)).to.equal(true);
    //     });
    // 
    //     it("should return true if X and Y are the same function", async () => {
    //         var presets = {fn1:x=>2*x, fn2:x=>2*x};
    //         expect(await evaluate("fn1 == fn1", presets)).to.equal(true);
    //         expect(await evaluate("fn1 == fn2", presets)).to.equal(false);
    //         expect(await evaluate("(x->2*x) == (x->2*x)", presets)).to.equal(false);
    //         expect(await evaluate("(x->2*x) == fn1", presets)).to.equal(false);
    //         expect(await evaluate("fn1 == (x->2*x)", presets)).to.equal(false);
    //     });
    // 
    //     it("should return true if X and Y are the same Undefined object", async () => {
    //         var presets = {un1: new Undefined(), un2: new Undefined};
    //         expect(await evaluate("un1 == un1", presets)).to.equal(true);
    //         expect(await evaluate("un1 == un2", presets)).to.equal(false);
    //     });
    // 
    //     it("should return false if X and Y are of different types", async () => {
    //         var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined();
    //         for (let [L,R] of [
    //                 [T,n], [T,s], [T,ls], [T,ns], [T,fn], [T,u],
    //                 [F,n], [F,s], [F,ls], [F,ns], [F,fn], [F, u],
    //                 [n,T], [n,F], [n,s], [n,ls], [n,ns], [n,fn], [n,u],
    //                 [s,T], [s,F], [s,n], [s,ls], [s,ns], [s,fn], [s,u],
    //                 [ls,T], [ls,F], [ls,n], [ls,s], [ls,ns], [ls,fn], [ls,u],
    //                 [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn], [ns,u],
    //                 [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns], [fn,u],
    //                 [u,T], [u,F], [u,n], [u,s], [u,ls], [u,ns], [u,fn] ]) {
    // 
    //             expect(await evaluate("L == R", {L,R})).to.be.false;
    //         }
    //     });
    // 
    //     it("should compare tuples with lexicographical criteria", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("(1,2,3) == (1,2,3)", presets)).to.equal(true);
    //         expect(await evaluate("(1,2,3) == (1,2)", presets)).to.equal(false);
    //         expect(await evaluate("(1,2) == (1,2,3)", presets)).to.equal(false);
    //         expect(await evaluate("1 == (1,2,3)", presets)).to.equal(false);
    //         expect(await evaluate("(1,2,3) == 1", presets)).to.equal(false);
    //     });
    // });
    // 
    // describe("X != Y", () => {
    // 
    //     it("should return false if both X and Y are nothing", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("() != ()", presets)).to.equal(false);
    //     });
    // 
    //     it("should return false if X and Y are both false or both true", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("T != T", presets)).to.equal(false);
    //         expect(await evaluate("F != F", presets)).to.equal(false);
    //         expect(await evaluate("T != F", presets)).to.equal(true);
    //         expect(await evaluate("F != T", presets)).to.equal(true);
    //     });
    // 
    //     it("should return false if X and Y are the same number", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("3 != 3", presets)).to.equal(false);
    //         expect(await evaluate("0 != 0", presets)).to.equal(false);
    //         expect(await evaluate("-3 != -3", presets)).to.equal(false);
    //         expect(await evaluate("3 != 2", presets)).to.equal(true);
    //         expect(await evaluate("0 != -4", presets)).to.equal(true);
    //     });
    // 
    //     it("should return false if X and Y are the same string", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("'abc' != 'abc'", presets)).to.equal(false);
    //         expect(await evaluate("'' != ''", presets)).to.equal(false);
    //         expect(await evaluate("'abc' != 'def'", presets)).to.equal(true);
    //         expect(await evaluate("'abc' != ''", presets)).to.equal(true);
    //     });
    // 
    //     it("should return false if X and Y are both lists with equal items", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("[1,2,3] != [1,2,3]", presets)).to.equal(false);
    //         expect(await evaluate("[] != []", presets)).to.equal(false);
    //         expect(await evaluate("[1,2,3] != [4,5,6]", presets)).to.equal(true);
    //         expect(await evaluate("[1,2,3] != []", presets)).to.equal(true);
    //     });
    // 
    //     it("should return false if X and Y are both namespace with sname name:value pairs", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("{a=1,b=2} != {a=1,b=2}", presets)).to.equal(false);
    //         expect(await evaluate("{} != {}", presets)).to.equal(false);
    //         expect(await evaluate("{a=1,b=2} != {a=1,c=2}", presets)).to.equal(true);
    //         expect(await evaluate("{a=1,b=2} != {a=1,b=3}", presets)).to.equal(true);
    //         expect(await evaluate("{a=1,b=2} != {a=1}", presets)).to.equal(true);
    //         expect(await evaluate("{a=1,b=2} != {}", presets)).to.equal(true);
    //         expect(await evaluate("{a=1} != {a=1,b=2}", presets)).to.equal(true);
    //         expect(await evaluate("{} != {a=1,b=2}", presets)).to.equal(true);
    //     });
    // 
    //     it("should return false if X and Y are the same function", async () => {
    //         var presets = {fn1:x=>2*x, fn2:x=>2*x};
    //         expect(await evaluate("fn1 != fn1", presets)).to.equal(false);
    //         expect(await evaluate("fn1 != fn2", presets)).to.equal(true);
    //         expect(await evaluate("(x->2*x) != (x->2*x)", presets)).to.equal(true);
    //         expect(await evaluate("(x->2*x) != fn1", presets)).to.equal(true);
    //         expect(await evaluate("fn1 != (x->2*x)", presets)).to.equal(true);
    //     });
    // 
    //     it("should return false if X and Y are the same Undefined object", async () => {
    //         var presets = {un1: new Undefined(), un2: new Undefined};
    //         expect(await evaluate("un1 != un1", presets)).to.equal(false);
    //         expect(await evaluate("un1 != un2", presets)).to.equal(true);
    //     });
    // 
    //     it("should return true if X and Y are of different types", async () => {
    //         var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined();
    //         for (let [L,R] of [
    //                 [T,n], [T,s], [T,ls], [T,ns], [T,fn], [T,u],
    //                 [F,n], [F,s], [F,ls], [F,ns], [F,fn], [F, u],
    //                 [n,T], [n,F], [n,s], [n,ls], [n,ns], [n,fn], [n,u],
    //                 [s,T], [s,F], [s,n], [s,ls], [s,ns], [s,fn], [s,u],
    //                 [ls,T], [ls,F], [ls,n], [ls,s], [ls,ns], [ls,fn], [ls,u],
    //                 [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn], [ns,u],
    //                 [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns], [fn,u],
    //                 [u,T], [u,F], [u,n], [u,s], [u,ls], [u,ns], [u,fn] ]) {
    // 
    //             expect(await evaluate("L != R", {L,R})).to.be.true;
    //         }
    //     });
    // 
    //     it("should compare tuples with lexicographical criteria", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("(1,2,3) != (1,2,3)", presets)).to.equal(false);
    //         expect(await evaluate("(1,2,3) != (1,2)", presets)).to.equal(true);
    //         expect(await evaluate("(1,2) != (1,2,3)", presets)).to.equal(true);
    //         expect(await evaluate("1 != (1,2,3)", presets)).to.equal(true);
    //         expect(await evaluate("(1,2,3) != 1", presets)).to.equal(true);
    //     });
    // });
    // 
    // describe("X < Y", () => {
    // 
    //     it("should return false if both X and Y are nothing", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("() < ()", presets)).to.equal(false);
    //     });
    // 
    //     it("should return true if X is false and Y is true", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("T < T", presets)).to.equal(false);
    //         expect(await evaluate("F < F", presets)).to.equal(false);
    //         expect(await evaluate("T < F", presets)).to.equal(false);
    //         expect(await evaluate("F < T", presets)).to.equal(true);
    //     });
    // 
    //     it("should return true if X is a lower number than Y", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("1 < 2", presets)).to.equal(true);
    //         expect(await evaluate("0 < 2", presets)).to.equal(true);
    //         expect(await evaluate("-1 < 2", presets)).to.equal(true);
    //         expect(await evaluate("2 < 1", presets)).to.equal(false);
    //         expect(await evaluate("2 < 0", presets)).to.equal(false);
    //         expect(await evaluate("2 < (-2)", presets)).to.equal(false);
    //         expect(await evaluate("2 < 2", presets)).to.equal(false);
    //     });
    // 
    //     it("should return true if X and Y are both strings and X precedes Y alphabetically", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("'abc' < 'def'", presets)).to.equal(true);
    //         expect(await evaluate("'abc' < 'abd'", presets)).to.equal(true);
    //         expect(await evaluate("'ab' < 'abc'", presets)).to.equal(true);
    //         expect(await evaluate("'' < 'abc'", presets)).to.equal(true);
    //         expect(await evaluate("'abc' < 'abc'", presets)).to.equal(false);
    //         expect(await evaluate("'abd' < 'abc'", presets)).to.equal(false);
    //         expect(await evaluate("'abc' < 'ab'", presets)).to.equal(false);
    //         expect(await evaluate("'abc' < ''", presets)).to.equal(false);
    //     });
    // 
    //     it("should return true if X and Y are both lists and X precedes Y lexicographically", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("[1,2,3] < [4,5,6]", presets)).to.equal(true);
    //         expect(await evaluate("[1,2,3] < [1,2,4]", presets)).to.equal(true);
    //         expect(await evaluate("[1,2] < [1,2,4]", presets)).to.equal(true);
    //         expect(await evaluate("[] < [1,2,3]", presets)).to.equal(true);
    //         expect(await evaluate("[1,2,3] < [1,2,3]", presets)).to.equal(false);
    //         expect(await evaluate("[1,2,4] < [1,2,3]", presets)).to.equal(false);
    //         expect(await evaluate("[1,2,4] < [1,2]", presets)).to.equal(false);
    //         expect(await evaluate("[1,2,3] < []", presets)).to.equal(false);
    //     });
    // 
    //     it("should return true if X is nothing and Y is not", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("() < ()", presets)).to.equal(false);
    //         expect(await evaluate("() < T", presets)).to.equal(true);
    //         expect(await evaluate("() < F", presets)).to.equal(true);
    //         expect(await evaluate("() < 1", presets)).to.equal(true);
    //         expect(await evaluate("() < 'abc'", presets)).to.equal(true);
    //         expect(await evaluate("() < ls", presets)).to.equal(true);
    //         expect(await evaluate("() < ns", presets)).to.equal(true);
    //         expect(await evaluate("() < fn", presets)).to.equal(true);
    //     });
    // 
    //     it("should return false if Y is nothing and X is not", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("() < ()", presets)).to.equal(false);
    //         expect(await evaluate("T < ()", presets)).to.equal(false);
    //         expect(await evaluate("F < ()", presets)).to.equal(false);
    //         expect(await evaluate("1 < ()", presets)).to.equal(false);
    //         expect(await evaluate("'abc' < ()", presets)).to.equal(false);
    //         expect(await evaluate("ls < ()", presets)).to.equal(false);
    //         expect(await evaluate("ns < ()", presets)).to.equal(false);
    //         expect(await evaluate("fn < ()", presets)).to.equal(false);
    //     });
    // 
    //     it("should return Undefined for any other type combination", async () => {
    //         var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x;
    //         for (let [L,R] of [
    //                 [T,n], [T,s], [T,ls], [T,ns], [T,fn],
    //                 [F,n], [F,s], [F,ls], [F,ns], [F,fn],
    //                 [n,T], [n,F], [n,s], [n,ns], [n,fn],
    //                 [s,T], [s,F], [s,n], [s,ls], [s,ns], [s,fn],
    //                 [ls,T], [ls,F], [ls,n], [ls,s], [ls,ns], [ls,fn],
    //                 [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn],
    //                 [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns] ]) {
    // 
    //             var LType = context.type(L);
    //             var RType = context.type(R);
    //             expect(await evaluate("L < R", {L,R})).to.be.Undefined('comparison', L, R, new Position("L < R", 2));
    //         }                        
    //     });
    // 
    //     it("should compare tuples with lexicographical criteria", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("(1,2,3) < (4,5,6)", presets)).to.equal(true);
    //         expect(await evaluate("(1,2,3) < (1,2,4)", presets)).to.equal(true);
    //         expect(await evaluate("(1,2) < (1,2,4)", presets)).to.equal(true);
    //         expect(await evaluate("() < (1,2,3)", presets)).to.equal(true);
    //         expect(await evaluate("(1,2,3) < (1,2,3)", presets)).to.equal(false);
    //         expect(await evaluate("(1,2,4) < (1,2,3)", presets)).to.equal(false);
    //         expect(await evaluate("(1,2,4) < (1,2)", presets)).to.equal(false);
    //         expect(await evaluate("(1,2,3) < ()", presets)).to.equal(false);
    //     });
    // });
    // 
    // describe("X >= Y", () => {
    // 
    //     it("should return true if both X and Y are nothing", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("() >= ()", presets)).to.equal(true);
    //     });
    // 
    //     it("should return false if X is false and Y is true", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("T >= T", presets)).to.equal(true);
    //         expect(await evaluate("F >= F", presets)).to.equal(true);
    //         expect(await evaluate("T >= F", presets)).to.equal(true);
    //         expect(await evaluate("F >= T", presets)).to.equal(false);
    //     });
    // 
    //     it("should return false if X is a lower number than Y", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("1 >= 2", presets)).to.equal(false);
    //         expect(await evaluate("0 >= 2", presets)).to.equal(false);
    //         expect(await evaluate("-1 >= 2", presets)).to.equal(false);
    //         expect(await evaluate("2 >= 1", presets)).to.equal(true);
    //         expect(await evaluate("2 >= 0", presets)).to.equal(true);
    //         expect(await evaluate("2 >= (-2)", presets)).to.equal(true);
    //         expect(await evaluate("2 >= 2", presets)).to.equal(true);
    //     });
    // 
    //     it("should return false if X and Y are both strings and X precedes Y alphabetically", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("'abc' >= 'def'", presets)).to.equal(false);
    //         expect(await evaluate("'abc' >= 'abd'", presets)).to.equal(false);
    //         expect(await evaluate("'ab' >= 'abc'", presets)).to.equal(false);
    //         expect(await evaluate("'' >= 'abc'", presets)).to.equal(false);
    //         expect(await evaluate("'abc' >= 'abc'", presets)).to.equal(true);
    //         expect(await evaluate("'abd' >= 'abc'", presets)).to.equal(true);
    //         expect(await evaluate("'abc' >= 'ab'", presets)).to.equal(true);
    //         expect(await evaluate("'abc' >= ''", presets)).to.equal(true);
    //     });
    // 
    //     it("should return false if X and Y are both lists and X precedes Y lexicographically", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("[1,2,3] >= [4,5,6]", presets)).to.equal(false);
    //         expect(await evaluate("[1,2,3] >= [1,2,4]", presets)).to.equal(false);
    //         expect(await evaluate("[1,2] >= [1,2,4]", presets)).to.equal(false);
    //         expect(await evaluate("[] >= [1,2,3]", presets)).to.equal(false);
    //         expect(await evaluate("[1,2,3] >= [1,2,3]", presets)).to.equal(true);
    //         expect(await evaluate("[1,2,4] >= [1,2,3]", presets)).to.equal(true);
    //         expect(await evaluate("[1,2,4] >= [1,2]", presets)).to.equal(true);
    //         expect(await evaluate("[1,2,3] >= []", presets)).to.equal(true);
    //     });
    // 
    //     it("should return false if X is nothing and Y is not", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("() >= ()", presets)).to.equal(true);
    //         expect(await evaluate("() >= T", presets)).to.equal(false);
    //         expect(await evaluate("() >= F", presets)).to.equal(false);
    //         expect(await evaluate("() >= 1", presets)).to.equal(false);
    //         expect(await evaluate("() >= 'abc'", presets)).to.equal(false);
    //         expect(await evaluate("() >= ls", presets)).to.equal(false);
    //         expect(await evaluate("() >= ns", presets)).to.equal(false);
    //         expect(await evaluate("() >= fn", presets)).to.equal(false);
    //     });
    // 
    //     it("should return true if Y is nothing", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("() >= ()", presets)).to.equal(true);
    //         expect(await evaluate("T >= ()", presets)).to.equal(true);
    //         expect(await evaluate("F >= ()", presets)).to.equal(true);
    //         expect(await evaluate("1 >= ()", presets)).to.equal(true);
    //         expect(await evaluate("'abc' >= ()", presets)).to.equal(true);
    //         expect(await evaluate("ls >= ()", presets)).to.equal(true);
    //         expect(await evaluate("ns >= ()", presets)).to.equal(true);
    //         expect(await evaluate("fn >= ()", presets)).to.equal(true);
    //     });
    // 
    //     it("should return Undefined for any other type combination", async () => {
    //         var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x;
    //         for (let [L,R] of [
    //                 [T,n], [T,s], [T,ls], [T,ns], [T,fn],
    //                 [F,n], [F,s], [F,ls], [F,ns], [F,fn],
    //                 [n,T], [n,F], [n,s], [n,ns], [n,fn],
    //                 [s,T], [s,F], [s,n], [s,ls], [s,ns], [s,fn],
    //                 [ls,T], [ls,F], [ls,n], [ls,s], [ls,ns], [ls,fn],
    //                 [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn],
    //                 [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns] ]) {
    // 
    //             var LType = context.type(L);
    //             var RType = context.type(R);
    //             expect(await evaluate("L >= R", {L,R})).to.be.Undefined("comparison", L, R, new Position("L >= R", 2));
    //         }                        
    //     });
    // 
    //     it("should compare tuples with lexicographical criteria", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("(1,2,3) >= (4,5,6)", presets)).to.equal(false);
    //         expect(await evaluate("(1,2,3) >= (1,2,4)", presets)).to.equal(false);
    //         expect(await evaluate("(1,2) >= (1,2,4)", presets)).to.equal(false);
    //         expect(await evaluate("() >= (1,2,3)", presets)).to.equal(false);
    //         expect(await evaluate("(1,2,3) >= (1,2,3)", presets)).to.equal(true);
    //         expect(await evaluate("(1,2,4) >= (1,2,3)", presets)).to.equal(true);
    //         expect(await evaluate("(1,2,4) >= (1,2)", presets)).to.equal(true);
    //         expect(await evaluate("(1,2,3) >= ()", presets)).to.equal(true);
    //     });
    // });
    // 
    // describe("X > Y", () => {
    // 
    //     it("should return false if both X and Y are nothing", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("() > ()", presets)).to.equal(false);
    //     });
    // 
    //     it("should return true if X is true and Y is false", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("T > T", presets)).to.equal(false);
    //         expect(await evaluate("F > F", presets)).to.equal(false);
    //         expect(await evaluate("T > F", presets)).to.equal(true);
    //         expect(await evaluate("F > T", presets)).to.equal(false);
    //     });
    // 
    //     it("should return true if X is a higher number than Y", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("1 > 2", presets)).to.equal(false);
    //         expect(await evaluate("0 > 2", presets)).to.equal(false);
    //         expect(await evaluate("-1 > 2", presets)).to.equal(false);
    //         expect(await evaluate("2 > 1", presets)).to.equal(true);
    //         expect(await evaluate("2 > 0", presets)).to.equal(true);
    //         expect(await evaluate("2 > (-2)", presets)).to.equal(true);
    //         expect(await evaluate("2 > 2", presets)).to.equal(false);
    //     });
    // 
    //     it("should return true if X and Y are both strings and X follows Y alphabetically", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("'abc' > 'def'", presets)).to.equal(false);
    //         expect(await evaluate("'abc' > 'abd'", presets)).to.equal(false);
    //         expect(await evaluate("'ab' > 'abc'", presets)).to.equal(false);
    //         expect(await evaluate("'' > 'abc'", presets)).to.equal(false);
    //         expect(await evaluate("'abc' > 'abc'", presets)).to.equal(false);
    //         expect(await evaluate("'abd' > 'abc'", presets)).to.equal(true);
    //         expect(await evaluate("'abc' > 'ab'", presets)).to.equal(true);
    //         expect(await evaluate("'abc' > ''", presets)).to.equal(true);
    //     });
    // 
    //     it("should return true if X and Y are both lists and X follows Y lexicographically", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("[1,2,3] > [4,5,6]", presets)).to.equal(false);
    //         expect(await evaluate("[1,2,3] > [1,2,4]", presets)).to.equal(false);
    //         expect(await evaluate("[1,2] > [1,2,4]", presets)).to.equal(false);
    //         expect(await evaluate("[] > [1,2,3]", presets)).to.equal(false);
    //         expect(await evaluate("[1,2,3] > [1,2,3]", presets)).to.equal(false);
    //         expect(await evaluate("[1,2,4] > [1,2,3]", presets)).to.equal(true);
    //         expect(await evaluate("[1,2,4] > [1,2]", presets)).to.equal(true);
    //         expect(await evaluate("[1,2,3] > []", presets)).to.equal(true);
    //     });
    // 
    //     it("should return false if X is nothing", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("() > ()", presets)).to.equal(false);
    //         expect(await evaluate("() > T", presets)).to.equal(false);
    //         expect(await evaluate("() > F", presets)).to.equal(false);
    //         expect(await evaluate("() > 1", presets)).to.equal(false);
    //         expect(await evaluate("() > 'abc'", presets)).to.equal(false);
    //         expect(await evaluate("() > ls", presets)).to.equal(false);
    //         expect(await evaluate("() > ns", presets)).to.equal(false);
    //         expect(await evaluate("() > fn", presets)).to.equal(false);
    //     });
    // 
    //     it("should return true if Y is nothing and X is not", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("() > ()", presets)).to.equal(false);
    //         expect(await evaluate("T > ()", presets)).to.equal(true);
    //         expect(await evaluate("F > ()", presets)).to.equal(true);
    //         expect(await evaluate("1 > ()", presets)).to.equal(true);
    //         expect(await evaluate("'abc' > ()", presets)).to.equal(true);
    //         expect(await evaluate("ls > ()", presets)).to.equal(true);
    //         expect(await evaluate("ns > ()", presets)).to.equal(true);
    //         expect(await evaluate("fn > ()", presets)).to.equal(true);
    //     });
    // 
    //     it("should return Undefined for any other type combination", async () => {
    //         var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x;
    //         for (let [L,R] of [
    //                 [T,n], [T,s], [T,ls], [T,ns], [T,fn],
    //                 [F,n], [F,s], [F,ls], [F,ns], [F,fn],
    //                 [n,T], [n,F], [n,s], [n,ns], [n,fn],
    //                 [s,T], [s,F], [s,n], [s,ls], [s,ns], [s,fn],
    //                 [ls,T], [ls,F], [ls,n], [ls,s], [ls,ns], [ls,fn],
    //                 [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn],
    //                 [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns] ]) {
    // 
    //             var LType = context.type(L);
    //             var RType = context.type(R);
    //             expect(await evaluate("L > R", {L,R})).to.be.Undefined('comparison', L, R, new Position("L > R", 2));
    //         }                        
    //     });
    // 
    //     it("should compare tuples with lexicographical criteria", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("(1,2,3) > (4,5,6)", presets)).to.equal(false);
    //         expect(await evaluate("(1,2,3) > (1,2,4)", presets)).to.equal(false);
    //         expect(await evaluate("(1,2) > (1,2,4)", presets)).to.equal(false);
    //         expect(await evaluate("() > (1,2,3)", presets)).to.equal(false);
    //         expect(await evaluate("(1,2,3) > (1,2,3)", presets)).to.equal(false);
    //         expect(await evaluate("(1,2,4) > (1,2,3)", presets)).to.equal(true);
    //         expect(await evaluate("(1,2,4) > (1,2)", presets)).to.equal(true);
    //         expect(await evaluate("(1,2,3) > ()", presets)).to.equal(true);
    //     });
    // });
    // 
    // describe("X <= Y", () => {
    // 
    //     it("should return true if both X and Y are nothing", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("() <= ()", presets)).to.equal(true);
    //     });
    // 
    //     it("should return false if X is true and Y is false", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("T <= T", presets)).to.equal(true);
    //         expect(await evaluate("F <= F", presets)).to.equal(true);
    //         expect(await evaluate("T <= F", presets)).to.equal(false);
    //         expect(await evaluate("F <= T", presets)).to.equal(true);
    //     });
    // 
    //     it("should return false if X is a higher number than Y", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("1 <= 2", presets)).to.equal(true);
    //         expect(await evaluate("0 <= 2", presets)).to.equal(true);
    //         expect(await evaluate("-1 <= 2", presets)).to.equal(true);
    //         expect(await evaluate("2 <= 1", presets)).to.equal(false);
    //         expect(await evaluate("2 <= 0", presets)).to.equal(false);
    //         expect(await evaluate("2 <= (-2)", presets)).to.equal(false);
    //         expect(await evaluate("2 <= 2", presets)).to.equal(true);
    //     });
    // 
    //     it("should return false if X and Y are both strings and X follows Y alphabetically", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("'abc' <= 'def'", presets)).to.equal(true);
    //         expect(await evaluate("'abc' <= 'abd'", presets)).to.equal(true);
    //         expect(await evaluate("'ab' <= 'abc'", presets)).to.equal(true);
    //         expect(await evaluate("'' <= 'abc'", presets)).to.equal(true);
    //         expect(await evaluate("'abc' <= 'abc'", presets)).to.equal(true);
    //         expect(await evaluate("'abd' <= 'abc'", presets)).to.equal(false);
    //         expect(await evaluate("'abc' <= 'ab'", presets)).to.equal(false);
    //         expect(await evaluate("'abc' <= ''", presets)).to.equal(false);
    //     });
    // 
    //     it("should return false if X and Y are both lists and X follows Y lexicographically", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("[1,2,3] <= [4,5,6]", presets)).to.equal(true);
    //         expect(await evaluate("[1,2,3] <= [1,2,4]", presets)).to.equal(true);
    //         expect(await evaluate("[1,2] <= [1,2,4]", presets)).to.equal(true);
    //         expect(await evaluate("[] <= [1,2,3]", presets)).to.equal(true);
    //         expect(await evaluate("[1,2,3] <= [1,2,3]", presets)).to.equal(true);
    //         expect(await evaluate("[1,2,4] <= [1,2,3]", presets)).to.equal(false);
    //         expect(await evaluate("[1,2,4] <= [1,2]", presets)).to.equal(false);
    //         expect(await evaluate("[1,2,3] <= []", presets)).to.equal(false);
    //     });
    // 
    //     it("should return true if X is nothing", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("() <= ()", presets)).to.equal(true);
    //         expect(await evaluate("() <= T", presets)).to.equal(true);
    //         expect(await evaluate("() <= F", presets)).to.equal(true);
    //         expect(await evaluate("() <= 1", presets)).to.equal(true);
    //         expect(await evaluate("() <= 'abc'", presets)).to.equal(true);
    //         expect(await evaluate("() <= ls", presets)).to.equal(true);
    //         expect(await evaluate("() <= ns", presets)).to.equal(true);
    //         expect(await evaluate("() <= fn", presets)).to.equal(true);
    //     });
    // 
    //     it("should return false if Y is nothing and X is not", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("() <= ()", presets)).to.equal(true);
    //         expect(await evaluate("T <= ()", presets)).to.equal(false);
    //         expect(await evaluate("F <= ()", presets)).to.equal(false);
    //         expect(await evaluate("1 <= ()", presets)).to.equal(false);
    //         expect(await evaluate("'abc' <= ()", presets)).to.equal(false);
    //         expect(await evaluate("ls <= ()", presets)).to.equal(false);
    //         expect(await evaluate("ns <= ()", presets)).to.equal(false);
    //         expect(await evaluate("fn <= ()", presets)).to.equal(false);
    //     });
    // 
    //     it("should return Undefined for any other type combination", async () => {
    //         var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x;
    //         for (let [L,R] of [
    //                 [T,n], [T,s], [T,ls], [T,ns], [T,fn],
    //                 [F,n], [F,s], [F,ls], [F,ns], [F,fn],
    //                 [n,T], [n,F], [n,s], [n,ns], [n,fn],
    //                 [s,T], [s,F], [s,n], [s,ls], [s,ns], [s,fn],
    //                 [ls,T], [ls,F], [ls,n], [ls,s], [ls,ns], [ls,fn],
    //                 [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn],
    //                 [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns] ]) {
    // 
    //             var LType = context.type(L);
    //             var RType = context.type(R);
    //             expect(await evaluate("L <= R", {L,R})).to.be.Undefined("comparison", L, R, new Position("L <= R", 2));
    //         }                        
    //     });
    // 
    //     it("should compare tuples with lexicographical criteria", async () => {
    //         var presets = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
    //         expect(await evaluate("(1,2,3) <= (4,5,6)", presets)).to.equal(true);
    //         expect(await evaluate("(1,2,3) <= (1,2,4)", presets)).to.equal(true);
    //         expect(await evaluate("(1,2) <= (1,2,4)", presets)).to.equal(true);
    //         expect(await evaluate("() <= (1,2,3)", presets)).to.equal(true);
    //         expect(await evaluate("(1,2,3) <= (1,2,3)", presets)).to.equal(true);
    //         expect(await evaluate("(1,2,4) <= (1,2,3)", presets)).to.equal(false);
    //         expect(await evaluate("(1,2,4) <= (1,2)", presets)).to.equal(false);
    //         expect(await evaluate("(1,2,3) <= ()", presets)).to.equal(false);
    //     });
    // });
    // 
    // 
    // // FUNCTION composition
    // 
    // describe("G << F", () => {
    // 
    //     it("should return the function X -> G(F(X))", async () => {
    //         var presets = {f: x=>2*x, g: x=>[x]};
    //         var cf = await evaluate("g << f", presets);
    //         expect(cf).to.be.a("function");
    //         expect(await cf(2)).to.deep.equal([4]);
    //     });
    // 
    //     it("should work with tuples of functions", async () => {
    //         var presets = {f2: x=>2*x, f3: x=>3*x, f4: x=>4*x, g: (...x)=>[...Tuple(...x)]};
    //         var cf = await evaluate("g << (f2,f3,f4)", presets);
    //         expect(cf).to.be.a("function");
    //         expect(await cf(2)).to.deep.equal([4, 6, 8]);
    //     });
    // 
    //     it("should be righ-to-left associative", async () => {
    //         var presets = {f: x=>2*x, g: x=>x**2, h: x=>[x]};
    // 
    //         var cf = await evaluate("h << g << f", presets);
    //         expect(cf).to.be.a("function");
    //         expect(await cf(2)).to.deep.equal([16]);            
    // 
    //         var cf = await evaluate("h << f << g", presets);
    //         expect(cf).to.be.a("function");
    //         expect(await cf(2)).to.deep.equal([8]);            
    //     });
    // });
    // 
    // describe("F >> G", () => {
    // 
    //     it("should return the function X -> G(F(X))", async () => {
    //         var presets = {f: x=>2*x, g: x=>[x]};
    //         var cf = await evaluate("f >> g", presets);
    //         expect(cf).to.be.a("function");
    //         expect(await cf(2)).to.deep.equal([4]);            
    //     });
    // 
    //     it("should work with tuples of functions", async () => {
    //         var presets = {f2: x=>2*x, f3: x=>3*x, f4: x=>4*x, g: (...x)=>[...Tuple(...x)]};
    //         var cf = await evaluate("(f2,f3,f4) >> g", presets);
    //         expect(cf).to.be.a("function");
    //         expect(await cf(2)).to.deep.equal([4, 6, 8]);            
    //     });
    // });
    // 
    // 
    // // MISCELLANEOUS
    // 
    // describe("string templates", () => {
    // 
    //     it("should evaluate string literals between accent quotes '``'", async () => {
    //         expect(await evaluate("`ab\nc`")).to.equal("ab\nc");
    //         expect(await evaluate("``")).to.equal("");
    //     });
    // 
    //     it("should replace expressions between `${` and `}` with their value", async () => {
    //         expect(await evaluate("`aaa ${2*x} bbb`", {x:10})).to.equal("aaa 20 bbb");
    //     });
    // });
    // 
    // describe("X ?> F", () => {
    // 
    //     it("should return X if it is not undefined", async () => {
    //         for (let X of [true, false, 10, "abc", [], {}, x=>x]) {
    //             expect(await evaluate("X ?> 20", {X})).to.equal(X);
    //         }
    //     });
    // 
    //     it("should execute the function F with X.args as parameters if X is Undefined", async () => {
    //         var presets = {
    //             f: (operation, ...operands) => ['f result', operation, ...operands],
    //             u: new Undefined('op', 1, 2, 3)
    //         };
    //         expect(await evaluate(`u ?> f`, presets)).to.deep.equal(['f result', 'op', 1, 2, 3]);
    //     });
    // 
    //     it("should return Undefined if F is not a function", async () => {
    //         var presets = {u: new Undefined()};
    //         expect(await evaluate('u ?> 10', presets)).to.be.Undefined("application", 10);
    //     });
    // 
    //     it("should apply the operator to each item if X is a tuple", async () => {
    //         var presets = {
    //             f: (operation, ...operands) => ['f result', operation, ...operands],
    //             u: new Undefined('op', 1, 2, 3)
    //         };
    //         expect(await evaluate(`(10, u, 20) ?> f`, presets)).to.be.Tuple([10, ['f result', 'op', 1, 2, 3], 20]);            
    //     });
    // });
    // 
    // describe("operators precedence and grouping", () => {
    // 
    //     it("should execute assignment operations (`=`) before pairing operations (`,`)", async () => {
    //         var ctx = context.$extend();
    // 
    //         await parse("x = 1,2,3")(ctx);
    //         expect(ctx.x).to.equal(1);
    // 
    //         await parse("x = (1,2,3)")(ctx);
    //         expect(ctx.x).to.be.Tuple([1,2,3]);
    //     });
    // 
    //     it("should execute tuple mapping (`=>`) before assignment operations (`=`)", async () => {
    //         var ctx = context.$extend({doub:x=>2*x});
    //         await parse("t = (1,2) => doub")(ctx);
    //         expect(ctx.t).to.be.Tuple([2,4]);
    //     });
    // 
    //     it("should execute function definitions (`->`) before tuple mapping operations (`=>`) and assignment operations", async () => {
    //         var ctx = context.$extend();
    // 
    //         await parse("f = x -> [x]")(ctx);
    //         expect(ctx.f).to.be.a("function");
    //         expect(await ctx.f(1)).to.deep.equal([1]);
    // 
    //         var retval = await parse("1, f = x -> [x], 2")(ctx);
    //         expect(ctx.f).to.be.a("function");
    //         expect(retval).to.be.Tuple([1,2]);
    // 
    //         await parse("t = (1,2) => x -> [x]")(ctx);
    //         expect(ctx.t).to.be.Tuple([[1],[2]]);
    //     });
    // 
    //     it("should execure `;` operations before function definitions (`->`)", async () => {
    //         var ctx = context.$extend({T:true, F:false});
    //         expect(await parse("f = (x) -> x ; 1")(ctx)).to.equal(null);
    //         expect(await ctx.f(3)).to.equal(3);
    //         expect(await ctx.f()).to.equal(1);
    //     });
    // 
    //     it("should execure `?` operations before `;` operations", async () => {
    //         var ctx = context.$extend({T:true, F:false});
    //         expect(await parse("f = (x,y) -> x ? 1 ; y ? 2 ; 3")(ctx)).to.equal(null);
    //         expect(await ctx.f(true, false)).to.equal(1);
    //         expect(await ctx.f(true, true)).to.equal(1);
    //         expect(await ctx.f(false, true)).to.equal(2);
    //         expect(await ctx.f(false, false)).to.equal(3);
    //     });
    // 
    //     it("should execute logic operations (`&` and `|`) before `?` and `;` operations", async () => {
    //         var ctx = context.$extend({T:true, F:false});
    //         expect(await parse("f = (x,y) -> x & y ? 1 ; x | y ? 2 ; 3")(ctx)).to.equal(null);
    //         expect(await ctx.f(true, true)).to.equal(1);
    //         expect(await ctx.f(true, false)).to.equal(2);
    //         expect(await ctx.f(false, true)).to.equal(2);
    //         expect(await ctx.f(false, false)).to.equal(3);
    //     });
    // 
    //     it("should execute comparison operations (`==`,`!=`,`<`,`<=`,`>=`,`>`) before logic operations (`&` and `|`)", async () => {
    //         var ctx = context.$extend({T:true, F:false});
    //         expect(await parse("f = x -> x==0 ? 'null' ; 0.01<=x & x<0.1 ? 'small' ; 1000>x & x>=100 ? 'big' ; 'huge' ")(ctx)).to.equal(null);
    //         expect(await ctx.f(0)).to.equal('null');
    //         expect(await ctx.f(0.01)).to.equal('small');
    //         expect(await ctx.f(0.09)).to.equal('small');
    //         expect(await ctx.f(999)).to.equal('big');
    //         expect(await ctx.f(100)).to.equal('big');
    //         expect(await ctx.f(1000)).to.equal('huge');
    //     });
    // 
    //     it("should execute sum (`+`) and subtraction (`-`) operations before comparison operations (`==`,`!=`,`<`,`<=`,`>=`,`>`)", async () => {
    //         var ctx = context.$extend({T:true, F:false});
    //         expect(await parse("1+1<4 & 8-3==5")(ctx)).to.equal(true);
    //     });
    // 
    //     it("should execute product (`*`) division (`/`) and modulo (`%`) operations before sum and subtraction operations (`+` and `-`)", async () => {
    //         var ctx = context.$extend({T:true, F:false});
    //         expect(await parse("1+2*3-10/5+8%5")(ctx)).to.equal(8);
    //     });
    // 
    //     it("should execute exponentiation (`^`) operations before product (`*`) division (`/`) and modulo (`%`) operations", async () => {
    //         var ctx = context.$extend({T:true, F:false});
    //         expect(await parse("1+2*3^2-10/5+8%5")(ctx)).to.equal(20);
    //     });
    // 
    //     it("should execute subcontexting (`.`), function calls and referencing (`@`) before arithmetic operations", async () => {
    //         var ctx = context.$extend({double:x=>2*x, b:10});
    //         expect(await parse("double 2+3")(ctx)).to.equal(7);
    //         expect(await parse("double(2+3)")(ctx)).to.equal(10);
    // 
    //         expect(await parse("{a=1,b=2}.a+b")(ctx)).to.equal(11);
    //         expect(await parse("{a=1,b=2}.(a+b)")(ctx)).to.equal(3);
    // 
    //         expect(await parse("{f=x->2*x}.f 2")(ctx)).to.equal(4);
    //         expect(await parse("(x->{a=2*x}) 4 . a")(ctx)).to.equal(8);
    // 
    //         expect(await parse("[10,20,30] @ 1 + 1")(ctx)).to.equal(21);
    //     });
    // });
    // 
    // describe("undefined value", () => {
    // 
    //     it("should expose the constructor parametera tuple as 'args'", async () => {
    //         var u = await evaluate("undefined('name', 1, 2, 3)");
    //         expect(u).to.be.instanceof(Undefined);
    //         expect(u.args).to.be.Tuple(['name', 1,2,3]);
    //     });
    // });   
    // 
    // describe("lexer and parser errors", () => {
    // 
    //     it("should resolve an undefined value on lexer errors", async () => {
    // 
    //         // missing closing quote
    //         var u = await evaluate("\n'abc", {});
    //         expect(u).to.be.instanceof(Undefined);
    //         var args = Array.from(u.args);
    //         expect(args[0]).to.equal("failure");
    //         expect(args[1]).to.be.instanceof(Error);
    //         expect(args[1].message).to.equal("Closing quote expected @2:4");            
    // 
    //         // missing exponent
    //         var u = await evaluate("123E+", {});
    //         expect(u).to.be.instanceof(Undefined);
    //         var args = Array.from(u.args);
    //         expect(args[0]).to.equal("failure");
    //         expect(args[1]).to.be.instanceof(Error);
    //         expect(args[1].message).to.equal("Expected exponent value @1:5");            
    // 
    //         // invalid number
    //         var u = await evaluate("1abc", {});
    //         expect(u).to.be.instanceof(Undefined);
    //         var args = Array.from(u.args);
    //         expect(args[0]).to.equal("failure");
    //         expect(args[1]).to.be.instanceof(Error);
    //         expect(args[1].message).to.equal("Invalid number @1:0");            
    // 
    //         // unexpected period
    //         var u = await evaluate("12.34.56", {});
    //         expect(u).to.be.instanceof(Undefined);
    //         var args = Array.from(u.args);
    //         expect(args[0]).to.equal("failure");
    //         expect(args[1]).to.be.instanceof(Error);
    //         expect(args[1].message).to.equal("Unexpected period @1:5");
    // 
    //         // invalid name identifier
    //         var u = await evaluate("$a", {$a:1});
    //         expect(u).to.be.instanceof(Undefined);
    //         var args = Array.from(u.args);
    //         expect(args[0]).to.equal("failure");
    //         expect(args[1]).to.be.instanceof(Error);
    //         expect(args[1].message).to.equal("Unexpected character '$' @1:0");
    //     });
    // 
    //     it("should resolve an undefined value on parser errors", async () => {
    // 
    //         // operand expected
    //         var u = await evaluate("125 +", {});
    //         expect(u).to.be.instanceof(Undefined);
    //         var args = Array.from(u.args);
    //         expect(args[0]).to.equal("failure");
    //         expect(args[1]).to.be.instanceof(Error);
    //         expect(args[1].message).to.equal("Operand expected @1:5");
    // 
    //         // operand expected
    //         var u = await evaluate("(125 +", {});
    //         expect(u).to.be.instanceof(Undefined);
    //         var args = Array.from(u.args);
    //         expect(args[0]).to.equal("failure");
    //         expect(args[1]).to.be.instanceof(Error);
    //         expect(args[1].message).to.equal("Operand expected @1:6");
    // 
    //         // operand expected
    //         var u = await evaluate("125 + *", {});
    //         expect(u).to.be.instanceof(Undefined);
    //         var args = Array.from(u.args);
    //         expect(args[0]).to.equal("failure");
    //         expect(args[1]).to.be.instanceof(Error);
    //         expect(args[1].message).to.equal("Operand expected @1:6");
    //     });
    // });
});
