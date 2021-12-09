
const parse = require("../lib/interpreter");
const {Undefined, Tuple, wrap, unwrap} = require("../lib/types");

const chai = require("chai"), expect = chai.expect;
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
    
        
    
    // ARITHMETIC OPERATORS
    
    describe("X + Y", () => {
    
        it("should return Y if X is nothing", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false,
                    un: new Undefined()};
            expect(await parse("() + ()"   )(context)).to.equal(null);
            expect(await parse("() + T"    )(context)).to.equal(true);
            expect(await parse("() + F"    )(context)).to.equal(false);
            expect(await parse("() + 10"   )(context)).to.equal(10);
            expect(await parse("() + 'abc'")(context)).to.equal("abc");
            expect(await parse("() + fn"   )(context)).to.equal(context.fn);
            expect(await parse("() + ls"   )(context)).to.deep.equal([1,2,3]);
            expect(await parse("() + ns"   )(context)).to.deep.equal({a:1,b:2,c:3});
            expect(await parse("() + un"   )(context)).to.deep.equal(context.un);
            expect(await parse("() + (1,2)")(context)).to.be.Tuple([1,2]);
        });
    
        it("should return X if Y is nothing", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false,
                    un: new Undefined()};
            expect(await parse("() + ()"   )(context)).to.equal(null);
            expect(await parse("T + ()"    )(context)).to.equal(true);
            expect(await parse("F + ()"    )(context)).to.equal(false);
            expect(await parse("10 + ()"   )(context)).to.equal(10);
            expect(await parse("'abc' + ()")(context)).to.equal("abc");
            expect(await parse("fn + ()"   )(context)).to.equal(context.fn);
            expect(await parse("ls + ()"   )(context)).to.deep.equal([1,2,3]);
            expect(await parse("ns + ()"   )(context)).to.deep.equal({a:1,b:2,c:3});
            expect(await parse("un + ()"   )(context)).to.deep.equal(context.un);
            expect(await parse("(1,2) + ()")(context)).to.be.Tuple([1,2]);
        });
    
        it("should return `X||Y` if both X and Y are booleans", async () => {
            var context = {T:true, F:false};
            expect(await parse("T + T")(context)).to.be.true;
            expect(await parse("T + F")(context)).to.be.true;
            expect(await parse("F + T")(context)).to.be.true;
            expect(await parse("F + F")(context)).to.be.false;
        });
    
        it("should return `X+Y` if both X and Y are numbers", async () => {
            expect(await parse("10 + 1"   )()).to.equal(11);
            expect(await parse("10 + 0"   )()).to.equal(10);
            expect(await parse("10 + (-2)")()).to.equal(8);
        });
    
        it("should concatenate X and Y if they are both strings", async () => {
            expect(await parse("'abc' + 'def'")()).to.equal("abcdef");
            expect(await parse("'abc' + ''"   )()).to.equal("abc");
            expect(await parse("'' + 'def'"   )()).to.equal("def");
        });
    
        it("should concatenate X and Y if they are both lists", async () => {
            expect(await parse("[1,2,3] + [4,5,6]")()).to.deep.equal([1,2,3,4,5,6]);
            expect(await parse("[1,2,3] + []"     )()).to.deep.equal([1,2,3]);
            expect(await parse("[] + [4,5,6]"     )()).to.deep.equal([4,5,6]);
        });
    
        it("should merge X and Y if they are both namespaces", async () => {
            expect(await parse("{a=1,b=2} + {b=20,c=30}")()).to.deep.equal({a:1,b:20,c:30});
            expect(await parse("{a=1,b=2} + {}"         )()).to.deep.equal({a:1,b:2});
            expect(await parse("{} + {b=20,c=30}"       )()).to.deep.equal({b:20,c:30});
    
            var context = {
                ns1: {a:1, un: new Undefined()},
                ns2: {b:2, un: new Undefined()},
            }
            expect(await parse("ns1 + ns2")(context)).to.deep.equal({a:1, b:2, un:context.ns2.un});
        });
    
        it("should return Undefined for all the other type combinations", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined();
            for (let [L,R] of [
                    [T,n], [T,s], [T,ls], [T,ns], [T,fn], [T,u],
                    [F,n], [F,s], [F,ls], [F,ns], [F,fn], [F, u],
                    [n,T], [n,F], [n,s], [n,ls], [n,ns], [n,fn], [n,u],
                    [s,T], [s,F], [s,n], [s,ls], [s,ns], [s,fn], [s,u],
                    [ls,T], [ls,F], [ls,n], [ls,s], [ls,ns], [ls,fn], [ls,u],
                    [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn], [ns,u],
                    [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns], [fn,u],
                    [u,T], [u,F], [u,n], [u,s], [u,ls], [u,ns], [u,fn], [u,u] ]) {
    
                const undef = await parse("L + R")({L,R});
                expect(undef).to.be.Undefined('SumOperation');
                expect(undef.children[0].unwrap()).to.deep.equal(L);
                expect(undef.children[1].unwrap()).to.deep.equal(R);
            }
        });
    
        it("should return (x1+y1, x2+y2, ...) if X and/or Y is a tuple", async () => {
            var context = {T:true, F:false};
            expect(await parse("(T, 1, 'a', [1], {a=1}) + (F, 2, 'b', [2], {b=2})")(context)).to.be.Tuple([true, 3, "ab", [1,2], {a:1,b:2}])
            expect(await parse("(T, 1, 'a', [1], {a=1}) + (F, 2, 'b')"            )(context)).to.be.Tuple([true, 3, "ab", [1], {a:1}])
            expect(await parse("(T, 1, 'a') + (F, 2, 'b', [2], {b=2})"            )(context)).to.be.Tuple([true, 3, "ab", [2], {b:2}])
            expect(await parse("10 + (1, 2, 3)"                                   )(context)).to.be.Tuple([11, 2, 3])
            expect(await parse("(1, 2, 3) + 10"                                   )(context)).to.be.Tuple([11, 2, 3])
            
            // partial exception
            var tuple = await parse("(10,20,30) + (1,2,[])")();
            expect(Array.from(tuple)[0]).to.equal(11);
            expect(Array.from(tuple)[1]).to.equal(22);
            expect(Array.from(tuple)[2]).to.be.Undefined('SumOperation');
            expect(Array.from(tuple)[2].children[0].unwrap()).to.equal(30);
            expect(Array.from(tuple)[2].children[1].unwrap()).to.deep.equal([]);
        });
    });
    
    describe("X - Y", () => {
    
        it("should return X if Y is nothing", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("() - ()"   )(context)).to.equal(null);
            expect(await parse("T - ()"    )(context)).to.equal(true);
            expect(await parse("F - ()"    )(context)).to.equal(false);
            expect(await parse("10 - ()"   )(context)).to.equal(10);
            expect(await parse("'abc' - ()")(context)).to.equal("abc");
            expect(await parse("fn - ()"   )(context)).to.equal(context.fn);
            expect(await parse("ls - ()"   )(context)).to.deep.equal(context.ls);
            expect(await parse("ns - ()"   )(context)).to.deep.equal(context.ns);
            expect(await parse("(1,2) - ()")(context)).to.be.Tuple([1,2]);
        });
    
        it("should return Undefined if X is nothing", async () => {
            for (let R of [true, false, 10, 'abc', [1,2,3], {a:1}, x=>x]) {
                var undef = await parse("() - R")({R});
                expect(undef).to.be.Undefined('SubOperation');
                expect(undef.children[0].unwrap()).to.be.null;
                expect(undef.children[1].unwrap()).to.deep.equal(R);
            }
        });
    
        it("should return `X-Y` if both X and Y are numbers", async () => {
            expect(await parse("10 - 1"   )()).to.equal(9);
            expect(await parse("20 - 0"   )()).to.equal(20);
            expect(await parse("10 - (-7)")()).to.equal(17);
        });
    
        it("should return Undefined for all the other type combinations", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined();
            for (let [L,R] of [
                    [T,n], [T,s], [T,ls], [T,ns], [T,fn], [T,u],
                    [F,n], [F,s], [F,ls], [F,ns], [F,fn], [F,u],
                    [n,T], [n,F], [n,s], [n,ls], [n,ns], [n,fn], [n,u],
                    [s,T], [s,F], [s,n], [s,ls], [s,ns], [s,fn], [s,u],
                    [ls,T], [ls,F], [ls,n], [ls,s], [ls,ns], [ls,fn], [ls,u],
                    [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,fn], [ns,u],
                    [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns], [fn,u],
                    [u,T], [u,F], [u,n], [u,s], [u,ls], [u,ns], [u,fn], [u,u] ]) {
    
                var undef = await parse("L - R")({L,R});
                expect(undef).to.be.Undefined('SubOperation');
                expect(undef.children[0].unwrap()).to.deep.equal(L);
                expect(undef.children[1].unwrap()).to.deep.equal(R);
            }            
        });
    
        it("should return (x1-y1, x2-y2, ...) if X and/or Y is a tuple", async () => {
            expect(await parse("(10,20,30) - (1,2,3)")(context)).to.be.Tuple([9,18,27]);
            expect(await parse("(10,20,30) - (1,2)"  )(context)).to.be.Tuple([9,18,30]);
            expect(await parse("(10,20,30) - 1"      )(context)).to.be.Tuple([9,20,30]);
    
            // partial exception
            var tuple = await parse("(10,20,30) - (1,2,[])")();
            expect(Array.from(tuple)[0]).to.equal(9);
            expect(Array.from(tuple)[1]).to.equal(18);
            expect(Array.from(tuple)[2]).to.be.Undefined('SubOperation');
            expect(Array.from(tuple)[2].children[0].unwrap()).to.equal(30);
            expect(Array.from(tuple)[2].children[1].unwrap()).to.deep.equal([]);
        });
    });
    
    describe("X * Y", () => {
    
        it("should return () if either X or Y is nothing", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false,
                    un: new Undefined()};
    
            expect(await parse("() * ()"     )(context)).to.equal(null);
            expect(await parse("() * T"      )(context)).to.equal(null);
            expect(await parse("() * F"      )(context)).to.equal(null);
            expect(await parse("() * 10"     )(context)).to.equal(null);
            expect(await parse("() * 'abc'"  )(context)).to.equal(null);
            expect(await parse("() * fn"     )(context)).to.equal(null);
            expect(await parse("() * ls"     )(context)).to.equal(null);
            expect(await parse("() * ns"     )(context)).to.equal(null);
            expect(await parse("() * (1,2,3)")(context)).to.equal(null);
            expect(await parse("() * un"     )(context)).to.equal(null);
    
            expect(await parse("() * ()"     )(context)).to.equal(null);
            expect(await parse("T * ()"      )(context)).to.equal(null);
            expect(await parse("F * ()"      )(context)).to.equal(null);
            expect(await parse("10 * ()"     )(context)).to.equal(null);
            expect(await parse("'abc' * ()"  )(context)).to.equal(null);
            expect(await parse("fn * ()"     )(context)).to.equal(null);
            expect(await parse("ls * ()"     )(context)).to.equal(null);
            expect(await parse("ns * ()"     )(context)).to.equal(null);
            expect(await parse("(1,2,3) * ()")(context)).to.equal(null);
            expect(await parse("un * ()"     )(context)).to.equal(null);
        });
        
        it("should return Y if X is true", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false,
                    un: new Undefined()};
    
            expect(await parse("T * ()"   )(context)).to.equal(null);
            expect(await parse("T * T"    )(context)).to.equal(true);
            expect(await parse("T * F"    )(context)).to.equal(false);
            expect(await parse("T * 10"   )(context)).to.equal(10);
            expect(await parse("T * 'abc'")(context)).to.equal('abc');
            expect(await parse("T * fn"   )(context)).to.equal(context.fn);
            expect(await parse("T * ls"   )(context)).to.deep.equal(context.ls);
            expect(await parse("T * ns"   )(context)).to.deep.equal(context.ns);
            expect(await parse("T * un"   )(context)).to.equal(context.un);            
        });

        it("should return the void element of the Y type if X is false", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false,
                    un: new Undefined()};
    
            expect(await parse("F * ()"   )(context)).to.equal(null);
            expect(await parse("F * T"    )(context)).to.equal(false);
            expect(await parse("F * F"    )(context)).to.equal(false);
            expect(await parse("F * 10"   )(context)).to.equal(0);
            expect(await parse("F * 'abc'")(context)).to.equal('');
            expect(await parse("F * fn"   )(context)).to.equal(null);
            expect(await parse("F * ls"   )(context)).to.deep.equal([]);
            expect(await parse("F * ns"   )(context)).to.deep.equal({});
            expect(await parse("F * un"   )(context)).to.equal(null);                        
        });

        it("should return X if Y is true", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false,
                    un: new Undefined()};
    
            expect(await parse("() * T"   )(context)).to.equal(null);
            expect(await parse("10 * T"   )(context)).to.equal(10);
            expect(await parse("'abc' * T")(context)).to.equal('abc');
            expect(await parse("fn * T"   )(context)).to.equal(context.fn);
            expect(await parse("ls * T"   )(context)).to.deep.equal(context.ls);
            expect(await parse("ns * T"   )(context)).to.deep.equal(context.ns);
            expect(await parse("un * T"   )(context)).to.equal(context.un);                        
        });

        it("should return the void element of the X type if Y is false", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false,
                    un: new Undefined()};
    
            expect(await parse("() * F"   )(context)).to.equal(null);
            expect(await parse("10 * F"   )(context)).to.equal(0);
            expect(await parse("'abc' * F")(context)).to.equal('');
            expect(await parse("fn * F"   )(context)).to.equal(null);
            expect(await parse("ls * F"   )(context)).to.deep.equal([]);
            expect(await parse("ns * F"   )(context)).to.deep.equal({});
            expect(await parse("un * F"   )(context)).to.equal(null);                                    
        });
    
        it("should return `X*Y` if both X and Y are numbers", async () => {
            expect(await parse("10 * 2"   )()).to.equal(20);
            expect(await parse("10 * 0"   )()).to.equal(0);
            expect(await parse("10 * (-2)")()).to.equal(-20);
        });
        
        it("should return Undefined for all the other type combinations", async () => {
            var n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined();
            for (let [L,R] of [
                            [n, s], [n, ls], [n, ns], [n, fn], [n, u],
                    [s, n], [s, s], [s, ls], [s, ns], [s, fn], [s, u],
                    [ls,n], [ls,s], [ls,ls], [ls,ns], [ls,fn], [ls,u],
                    [ns,n], [ns,s], [ns,ls], [ns,ns], [ns,fn], [ns,u],
                    [fn,n], [fn,s], [fn,ls], [fn,ns], [fn,fn], [fn,u],
                    [u, n], [u, s], [u, ls], [u, ns], [u, fn], [u, u]]) {
    
                const undef = await parse("L * R")({L,R});
                expect(undef).to.be.Undefined("MulOperation");
                expect(undef.children[0].unwrap()).to.deep.equal(L);
                expect(undef.children[1].unwrap()).to.deep.equal(R);
            }                        
        });
    
        it("should return (x1*y1, x2*y2, ...) if X and/or Y is a tuple", async () => {
            var context = {T:true, F:false};
            expect(await parse("(T, 3) * (F, 2)"     )(context)).to.be.Tuple([false, 6]);
            expect(await parse("(10,20,30) * (2,3,4)")(context)).to.be.Tuple([20,60,120]);
            expect(await parse("(10,20,30) * (2,3)"  )(context)).to.be.Tuple([20,60]);
            expect(await parse("(10,20) * (2,3,4)"   )(context)).to.be.Tuple([20,60]);
            expect(await parse("10 * (2,3,4)"        )(context)).to.equal(20);
            expect(await parse("(10,20,30) * 2"      )(context)).to.equal(20);
    
            // partial exception
            var tuple = await parse("(10,20,30) * (1,2,{})")();
            expect(Array.from(tuple)[0]).to.equal(10);
            expect(Array.from(tuple)[1]).to.equal(40);
            expect(Array.from(tuple)[2]).to.be.Undefined('MulOperation');
            expect(Array.from(tuple)[2].children[0].unwrap()).to.equal(30);
            expect(Array.from(tuple)[2].children[1].unwrap()).to.deep.equal({});
        });
    });
    
    describe("X / Y", () => {
    
        it("should return () if X is nothing", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false,
                    un: new Undefined()};
    
            expect(await parse("() / ()"     )(context)).to.equal(null);
            expect(await parse("() / T"      )(context)).to.equal(null);
            expect(await parse("() / F"      )(context)).to.equal(null);
            expect(await parse("() / 10"     )(context)).to.equal(null);
            expect(await parse("() / 'abc'"  )(context)).to.equal(null);
            expect(await parse("() / fn"     )(context)).to.equal(null);
            expect(await parse("() / ls"     )(context)).to.equal(null);
            expect(await parse("() / ns"     )(context)).to.equal(null);
            expect(await parse("() / (1,2,3)")(context)).to.equal(null);
            expect(await parse("() / un"     )(context)).to.equal(null);
        });
        
        it("should return `X/Y` if both X and Y are numbers", async () => {
            expect(await parse("10 / 2"   )()).to.equal(5);
            expect(await parse("10 / 5"   )()).to.equal(2);
            expect(await parse("10 / (-2)")()).to.equal(-5);
            expect(await parse("10 / 0"   )()).to.equal(Infinity);
        });
        
        it("should return Undefined for all the other type combinations", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined(), no=null;
            for (let [L,R] of [
                    [T, T], [T, F], [T, n], [T, s], [T, ls], [T, ns], [T, fn], [T, u], [T, no],
                    [F, T], [F, F], [F, n], [F, s], [F, ls], [F, ns], [F, fn], [F, u], [F, no],
                    [n, T], [n, F],         [n, s], [n, ls], [n, ns], [n, fn], [n, u], [n, no],
                    [s, T], [s, F], [s, n], [s, s], [s, ls], [s, ns], [s, fn], [s, u], [s, no],
                    [ls,T], [ls,F], [ls,n], [ls,s], [ls,ls], [ls,ns], [ls,fn], [ls,u], [ls,no],
                    [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,ns], [ns,fn], [ns,u], [ns,no],
                    [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns], [fn,fn], [fn,u], [fn,no],
                    [u, T], [u, F], [u, n], [u, s], [u, ls], [u, ns], [u, fn], [u, u], [u, no]]) {
    
                const undef = await parse("L / R")({L,R});
                expect(undef).to.be.Undefined("DivOperation");
                expect(undef.children[0].unwrap()).to.deep.equal(L);
                expect(undef.children[1].unwrap()).to.deep.equal(R);
            }                        
        });
    
        it("should return (x1/y1, x2/y2, ...) if X and/or Y is a tuple", async () => {
            var context = {T:true, F:false};
            expect(await parse("(10,20,30) / (2,5,3)")(context)).to.be.Tuple([5,4,10]);
            expect(await parse("(10,20)    / (2,5,3)")(context)).to.be.Tuple([5,4]);
            expect(await parse("10         / (2,5,3)")(context)).to.equal(5);
    
            // partial exception
            var tuple = await parse("(10,20,30) / (2,5)")();
            expect(Array.from(tuple)[0]).to.equal(5);
            expect(Array.from(tuple)[1]).to.equal(4);
            expect(Array.from(tuple)[2]).to.be.Undefined('DivOperation');
            expect(Array.from(tuple)[2].children[0].unwrap()).to.equal(30);
            expect(Array.from(tuple)[2].children[1].unwrap()).to.equal(null);
        });
    });
    
    describe("X % Y", () => {
    
        it("should return Y if X is nothing", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false,
                    un: new Undefined()};
    
            expect(await parse("() % ()"     )(context)).to.equal(null);
            expect(await parse("() % T"      )(context)).to.equal(true);
            expect(await parse("() % F"      )(context)).to.equal(false);
            expect(await parse("() % 10"     )(context)).to.equal(10);
            expect(await parse("() % 'abc'"  )(context)).to.equal('abc');
            expect(await parse("() % fn"     )(context)).to.equal(context.fn);
            expect(await parse("() % ls"     )(context)).to.deep.equal(context.ls);
            expect(await parse("() % ns"     )(context)).to.deep.equal(context.ns);
            expect(await parse("() % un"     )(context)).to.equal(context.un);
        });
        
        it("should return `X%Y` if both X and Y are numbers", async () => {
            expect(await parse("10 % 3"   )()).to.equal(1);
            expect(await parse("10 % 4"   )()).to.equal(2);
            expect(await parse("10 % (-3)")()).to.equal(1);
        });
        
        it("should return Undefined for all the other type combinations", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined(), no=null;
            for (let [L,R] of [
                    [T, T], [T, F], [T, n], [T, s], [T, ls], [T, ns], [T, fn], [T, u], [T, no],
                    [F, T], [F, F], [F, n], [F, s], [F, ls], [F, ns], [F, fn], [F, u], [F, no],
                    [n, T], [n, F],         [n, s], [n, ls], [n, ns], [n, fn], [n, u], [n, no],
                    [s, T], [s, F], [s, n], [s, s], [s, ls], [s, ns], [s, fn], [s, u], [s, no],
                    [ls,T], [ls,F], [ls,n], [ls,s], [ls,ls], [ls,ns], [ls,fn], [ls,u], [ls,no],
                    [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,ns], [ns,fn], [ns,u], [ns,no],
                    [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns], [fn,fn], [fn,u], [fn,no],
                    [u, T], [u, F], [u, n], [u, s], [u, ls], [u, ns], [u, fn], [u, u], [u, no]]) {
    
                const undef = await parse("L % R")({L,R});
                expect(undef).to.be.Undefined("ModOperation");
                expect(undef.children[0].unwrap()).to.deep.equal(L);
                expect(undef.children[1].unwrap()).to.deep.equal(R);
            }                        
        });
    
        it("should return (x1%y1, x2%y2, ...) if X and/or Y is a tuple", async () => {
            var context = {T:true, F:false};
            expect(await parse("(10,20,30) % (3,7,4)")(context)).to.be.Tuple([1,6,2]);
            expect(await parse("(10,20)    % (3,7,4)")(context)).to.be.Tuple([1,6,4]);
            expect(await parse("10         % (3,7,4)")(context)).to.be.Tuple([1,7,4]);
    
            // partial exception
            var tuple = await parse("(10,20,30) % (3,7)")();
            expect(Array.from(tuple)[0]).to.equal(1);
            expect(Array.from(tuple)[1]).to.equal(6);
            expect(Array.from(tuple)[2]).to.be.Undefined('ModOperation');
            expect(Array.from(tuple)[2].children[0].unwrap()).to.equal(30);
            expect(Array.from(tuple)[2].children[1].unwrap()).to.equal(null);
        });
    });
    
    describe("X ^ Y", () => {
    
        it("should return () if X is nothing", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false,
                    un: new Undefined()};
    
            expect(await parse("() ^ ()"     )(context)).to.equal(null);
            expect(await parse("() ^ T"      )(context)).to.equal(null);
            expect(await parse("() ^ F"      )(context)).to.equal(null);
            expect(await parse("() ^ 10"     )(context)).to.equal(null);
            expect(await parse("() ^ 'abc'"  )(context)).to.equal(null);
            expect(await parse("() ^ fn"     )(context)).to.equal(null);
            expect(await parse("() ^ ls"     )(context)).to.equal(null);
            expect(await parse("() ^ ns"     )(context)).to.equal(null);
            expect(await parse("() ^ (1,2,3)")(context)).to.equal(null);
            expect(await parse("() ^ un"     )(context)).to.equal(null);
        });
        
        it("should return `X**Y` if both X and Y are numbers", async () => {
            expect(await parse("2 ^ 2"   )()).to.equal(4);
            expect(await parse("2 ^ 5"   )()).to.equal(32);
            expect(await parse("2 ^ (-2)")()).to.equal(0.25);
            expect(await parse("2 ^ 0"   )()).to.equal(1);
        });
        
        it("should return Undefined for all the other type combinations", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined(), no=null;
            for (let [L,R] of [
                    [T, T], [T, F], [T, n], [T, s], [T, ls], [T, ns], [T, fn], [T, u], [T, no],
                    [F, T], [F, F], [F, n], [F, s], [F, ls], [F, ns], [F, fn], [F, u], [F, no],
                    [n, T], [n, F],         [n, s], [n, ls], [n, ns], [n, fn], [n, u], [n, no],
                    [s, T], [s, F], [s, n], [s, s], [s, ls], [s, ns], [s, fn], [s, u], [s, no],
                    [ls,T], [ls,F], [ls,n], [ls,s], [ls,ls], [ls,ns], [ls,fn], [ls,u], [ls,no],
                    [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls], [ns,ns], [ns,fn], [ns,u], [ns,no],
                    [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns], [fn,fn], [fn,u], [fn,no],
                    [u, T], [u, F], [u, n], [u, s], [u, ls], [u, ns], [u, fn], [u, u], [u, no]]) {
    
                const undef = await parse("L ^ R")({L,R});
                expect(undef).to.be.Undefined("PowOperation");
                expect(undef.children[0].unwrap()).to.deep.equal(L);
                expect(undef.children[1].unwrap()).to.deep.equal(R);
            }                        
        });
    
        it("should return (x1**y1, x2**y2, ...) if X and/or Y is a tuple", async () => {
            var context = {T:true, F:false};
            expect(await parse("(2,3,4) ^ (2,4,3)")(context)).to.be.Tuple([4,81,64]);
            expect(await parse("(2,3)   ^ (2,4,3)")(context)).to.be.Tuple([4,81]);
            expect(await parse("2       ^ (2,4,3)")(context)).to.equal(4);
    
            // partial exception
            var tuple = await parse("(2,3,4) ^ (2,4)")();
            expect(Array.from(tuple)[0]).to.equal(4);
            expect(Array.from(tuple)[1]).to.equal(81);
            expect(Array.from(tuple)[2]).to.be.Undefined('PowOperation');
            expect(Array.from(tuple)[2].children[0].unwrap()).to.equal(4);
            expect(Array.from(tuple)[2].children[1].unwrap()).to.equal(null);
        });
    });



    // COMPARISON OPERATORS
    
    describe("X == Y", () => {
    
        it("should return true if both X and Y are nothing", async () => {
            expect(await parse("() == ()")()).to.equal(true);
        });
    
        it("should return true if X and Y are both true or both false", async () => {
            var context = {T:true, F:false};
            expect(await parse("T == T")(context)).to.equal(true);
            expect(await parse("F == F")(context)).to.equal(true);
            expect(await parse("T == F")(context)).to.equal(false);
            expect(await parse("F == T")(context)).to.equal(false);
        });
    
        it("should return true if X and Y are the same number", async () => {
            expect(await parse("3 == 3"  )()).to.equal(true);
            expect(await parse("0 == 0"  )()).to.equal(true);
            expect(await parse("-3 == -3")()).to.equal(true);
            expect(await parse("3 == 2"  )()).to.equal(false);
            expect(await parse("0 == -4" )()).to.equal(false);
        });
    
        it("should return true if X and Y are the same string", async () => {
            expect(await parse("'abc' == 'abc'")()).to.equal(true);
            expect(await parse("'' == ''"      )()).to.equal(true);
            expect(await parse("'abc' == 'def'")()).to.equal(false);
            expect(await parse("'abc' == ''"   )()).to.equal(false);
        });
    
        it("should return true if X and Y are both lists with equal items", async () => {
            expect(await parse("[1,2,3] == [1,2,3]")()).to.equal(true);
            expect(await parse("[] == []"          )()).to.equal(true);
            expect(await parse("[1,2,3] == [4,5,6]")()).to.equal(false);
            expect(await parse("[1,2,3] == []"     )()).to.equal(false);
        });
    
        it("should return true if X and Y are both namespaces with sname name:value pairs", async () => {
            expect(await parse("{a=1,b=2} == {a=1,b=2}")()).to.equal(true);
            expect(await parse("{} == {}"              )()).to.equal(true);
            expect(await parse("{a=1,b=2} == {a=1,c=2}")()).to.equal(false);
            expect(await parse("{a=1,b=2} == {a=1,b=3}")()).to.equal(false);
            expect(await parse("{a=1,b=2} == {a=1}"    )()).to.equal(false);
            expect(await parse("{a=1,b=2} == {}"       )()).to.equal(false);
            expect(await parse("{a=1} == {a=1,b=2}"    )()).to.equal(false);
            expect(await parse("{} == {a=1,b=2}"       )()).to.equal(false);
    
            // Should include inherited properties in the comparison
            var context = {};
            context.ns1 = {x:10};
            context.ns2 = Object.assign(Object.create(context.ns1), {y:20});
            expect(await parse("ns2 == {x:10,y:20}")(context)).to.equal(true);

            // Should ignore non-valid swan names
            var context = {};
            context.ns1 = {x:10, y:20};
            context.ns2 = {x:10, y:20, $z:30};
            expect(await parse("ns1 == ns2")(context)).to.equal(true);
        });
    
        it("should return true if X and Y are the same function", async () => {
            var context = {fn1:x=>2*x, fn2:x=>2*x};
            expect(await parse("fn1 == fn1"          )(context)).to.equal(true);
            expect(await parse("fn1 == fn2"          )(context)).to.equal(false);
            expect(await parse("(x->2*x) == (x->2*x)")(context)).to.equal(false);
            expect(await parse("(x->2*x) == fn1"     )(context)).to.equal(false);
            expect(await parse("fn1 == (x->2*x)"     )(context)).to.equal(false);
        });
    
        it("should return true if X and Y are the same Undefined object", async () => {
            var context = {un1: new Undefined(), un2: new Undefined};
            expect(await parse("un1 == un1")(context)).to.equal(true);
            expect(await parse("un1 == un2")(context)).to.equal(false);
        });
    
        it("should return false if X and Y are of different types", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined();
            for (let [L,R] of [
                                    [T, n], [T, s], [T, ls], [T, ns], [T, fn], [T, u],
                                    [F, n], [F, s], [F, ls], [F, ns], [F, fn], [F, u],
                    [n, T], [n, F],         [n, s], [n, ls], [n, ns], [n, fn], [n, u],
                    [s, T], [s, F], [s, n],         [s, ls], [s, ns], [s, fn], [s, u],
                    [ls,T], [ls,F], [ls,n], [ls,s],          [ls,ns], [ls,fn], [ls,u],
                    [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls],          [ns,fn], [ns,u],
                    [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns],          [fn,u],
                    [u, T], [u, F], [u, n], [u, s], [u, ls], [u, ns], [u,fn]         ]) {
    
                expect(await parse("L == R")({L,R})).to.be.false;
            }
        });
    
        it("should compare tuples with lexicographical criteria", async () => {
            expect(await parse("(1,2,3) == (1,2,3)")()).to.equal(true);
            expect(await parse("(1,2,3) == (1,2)"  )()).to.equal(false);
            expect(await parse("(1,2) == (1,2,3)"  )()).to.equal(false);
            expect(await parse("1 == (1,2,3)"      )()).to.equal(false);
            expect(await parse("(1,2,3) == 1"      )()).to.equal(false);
        });
    });
    
    describe("X != Y", () => {
    
        it("should return false if both X and Y are nothing", async () => {
            expect(await parse("() != ()")()).to.equal(false);
        });
    
        it("should return false if X and Y are both false or both true", async () => {
            var context = {T:true, F:false};
            expect(await parse("T != T")(context)).to.equal(false);
            expect(await parse("F != F")(context)).to.equal(false);
            expect(await parse("T != F")(context)).to.equal(true);
            expect(await parse("F != T")(context)).to.equal(true);
        });
    
        it("should return false if X and Y are the same number", async () => {
            expect(await parse("3 != 3"  )()).to.equal(false);
            expect(await parse("0 != 0"  )()).to.equal(false);
            expect(await parse("-3 != -3")()).to.equal(false);
            expect(await parse("3 != 2"  )()).to.equal(true);
            expect(await parse("0 != -4" )()).to.equal(true);
        });
    
        it("should return false if X and Y are the same string", async () => {
            expect(await parse("'abc' != 'abc'")()).to.equal(false);
            expect(await parse("'' != ''"      )()).to.equal(false);
            expect(await parse("'abc' != 'def'")()).to.equal(true);
            expect(await parse("'abc' != ''"   )()).to.equal(true);
        });
    
        it("should return false if X and Y are both lists with equal items", async () => {
            expect(await parse("[1,2,3] != [1,2,3]")()).to.equal(false);
            expect(await parse("[] != []"          )()).to.equal(false);
            expect(await parse("[1,2,3] != [4,5,6]")()).to.equal(true);
            expect(await parse("[1,2,3] != []"     )()).to.equal(true);
        });
    
        it("should return false if X and Y are both namespace with sname name:value pairs", async () => {
            expect(await parse("{a=1,b=2} != {a=1,b=2}")()).to.equal(false);
            expect(await parse("{} != {}"              )()).to.equal(false);
            expect(await parse("{a=1,b=2} != {a=1,c=2}")()).to.equal(true);
            expect(await parse("{a=1,b=2} != {a=1,b=3}")()).to.equal(true);
            expect(await parse("{a=1,b=2} != {a=1}"    )()).to.equal(true);
            expect(await parse("{a=1,b=2} != {}"       )()).to.equal(true);
            expect(await parse("{a=1} != {a=1,b=2}"    )()).to.equal(true);
            expect(await parse("{} != {a=1,b=2}"       )()).to.equal(true);
        });
    
        it("should return false if X and Y are the same function", async () => {
            var context = {fn1:x=>2*x, fn2:x=>2*x};
            expect(await parse("fn1 != fn1"          )(context)).to.equal(false);
            expect(await parse("fn1 != fn2"          )(context)).to.equal(true);
            expect(await parse("(x->2*x) != (x->2*x)")(context)).to.equal(true);
            expect(await parse("(x->2*x) != fn1"     )(context)).to.equal(true);
            expect(await parse("fn1 != (x->2*x)"     )(context)).to.equal(true);
        });
    
        it("should return false if X and Y are the same Undefined object", async () => {
            var context = {un1: new Undefined(), un2: new Undefined};
            expect(await parse("un1 != un1")(context)).to.equal(false);
            expect(await parse("un1 != un2")(context)).to.equal(true);
        });
    
        it("should return true if X and Y are of different types", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined();
            for (let [L,R] of [
                                    [T, n], [T, s], [T, ls], [T, ns], [T, fn], [T, u],
                                    [F, n], [F, s], [F, ls], [F, ns], [F, fn], [F, u],
                    [n, T], [n, F],         [n, s], [n, ls], [n, ns], [n, fn], [n, u],
                    [s, T], [s, F], [s, n],         [s, ls], [s, ns], [s, fn], [s, u],
                    [ls,T], [ls,F], [ls,n], [ls,s],          [ls,ns], [ls,fn], [ls,u],
                    [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls],          [ns,fn], [ns,u],
                    [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns],          [fn,u],
                    [u, T], [u, F], [u, n], [u, s], [u, ls], [u, ns], [u,fn]         ]) {
    
                expect(await parse("L != R")({L,R})).to.be.true;
            }
        });
    
        it("should compare tuples with lexicographical criteria", async () => {
            expect(await parse("(1,2,3) != (1,2,3)")()).to.equal(false);
            expect(await parse("(1,2,3) != (1,2)"  )()).to.equal(true);
            expect(await parse("(1,2) != (1,2,3)"  )()).to.equal(true);
            expect(await parse("1 != (1,2,3)"      )()).to.equal(true);
            expect(await parse("(1,2,3) != 1"      )()).to.equal(true);
        });
    });
    
    describe("X < Y", () => {
    
        it("should return false if both X and Y are nothing", async () => {
            expect(await parse("() < ()")()).to.equal(false);
        });
    
        it("should return true if X is false and Y is true", async () => {
            var context = {T:true, F:false};
            expect(await parse("T < T")(context)).to.equal(false);
            expect(await parse("F < F")(context)).to.equal(false);
            expect(await parse("T < F")(context)).to.equal(false);
            expect(await parse("F < T")(context)).to.equal(true);
        });
    
        it("should return true if X is a lower number than Y", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("1  < 2   ")(context)).to.equal(true);
            expect(await parse("0  < 2   ")(context)).to.equal(true);
            expect(await parse("-1 < 2   ")(context)).to.equal(true);
            expect(await parse("2  < 1   ")(context)).to.equal(false);
            expect(await parse("2  < 0   ")(context)).to.equal(false);
            expect(await parse("2  < (-2)")(context)).to.equal(false);
            expect(await parse("2  < 2   ")(context)).to.equal(false);
        });
    
        it("should return true if X and Y are both strings and X precedes Y alphabetically", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("'abc' < 'def'")(context)).to.equal(true);
            expect(await parse("'abc' < 'abd'")(context)).to.equal(true);
            expect(await parse("'ab'  < 'abc'")(context)).to.equal(true);
            expect(await parse("''    < 'abc'")(context)).to.equal(true);
            expect(await parse("'abc' < 'abc'")(context)).to.equal(false);
            expect(await parse("'abd' < 'abc'")(context)).to.equal(false);
            expect(await parse("'abc' < 'ab' ")(context)).to.equal(false);
            expect(await parse("'abc' < ''   ")(context)).to.equal(false);
        });
    
        it("should return true if X and Y are both lists and X precedes Y lexicographically", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("[1,2,3] < [4,5,6]")(context)).to.equal(true);
            expect(await parse("[1,2,3] < [1,2,4]")(context)).to.equal(true);
            expect(await parse("[1,2]   < [1,2,4]")(context)).to.equal(true);
            expect(await parse("[]      < [1,2,3]")(context)).to.equal(true);
            expect(await parse("[1,2,3] < [1,2,3]")(context)).to.equal(false);
            expect(await parse("[1,2,4] < [1,2,3]")(context)).to.equal(false);
            expect(await parse("[1,2,4] < [1,2]  ")(context)).to.equal(false);
            expect(await parse("[1,2,3] < []     ")(context)).to.equal(false);
        });
        
        it("should return false if both X and Y are namespaces", async () => {
            const context = {ns1:{}, ns2:{a:1}};
            expect(await parse("ns1 < ns2")(context)).to.be.false;
            expect(await parse("ns2 < ns1")(context)).to.be.false;
            expect(await parse("ns1 < ns1")(context)).to.be.false;
            expect(await parse("ns2 < ns2")(context)).to.be.false;
        });
    
        it("should return false if both X and Y are functions", async () => {
            const context = {fn1:x=>2*x, fn2:(x,y)=>x+y};
            expect(await parse("fn1 < fn2")(context)).to.be.false;
            expect(await parse("fn2 < fn1")(context)).to.be.false;
            expect(await parse("fn1 < fn1")(context)).to.be.false;
            expect(await parse("fn2 < fn2")(context)).to.be.false;
        });

        it("should return false if both X and Y are unfefined", async () => {
            const context = {un1:new Undefined("Op1",1,2), un2:new Undefined("Op2",1,2,3)};
            expect(await parse("un1 < un2")(context)).to.be.false;
            expect(await parse("un2 < un1")(context)).to.be.false;
            expect(await parse("un1 < un1")(context)).to.be.false;
            expect(await parse("un2 < un2")(context)).to.be.false;
        });

        it("should return true if X is nothing and Y is not", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("() < ()"    )(context)).to.equal(false);
            expect(await parse("() < T"     )(context)).to.equal(true);
            expect(await parse("() < F"     )(context)).to.equal(true);
            expect(await parse("() < 1"     )(context)).to.equal(true);
            expect(await parse("() < 'abc'" )(context)).to.equal(true);
            expect(await parse("() < ls"    )(context)).to.equal(true);
            expect(await parse("() < ns"    )(context)).to.equal(true);
            expect(await parse("() < fn"    )(context)).to.equal(true);
        });
    
        it("should return false if Y is nothing and X is not", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("()    < ()")(context)).to.equal(false);
            expect(await parse("T     < ()")(context)).to.equal(false);
            expect(await parse("F     < ()")(context)).to.equal(false);
            expect(await parse("1     < ()")(context)).to.equal(false);
            expect(await parse("'abc' < ()")(context)).to.equal(false);
            expect(await parse("ls    < ()")(context)).to.equal(false);
            expect(await parse("ns    < ()")(context)).to.equal(false);
            expect(await parse("fn    < ()")(context)).to.equal(false);
        });
    
        it("should return false for any other type combination", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined();
            for (let [L,R] of [
                                    [T, n], [T, s], [T, ls], [T, ns], [T, fn], [T, u],
                                    [F, n], [F, s], [F, ls], [F, ns], [F, fn], [F, u],
                    [n, T], [n, F],         [n, s], [n, ls], [n, ns], [n, fn], [n, u],
                    [s, T], [s, F], [s, n],         [s, ls], [s, ns], [s, fn], [s, u],
                    [ls,T], [ls,F], [ls,n], [ls,s],          [ls,ns], [ls,fn], [ls,u],
                    [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls],          [ns,fn], [ns,u],
                    [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns],          [fn,u],
                    [u, T], [u, F], [u, n], [u, s], [u, ls], [u, ns], [u, fn]        ]) {
    
                expect(await parse("L < R")({L,R})).to.be.false;
            }
        });
    
        it("should compare tuples with lexicographical criteria", async () => {
            expect(await parse("(1,2,3) < (4,5,6)")()).to.equal(true);
            expect(await parse("(1,2,3) < (1,2,4)")()).to.equal(true);
            expect(await parse("(1,2)   < (1,2,4)")()).to.equal(true);
            expect(await parse("()      < (1,2,3)")()).to.equal(true);
            expect(await parse("(1,2,3) < (1,2,3)")()).to.equal(false);
            expect(await parse("(1,2,4) < (1,2,3)")()).to.equal(false);
            expect(await parse("(1,2,4) < (1,2)  ")()).to.equal(false);
            expect(await parse("(1,2,3) < ()     ")()).to.equal(false);
        });
    });
    
    describe("X >= Y", () => {
    
        it("should return true if both X and Y are nothing", async () => {
            expect(await parse("() >= ()")()).to.equal(true);
        });
    
        it("should return true if X and Y are both booleans and X is true and Y either true or false", async () => {
            var context = {T:true, F:false};
            expect(await parse("T >= T")(context)).to.equal(true);
            expect(await parse("F >= F")(context)).to.equal(true);
            expect(await parse("T >= F")(context)).to.equal(true);
            expect(await parse("F >= T")(context)).to.equal(false);
        });
    
        it("should return true if X and Y are both numbers and X is a either a greater number than Y or equal to Y", async () => {
            expect(await parse("1  >= 2   ")()).to.equal(false);
            expect(await parse("0  >= 2   ")()).to.equal(false);
            expect(await parse("-1 >= 2   ")()).to.equal(false);
            expect(await parse("2  >= 1   ")()).to.equal(true);
            expect(await parse("2  >= 0   ")()).to.equal(true);
            expect(await parse("2  >= (-2)")()).to.equal(true);
            expect(await parse("2  >= 2   ")()).to.equal(true);
        });
    
        it("should return true if X and Y are both strings and X either precedes Y alphabetically or is equal to Y", async () => {
            expect(await parse("'abc' >= 'def'")()).to.equal(false);
            expect(await parse("'abc' >= 'abd'")()).to.equal(false);
            expect(await parse("'ab'  >= 'abc'")()).to.equal(false);
            expect(await parse("''    >= 'abc'")()).to.equal(false);
            expect(await parse("'abc' >= 'abc'")()).to.equal(true);
            expect(await parse("'abd' >= 'abc'")()).to.equal(true);
            expect(await parse("'abc' >= 'ab' ")()).to.equal(true);
            expect(await parse("'abc' >= ''   ")()).to.equal(true);
        });
    
        it("should return true if X and Y are both lists and either X preceeds Y lexicographically or is equal to Y", async () => {
            expect(await parse("[1,2,3] >= [4,5,6]")()).to.equal(false);
            expect(await parse("[1,2,3] >= [1,2,4]")()).to.equal(false);
            expect(await parse("[1,2]   >= [1,2,4]")()).to.equal(false);
            expect(await parse("[]      >= [1,2,3]")()).to.equal(false);
            expect(await parse("[1,2,3] >= [1,2,3]")()).to.equal(true);
            expect(await parse("[1,2,4] >= [1,2,3]")()).to.equal(true);
            expect(await parse("[1,2,4] >= [1,2]  ")()).to.equal(true);
            expect(await parse("[1,2,3] >= []     ")()).to.equal(true);
        });
    
        it("should return true if both X and Y are namespaces, but only if they are the same object", async () => {
            const context = {ns1:{}, ns2:{a:1}};
            expect(await parse("ns1 >= ns2")(context)).to.be.false;
            expect(await parse("ns2 >= ns1")(context)).to.be.false;
            expect(await parse("ns1 >= ns1")(context)).to.be.true;
            expect(await parse("ns2 >= ns2")(context)).to.be.true;
        });
    
        it("should return true if both X and Y are functions, but only if they are the same object", async () => {
            const context = {fn1:x=>2*x, fn2:(x,y)=>x+y};
            expect(await parse("fn1 >= fn2")(context)).to.be.false;
            expect(await parse("fn2 >= fn1")(context)).to.be.false;
            expect(await parse("fn1 >= fn1")(context)).to.be.true;
            expect(await parse("fn2 >= fn2")(context)).to.be.true;
        });

        it("should return true if both X and Y are unfefined, but only if they are the same object", async () => {
            const context = {un1:new Undefined("Op1",1,2), un2:new Undefined("Op2",1,2,3)};
            expect(await parse("un1 >= un2")(context)).to.be.false;
            expect(await parse("un2 >= un1")(context)).to.be.false;
            expect(await parse("un1 >= un1")(context)).to.be.true;
            expect(await parse("un2 >= un2")(context)).to.be.true;
        });

        it("should return false if X is nothing and Y is not", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("() >= ()   ")(context)).to.equal(true);
            expect(await parse("() >= T    ")(context)).to.equal(false);
            expect(await parse("() >= F    ")(context)).to.equal(false);
            expect(await parse("() >= 1    ")(context)).to.equal(false);
            expect(await parse("() >= 'abc'")(context)).to.equal(false);
            expect(await parse("() >= ls   ")(context)).to.equal(false);
            expect(await parse("() >= ns   ")(context)).to.equal(false);
            expect(await parse("() >= fn   ")(context)).to.equal(false);
        });
    
        it("should return true if Y is nothing", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("()    >= ()")(context)).to.equal(true);
            expect(await parse("T     >= ()")(context)).to.equal(true);
            expect(await parse("F     >= ()")(context)).to.equal(true);
            expect(await parse("1     >= ()")(context)).to.equal(true);
            expect(await parse("'abc' >= ()")(context)).to.equal(true);
            expect(await parse("ls    >= ()")(context)).to.equal(true);
            expect(await parse("ns    >= ()")(context)).to.equal(true);
            expect(await parse("fn    >= ()")(context)).to.equal(true);
        });
    
        it("should return false for any other type combination", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined();
            for (let [L,R] of [
                                    [T, n], [T, s], [T, ls], [T, ns], [T, fn], [T, u],
                                    [F, n], [F, s], [F, ls], [F, ns], [F, fn], [F, u],
                    [n, T], [n, F],         [n, s], [n, ls], [n, ns], [n, fn], [n, u],
                    [s, T], [s, F], [s, n],         [s, ls], [s, ns], [s, fn], [s, u],
                    [ls,T], [ls,F], [ls,n], [ls,s],          [ls,ns], [ls,fn], [ls,u],
                    [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls],          [ns,fn], [ns,u],
                    [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns],          [fn,u],
                    [u, T], [u, F], [u, n], [u, s], [u, ls], [u, ns], [u, fn]        ]) {
    
                expect(await parse("L >= R")({L,R})).to.be.false;
            }
        });
    
        it("should compare tuples with lexicographical criteria", async () => {
            expect(await parse("(1,2,3) >= (4,5,6)")()).to.equal(false);
            expect(await parse("(1,2,3) >= (1,2,4)")()).to.equal(false);
            expect(await parse("(1,2)   >= (1,2,4)")()).to.equal(false);
            expect(await parse("()      >= (1,2,3)")()).to.equal(false);
            expect(await parse("(1,2,3) >= (1,2,3)")()).to.equal(true);
            expect(await parse("(1,2,4) >= (1,2,3)")()).to.equal(true);
            expect(await parse("(1,2,4) >= (1,2)  ")()).to.equal(true);
            expect(await parse("(1,2,3) >= ()     ")()).to.equal(true);
        });
    });
    
    describe("X > Y", () => {
    
        it("should return false if both X and Y are nothing", async () => {
            expect(await parse("() > ()")()).to.equal(false);
        });
    
        it("should return true if X is true and Y is false", async () => {
            var context = {T:true, F:false};
            expect(await parse("T > T")(context)).to.equal(false);
            expect(await parse("F > F")(context)).to.equal(false);
            expect(await parse("T > F")(context)).to.equal(true);
            expect(await parse("F > T")(context)).to.equal(false);
        });
    
        it("should return true if X is a higher number than Y", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("1  > 2   ")(context)).to.equal(false);
            expect(await parse("0  > 2   ")(context)).to.equal(false);
            expect(await parse("-1 > 2   ")(context)).to.equal(false);
            expect(await parse("2  > 1   ")(context)).to.equal(true);
            expect(await parse("2  > 0   ")(context)).to.equal(true);
            expect(await parse("2  > (-2)")(context)).to.equal(true);
            expect(await parse("2  > 2   ")(context)).to.equal(false);
        });
    
        it("should return true if X and Y are both strings and X precedes Y alphabetically", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("'abc' > 'def'")(context)).to.equal(false);
            expect(await parse("'abc' > 'abd'")(context)).to.equal(false);
            expect(await parse("'ab'  > 'abc'")(context)).to.equal(false);
            expect(await parse("''    > 'abc'")(context)).to.equal(false);
            expect(await parse("'abc' > 'abc'")(context)).to.equal(false);
            expect(await parse("'abd' > 'abc'")(context)).to.equal(true);
            expect(await parse("'abc' > 'ab' ")(context)).to.equal(true);
            expect(await parse("'abc' > ''   ")(context)).to.equal(true);
        });
    
        it("should return true if X and Y are both lists and X follows Y lexicographically", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("[1,2,3] > [4,5,6]")(context)).to.equal(false);
            expect(await parse("[1,2,3] > [1,2,4]")(context)).to.equal(false);
            expect(await parse("[1,2]   > [1,2,4]")(context)).to.equal(false);
            expect(await parse("[]      > [1,2,3]")(context)).to.equal(false);
            expect(await parse("[1,2,3] > [1,2,3]")(context)).to.equal(false);
            expect(await parse("[1,2,4] > [1,2,3]")(context)).to.equal(true);
            expect(await parse("[1,2,4] > [1,2]  ")(context)).to.equal(true);
            expect(await parse("[1,2,3] > []     ")(context)).to.equal(true);
        });
        
        it("should return false if both X and Y are namespaces", async () => {
            const context = {ns1:{}, ns2:{a:1}};
            expect(await parse("ns1 > ns2")(context)).to.be.false;
            expect(await parse("ns2 > ns1")(context)).to.be.false;
            expect(await parse("ns1 > ns1")(context)).to.be.false;
            expect(await parse("ns2 > ns2")(context)).to.be.false;
        });
    
        it("should return false if both X and Y are functions", async () => {
            const context = {fn1:x=>2*x, fn2:(x,y)=>x+y};
            expect(await parse("fn1 > fn2")(context)).to.be.false;
            expect(await parse("fn2 > fn1")(context)).to.be.false;
            expect(await parse("fn1 > fn1")(context)).to.be.false;
            expect(await parse("fn2 > fn2")(context)).to.be.false;
        });

        it("should return false if both X and Y are unfefined", async () => {
            const context = {un1:new Undefined("Op1",1,2), un2:new Undefined("Op2",1,2,3)};
            expect(await parse("un1 > un2")(context)).to.be.false;
            expect(await parse("un2 > un1")(context)).to.be.false;
            expect(await parse("un1 > un1")(context)).to.be.false;
            expect(await parse("un2 > un2")(context)).to.be.false;
        });

        it("should return false if X is nothing", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("() > ()"    )(context)).to.equal(false);
            expect(await parse("() > T"     )(context)).to.equal(false);
            expect(await parse("() > F"     )(context)).to.equal(false);
            expect(await parse("() > 1"     )(context)).to.equal(false);
            expect(await parse("() > 'abc'" )(context)).to.equal(false);
            expect(await parse("() > ls"    )(context)).to.equal(false);
            expect(await parse("() > ns"    )(context)).to.equal(false);
            expect(await parse("() > fn"    )(context)).to.equal(false);
        });
    
        it("should return true if Y is nothing and X is not", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("()    > ()")(context)).to.equal(false);
            expect(await parse("T     > ()")(context)).to.equal(true);
            expect(await parse("F     > ()")(context)).to.equal(true);
            expect(await parse("1     > ()")(context)).to.equal(true);
            expect(await parse("'abc' > ()")(context)).to.equal(true);
            expect(await parse("ls    > ()")(context)).to.equal(true);
            expect(await parse("ns    > ()")(context)).to.equal(true);
            expect(await parse("fn    > ()")(context)).to.equal(true);
        });
    
        it("should return false for any other type combination", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined();
            for (let [L,R] of [
                                    [T, n], [T, s], [T, ls], [T, ns], [T, fn], [T, u],
                                    [F, n], [F, s], [F, ls], [F, ns], [F, fn], [F, u],
                    [n, T], [n, F],         [n, s], [n, ls], [n, ns], [n, fn], [n, u],
                    [s, T], [s, F], [s, n],         [s, ls], [s, ns], [s, fn], [s, u],
                    [ls,T], [ls,F], [ls,n], [ls,s],          [ls,ns], [ls,fn], [ls,u],
                    [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls],          [ns,fn], [ns,u],
                    [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns],          [fn,u],
                    [u, T], [u, F], [u, n], [u, s], [u, ls], [u, ns], [u, fn]        ]) {
    
                expect(await parse("L > R")({L,R})).to.be.false;
            }
        });
    
        it("should compare tuples with lexicographical criteria", async () => {
            expect(await parse("(1,2,3) > (4,5,6)")()).to.equal(false);
            expect(await parse("(1,2,3) > (1,2,4)")()).to.equal(false);
            expect(await parse("(1,2)   > (1,2,4)")()).to.equal(false);
            expect(await parse("()      > (1,2,3)")()).to.equal(false);
            expect(await parse("(1,2,3) > (1,2,3)")()).to.equal(false);
            expect(await parse("(1,2,4) > (1,2,3)")()).to.equal(true);
            expect(await parse("(1,2,4) > (1,2)  ")()).to.equal(true);
            expect(await parse("(1,2,3) > ()     ")()).to.equal(true);
        });
    });
    
    describe("X <= Y", () => {
    
        it("should return true if both X and Y are nothing", async () => {
            expect(await parse("() <= ()")()).to.equal(true);
        });
    
        it("should return true if X and Y are both booleans and X is false and Y either true or false", async () => {
            var context = {T:true, F:false};
            expect(await parse("T <= T")(context)).to.equal(true);
            expect(await parse("F <= F")(context)).to.equal(true);
            expect(await parse("T <= F")(context)).to.equal(false);
            expect(await parse("F <= T")(context)).to.equal(true);
        });
    
        it("should return true if X and Y are both numbers and X is a either a smaller number than Y or equal to Y", async () => {
            expect(await parse("1  <= 2   ")()).to.equal(true);
            expect(await parse("0  <= 2   ")()).to.equal(true);
            expect(await parse("-1 <= 2   ")()).to.equal(true);
            expect(await parse("2  <= 1   ")()).to.equal(false);
            expect(await parse("2  <= 0   ")()).to.equal(false);
            expect(await parse("2  <= (-2)")()).to.equal(false);
            expect(await parse("2  <= 2   ")()).to.equal(true);
        });
    
        it("should return true if X and Y are both strings and X either follows Y alphabetically or is equal to Y", async () => {
            expect(await parse("'abc' <= 'def'")()).to.equal(true);
            expect(await parse("'abc' <= 'abd'")()).to.equal(true);
            expect(await parse("'ab'  <= 'abc'")()).to.equal(true);
            expect(await parse("''    <= 'abc'")()).to.equal(true);
            expect(await parse("'abc' <= 'abc'")()).to.equal(true);
            expect(await parse("'abd' <= 'abc'")()).to.equal(false);
            expect(await parse("'abc' <= 'ab' ")()).to.equal(false);
            expect(await parse("'abc' <= ''   ")()).to.equal(false);
        });
    
        it("should return true if X and Y are both lists and either X preceeds Y lexicographically or is equal to Y", async () => {
            expect(await parse("[1,2,3] <= [4,5,6]")()).to.equal(true);
            expect(await parse("[1,2,3] <= [1,2,4]")()).to.equal(true);
            expect(await parse("[1,2]   <= [1,2,4]")()).to.equal(true);
            expect(await parse("[]      <= [1,2,3]")()).to.equal(true);
            expect(await parse("[1,2,3] <= [1,2,3]")()).to.equal(true);
            expect(await parse("[1,2,4] <= [1,2,3]")()).to.equal(false);
            expect(await parse("[1,2,4] <= [1,2]  ")()).to.equal(false);
            expect(await parse("[1,2,3] <= []     ")()).to.equal(false);
        });
    
        it("should return true if both X and Y are namespaces, but only if they are the same object", async () => {
            const context = {ns1:{}, ns2:{a:1}};
            expect(await parse("ns1 <= ns2")(context)).to.be.false;
            expect(await parse("ns2 <= ns1")(context)).to.be.false;
            expect(await parse("ns1 <= ns1")(context)).to.be.true;
            expect(await parse("ns2 <= ns2")(context)).to.be.true;
        });
    
        it("should return true if both X and Y are functions, but only if they are the same object", async () => {
            const context = {fn1:x=>2*x, fn2:(x,y)=>x+y};
            expect(await parse("fn1 <= fn2")(context)).to.be.false;
            expect(await parse("fn2 <= fn1")(context)).to.be.false;
            expect(await parse("fn1 <= fn1")(context)).to.be.true;
            expect(await parse("fn2 <= fn2")(context)).to.be.true;
        });

        it("should return true if both X and Y are unfefined, but only if they are the same object", async () => {
            const context = {un1:new Undefined("Op1",1,2), un2:new Undefined("Op2",1,2,3)};
            expect(await parse("un1 <= un2")(context)).to.be.false;
            expect(await parse("un2 <= un1")(context)).to.be.false;
            expect(await parse("un1 <= un1")(context)).to.be.true;
            expect(await parse("un2 <= un2")(context)).to.be.true;
        });

        it("should return true if X is nothing", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("() <= ()   ")(context)).to.equal(true);
            expect(await parse("() <= T    ")(context)).to.equal(true);
            expect(await parse("() <= F    ")(context)).to.equal(true);
            expect(await parse("() <= 1    ")(context)).to.equal(true);
            expect(await parse("() <= 'abc'")(context)).to.equal(true);
            expect(await parse("() <= ls   ")(context)).to.equal(true);
            expect(await parse("() <= ns   ")(context)).to.equal(true);
            expect(await parse("() <= fn   ")(context)).to.equal(true);
        });
    
        it("should return false if Y is nothing and X is not", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("()    <= ()")(context)).to.equal(true);
            expect(await parse("T     <= ()")(context)).to.equal(false);
            expect(await parse("F     <= ()")(context)).to.equal(false);
            expect(await parse("1     <= ()")(context)).to.equal(false);
            expect(await parse("'abc' <= ()")(context)).to.equal(false);
            expect(await parse("ls    <= ()")(context)).to.equal(false);
            expect(await parse("ns    <= ()")(context)).to.equal(false);
            expect(await parse("fn    <= ()")(context)).to.equal(false);
        });
    
        it("should return false for any other type combination", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined();
            for (let [L,R] of [
                                    [T, n], [T, s], [T, ls], [T, ns], [T, fn], [T, u],
                                    [F, n], [F, s], [F, ls], [F, ns], [F, fn], [F, u],
                    [n, T], [n, F],         [n, s], [n, ls], [n, ns], [n, fn], [n, u],
                    [s, T], [s, F], [s, n],         [s, ls], [s, ns], [s, fn], [s, u],
                    [ls,T], [ls,F], [ls,n], [ls,s],          [ls,ns], [ls,fn], [ls,u],
                    [ns,T], [ns,F], [ns,n], [ns,s], [ns,ls],          [ns,fn], [ns,u],
                    [fn,T], [fn,F], [fn,n], [fn,s], [fn,ls], [fn,ns],          [fn,u],
                    [u, T], [u, F], [u, n], [u, s], [u, ls], [u, ns], [u, fn]        ]) {
    
                expect(await parse("L <= R")({L,R})).to.be.false;
            }
        });
    
        it("should compare tuples with lexicographical criteria", async () => {
            expect(await parse("(1,2,3) <= (4,5,6)")()).to.equal(true);
            expect(await parse("(1,2,3) <= (1,2,4)")()).to.equal(true);
            expect(await parse("(1,2)   <= (1,2,4)")()).to.equal(true);
            expect(await parse("()      <= (1,2,3)")()).to.equal(true);
            expect(await parse("(1,2,3) <= (1,2,3)")()).to.equal(true);
            expect(await parse("(1,2,4) <= (1,2,3)")()).to.equal(false);
            expect(await parse("(1,2,4) <= (1,2)  ")()).to.equal(false);
            expect(await parse("(1,2,3) <= ()     ")()).to.equal(false);
        });
    });
    
    
    
    // MISCELLANEOUS
    
    describe.skip("string templates", () => {
    
        it("should evaluate string literals between accent quotes '``'", async () => {
            expect(await parse("`ab\nc`")).to.equal("ab\nc");
            expect(await parse("``")).to.equal("");
        });
    
        it("should replace expressions between `${` and `}` with their value", async () => {
            expect(await parse("`aaa ${2*x} bbb`", {x:10})).to.equal("aaa 20 bbb");
        });
    });
    
    describe.skip("precedence", () => {
    
        it("should execute assignment operations (`=`) before pairing operations (`,`)", async () => {
            var ctx = context.$extend();
    
            await parse("x = 1,2,3")(ctx);
            expect(ctx.x).to.equal(1);
    
            await parse("x = (1,2,3)")(ctx);
            expect(ctx.x).to.be.Tuple([1,2,3]);
        });
    
        it("should execute tuple mapping (`=>`) before assignment operations (`=`)", async () => {
            var ctx = context.$extend({doub:x=>2*x});
            await parse("t = (1,2) => doub")(ctx);
            expect(ctx.t).to.be.Tuple([2,4]);
        });
    
        it("should execute function definitions (`->`) before tuple mapping operations (`=>`) and assignment operations", async () => {
            var ctx = context.$extend();
    
            await parse("f = x -> [x]")(ctx);
            expect(ctx.f).to.be.a("function");
            expect(await ctx.f(1)).to.deep.equal([1]);
    
            var retval = await parse("1, f = x -> [x], 2")(ctx);
            expect(ctx.f).to.be.a("function");
            expect(retval).to.be.Tuple([1,2]);
    
            await parse("t = (1,2) => x -> [x]")(ctx);
            expect(ctx.t).to.be.Tuple([[1],[2]]);
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
    
        it("should execute subcontexting (`.`), function calls and referencing (`@`) before arithmetic operations", async () => {
            var ctx = context.$extend({double:x=>2*x, b:10});
            expect(await parse("double 2+3")(ctx)).to.equal(7);
            expect(await parse("double(2+3)")(ctx)).to.equal(10);
    
            expect(await parse("{a=1,b=2}.a+b")(ctx)).to.equal(11);
            expect(await parse("{a=1,b=2}.(a+b)")(ctx)).to.equal(3);
    
            expect(await parse("{f=x->2*x}.f 2")(ctx)).to.equal(4);
            expect(await parse("(x->{a=2*x}) 4 . a")(ctx)).to.equal(8);
    
            expect(await parse("[10,20,30] @ 1 + 1")(ctx)).to.equal(21);
        });
    });

    describe.skip("parsing errors", () => {
    
        it("should resolve an undefined value on lexer errors", async () => {
    
            // missing closing quote
            var u = await parse("\n'abc", {});
            expect(u).to.be.instanceof(Undefined);
            var args = Array.from(u.args);
            expect(args[0]).to.equal("failure");
            expect(args[1]).to.be.instanceof(Error);
            expect(args[1].message).to.equal("Closing quote expected @2:4");            
    
            // missing exponent
            var u = await parse("123E+", {});
            expect(u).to.be.instanceof(Undefined);
            var args = Array.from(u.args);
            expect(args[0]).to.equal("failure");
            expect(args[1]).to.be.instanceof(Error);
            expect(args[1].message).to.equal("Expected exponent value @1:5");            
    
            // invalid number
            var u = await parse("1abc", {});
            expect(u).to.be.instanceof(Undefined);
            var args = Array.from(u.args);
            expect(args[0]).to.equal("failure");
            expect(args[1]).to.be.instanceof(Error);
            expect(args[1].message).to.equal("Invalid number @1:0");            
    
            // unexpected period
            var u = await parse("12.34.56", {});
            expect(u).to.be.instanceof(Undefined);
            var args = Array.from(u.args);
            expect(args[0]).to.equal("failure");
            expect(args[1]).to.be.instanceof(Error);
            expect(args[1].message).to.equal("Unexpected period @1:5");
    
            // invalid name identifier
            var u = await parse("$a", {$a:1});
            expect(u).to.be.instanceof(Undefined);
            var args = Array.from(u.args);
            expect(args[0]).to.equal("failure");
            expect(args[1]).to.be.instanceof(Error);
            expect(args[1].message).to.equal("Unexpected character '$' @1:0");
        });
    
        it("should resolve an undefined value on parser errors", async () => {
    
            // operand expected
            var u = await parse("125 +", {});
            expect(u).to.be.instanceof(Undefined);
            var args = Array.from(u.args);
            expect(args[0]).to.equal("failure");
            expect(args[1]).to.be.instanceof(Error);
            expect(args[1].message).to.equal("Operand expected @1:5");
    
            // operand expected
            var u = await parse("(125 +", {});
            expect(u).to.be.instanceof(Undefined);
            var args = Array.from(u.args);
            expect(args[0]).to.equal("failure");
            expect(args[1]).to.be.instanceof(Error);
            expect(args[1].message).to.equal("Operand expected @1:6");
    
            // operand expected
            var u = await parse("125 + *", {});
            expect(u).to.be.instanceof(Undefined);
            var args = Array.from(u.args);
            expect(args[0]).to.equal("failure");
            expect(args[1]).to.be.instanceof(Error);
            expect(args[1].message).to.equal("Operand expected @1:6");
        });
    });
});
