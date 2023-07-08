const expect = require("./expect");

const parse = require("../lib/interpreter");

const {
    Term,
        Tuple,
        Item,
            Bool, 
            Numb, 
            Applicable,
                Mapping, 
                    Sequence, 
                        Text, 
                        List, 
                    Namespace,
                Func, 
            Undefined, 
                
    wrap, unwrap 
} = require('../lib/types');



describe("SWAN EXPRESSION INTERPRETER", () => {


    // CORE

    describe("numeric literals", () => {

        it("should evaluate decimal numeric literals to numbers", async () => {
            expect(await parse("10"   )()).to.be.Numb(10);
            expect(await parse("0"    )()).to.be.Numb(0);
            expect(await parse("3.2"  )()).to.be.Numb(3.2);
            expect(await parse("1.2e3")()).to.be.Numb(1200);
        });
    });

    describe("string literals", () => {

        it(`should evaluate string literals between double quotes '""'`, async () => {
            expect(await parse(`"abc"`)()).to.be.Text("abc");
            expect(await parse(`""`   )()).to.be.Text("");
        });

        it("should evaluate string literals between single quotes `''`", async () => {
            expect(await parse(`'def'`)()).to.be.Text("def");
            expect(await parse(`''`   )()).to.be.Text("");
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
            expect(await parse(""          )()).to.be.Tuple([]);
            expect(await parse("()"        )()).to.be.Tuple([]);
            expect(await parse("(), (), ()")()).to.be.Tuple([]);
        });
    
        it("should evaluate 1-uples (x,()) as x", async () => {
            expect(await parse("(), 10, ()")()).to.be.Numb(10);
        });
    });
    
    describe("lists: `[expression]`", () => {
    
        it("should return an array", async () => {
            expect(await parse("[1,'abc',3]")()).to.be.List([1,"abc",3]);
            expect(await parse("[1]"        )()).to.be.List([1]);
            expect(await parse("[]"         )()).to.be.List([]);
        });
    
        it("should not flatten deep lists", async () => {
            expect(await parse("[[1,2],3,4,[]]")()).to.be.List([[1,2],3,4,[]]);
        });
    });
    
    describe("name resolution", () => {
    
        it("should return the value mapped to the name in the current context", async () => {
            var context = {a:10, _b:20, __c__:"xxx"};
            expect(await parse("a"    )(context)).to.be.Numb(10);
            expect(await parse("_b"   )(context)).to.be.Numb(20);
            expect(await parse("__c__")(context)).to.be.Text("xxx");
        });
    
        it("should return `Undefined Mapping` if the name is not mapped", async () => {
            expect( await parse("undefined_key")({a:10, _b:20}) ).to.be.Undefined("NameReference", arg0 => {
                expect(arg0).to.equal("undefined_key");                
            });
        });
    
        it("should return `Undefined Mapping` if name is a property inherited from Object", async () => {
            
            expect( await parse("isPrototypeOf")({}) ).to.be.Undefined("NameReference", arg0 => {
                expect(arg0).to.equal("isPrototypeOf");                
            });
            
            expect( await parse("hasOwnProperty")({}) ).to.be.Undefined("NameReference", arg0 => {
                expect(arg0).to.equal("hasOwnProperty");                
            });
        });
    
        describe("name resolution in a child context", () => {
    
            it("should return the child name value if name is mapped in the child context", async () => {
                var context = Object.assign(Object.create({a:10, b:20}), {a:100});
                expect(await parse("a")(context)).to.be.Numb(100);
            });
    
            it("should return the parent name value if name is not mapped in the child context", async () => {
                var context = Object.assign(Object.create({a:10, b:20}), {a:100});
                expect(await parse("b")(context)).to.be.Numb(20);
            });
    
            it("should return `Undefined Mapping` if the name is not mapped in the child context nor in the parent context", async () => {
                var context = Object.assign(Object.create({a:10, b:20}), {a:100});
                expect( await parse("undefined_key")(context) ).to.be.Undefined("NameReference", arg0 => {
                    expect(arg0).to.equal("undefined_key");
                });
            });
        });
    });
    
    describe("labelling operation `name: expression`", () => {
    
        it("should create a new name in the current context and map it to the given value", async () => {
            var context = {};
            await parse("x: 10")(context);
            expect(await parse("x")(context)).to.be.Numb(10);
            expect(context.x).to.equal(10);
        });
    
        it("should assign a tuple of values to a tuple of names", async () => {
            var context = {};
            var value = await parse("(a,b,c) : (1,2,3)")(context);

            expect(await parse("a")(context)).to.be.Numb(1);
            expect(context.a).to.equal(1);
            
            expect(await parse("b")(context)).to.be.Numb(2);
            expect(context.b).to.equal(2);
            
            expect(await parse("c")(context)).to.be.Numb(3);
            expect(context.c).to.equal(3);
        });
    
        it("should assign null to the last names if the values tuple is smaller than the names tuple", async () => {
            var context = {};
            await parse("(a,b,c,d) : (10,20)")(context);
            
            expect(await parse("a")(context)).to.be.Numb(10);
            expect(context.a).to.equal(10);
            
            expect(await parse("b")(context)).to.be.Numb(20);
            expect(context.b).to.equal(20);

            expect(await parse("c")(context)).to.be.Tuple([]);
            expect(context.c).to.be.null;
            
            expect(await parse("d")(context)).to.be.Tuple([]);
            expect(context.d).to.be.null;
            
            await parse("(e,f) : ()")(context);
            expect(context.e).to.be.null;
            expect(context.f).to.be.null;
        });
    
        it("should assign to the last name the tuple of remaining values if the names tuple is smaller than the values tuple", async () => {
            var context = {};
    
            await parse("(a,b) : (100,200,300)")(context);
            
            expect(await parse("a")(context)).to.be.Numb(100);
            expect(context.a).to.equal(100);
            
            expect(await parse("b")(context)).to.be.Tuple([200,300]);
            expect(context.b).to.be.Tuple([200,300]);
    
            await parse("c : (10,20,30)")(context);
            
            expect(await parse("c")(context)).to.be.Tuple([10,20,30]);
            expect(context.c).to.be.Tuple([10,20,30]);
        });
    
        it("should overwrite an existing name-value mapping", async () => {
            var context = {};
            await parse("a : 2")(context);
            await parse("a : 3")(context);
            
            expect(await parse("a")(context)).to.be.Numb(3);
            expect(context.a).to.equal(3);
        });
    
        it("should return the expression value", async () => {
            expect(await parse("x: 10"                )()).to.be.Numb(10);
            expect(await parse("(a,b,c) : (1,2,3)"    )()).to.be.Tuple([1,2,3]);
            expect(await parse("(a,b,c,d) : (10,20)"  )()).to.be.Tuple([10,20]);
            expect(await parse("(a,b) : (100,200,300)")()).to.be.Tuple([100,200,300]);
            expect(await parse("c : (10,20,30)"       )()).to.be.Tuple([10,20,30]);
        });
        
        it("should return `Undefined` when non valid names are provided at the left-hand side of the expression", async () => {
            
            expect( await parse("'abc' : 2")() ).to.be.Undefined('LabellingOperation', (arg0, arg1) => {
                expect(arg0).to.be.Undefined('StringLiteral')
                expect(arg1).to.equal(2);
            });

            expect( await parse("3*2 : 2")() ).to.be.Undefined('LabellingOperation', (arg0, arg1) => {
                expect(arg0).to.be.Undefined('MulOperation', (arg00, arg01) => {
                    expect(arg00).to.be.Undefined('NumberLiteral', arg000 => {
                        expect(arg000).to.equal(3);
                    });
                    expect(arg01).to.be.Undefined('NumberLiteral', arg010 => {
                        expect(arg010).to.equal(2);
                    });
                });
                expect(arg1).to.equal(2);
            });
        });        
    });
    
    describe("assignment operation: name = expression", () => {
        
        it("should create a new name in the current context and map it to the given value", async () => {
            var context = {};
            await parse("x = 10")(context);
            expect(await parse("x")(context)).to.be.Numb(10);
            expect(context.x).to.equal(10);
        });
    
        it("should assign a tuple of values to a tuple of names", async () => {
            var context = {};
            var value = await parse("(a,b,c) = (1,2,3)")(context);

            expect(await parse("a")(context)).to.be.Numb(1);
            expect(context.a).to.equal(1);
            
            expect(await parse("b")(context)).to.be.Numb(2);
            expect(context.b).to.equal(2);
            
            expect(await parse("c")(context)).to.be.Numb(3);
            expect(context.c).to.equal(3);
        });
    
        it("should assign null to the last names if the values tuple is smaller than the names tuple", async () => {
            var context = {};
            await parse("(a,b,c,d) = (10,20)")(context);
            
            expect(await parse("a")(context)).to.be.Numb(10);
            expect(context.a).to.equal(10);
            
            expect(await parse("b")(context)).to.be.Numb(20);
            expect(context.b).to.equal(20);

            expect(await parse("c")(context)).to.be.Tuple([]);
            expect(context.c).to.be.null;
            
            expect(await parse("d")(context)).to.be.Tuple([]);
            expect(context.d).to.be.null;

            await parse("(e,f) = ()")(context);
            expect(context.e).to.be.null;
            expect(context.f).to.be.null;
        });
    
        it("should assign to the last name the tuple of remaining values if the names tuple is smaller than the values tuple", async () => {
            var context = {};
    
            await parse("(a,b) = (100,200,300)")(context);
            
            expect(await parse("a")(context)).to.be.Numb(100);
            expect(context.a).to.equal(100);
            
            expect(await parse("b")(context)).to.be.Tuple([200,300]);
            expect(context.b).to.be.Tuple([200,300]);
    
            await parse("c = (10,20,30)")(context);
            
            expect(await parse("c")(context)).to.be.Tuple([10,20,30]);
            expect(context.c).to.be.Tuple([10,20,30]);
        });
    
        it("should overwrite an existing name-value mapping", async () => {
            var context = {};
            await parse("a = 2")(context);
            await parse("a = 3")(context);
            
            expect(await parse("a")(context)).to.be.Numb(3);
            expect(context.a).to.equal(3);
        });

        it("should return an empty tuple", async () => {
            expect(await parse("x = 10"               )()).to.be.Tuple([]);
            expect(await parse("(a,b,c) = (1,2,3)"    )()).to.be.Tuple([]);
            expect(await parse("(a,b,c,d) = (10,20)"  )()).to.be.Tuple([]);
            expect(await parse("(a,b) = (100,200,300)")()).to.be.Tuple([]);
            expect(await parse("c = (10,20,30)"       )()).to.be.Tuple([]);
        });
        
        it("should return `Undefined AssignmentOperation` when non valid names are provided at the left-hand side of the expression", async () => {
            
            expect( await parse("'abc' = 2")() ).to.be.Undefined('AssignmentOperation', (arg0, arg1) => {
                expect(arg0).to.be.Undefined('StringLiteral')
                expect(arg1).to.equal(2);
            });

            expect( await parse("3*2 = 2")() ).to.be.Undefined('AssignmentOperation', (arg0, arg1) => {
                expect(arg0).to.be.Undefined('MulOperation', (arg00, arg01) => {
                    expect(arg00).to.be.Undefined('NumberLiteral', arg000 => {
                        expect(arg000).to.equal(3);
                    });
                    expect(arg01).to.be.Undefined('NumberLiteral', arg010 => {
                        expect(arg010).to.equal(2);
                    });
                });
                expect(arg1).to.equal(2);
            });
        });
    });
    
    describe("namespace definition: {expression}", () => {
    
        it("return an object with the mapped names", async () => {
            expect(await parse("{x=1, y:2, z=3}")()).to.be.Namespace({x:1,y:2,z:3});
        });
    
        it("should ignore the non-assignment operations", async () => {
            expect(await parse("{x=1, 10, y=2, z=3}")()).to.be.Namespace({x:1,y:2,z:3});
        });
    
        it("should not assign the names to the parent context", async () => {
            var context = {x:10};
            await parse("{x=20}")(context);

            expect(await parse('x')(context)).to.be.Numb(10);
            expect(context.x).to.equal(10);
        });
    });
    
    describe("function definition: names_tuple -> expression", () => {
    
        it("should return a function resolving the expression in a context augumented with the argument names", async () => {
            var foo = await parse("(x, y) -> [y,x]")();
            expect(foo).to.be.instanceof(Func);
            expect(await unwrap(foo)(10,20)).to.be.List([20,10]);
        });
        
        it("should follow the assignment rules when mapping argument names to parameters", async () => {    
            var retval, foo = await parse("(x, y) -> {a=x,b=y}")();
            
            retval = await unwrap(foo)(10);
            expect(retval).to.be.Namespace({a:10, b:null});
            expect(unwrap(retval).a).to.equal(10);
            expect(unwrap(retval).b).to.be.null;
    
            retval = await unwrap(foo)(10,20,30);
            expect(unwrap(retval).a).to.equal(10);
            expect(unwrap(retval).b).to.be.Tuple([20,30]);
        });
    
        it("should add a `self` function to the function context, pointing to the function itself", async () => {
            const count = await parse("((n, head, tail) -> head == () ? n ; self(n+1, tail))(0, 10,20,30)")()
            expect(count).to.be.Numb(3);
            
            // self should be overriden by parameters with the same name
            expect(await parse("(self -> 2*self)(10)")()).to.be.Numb(20);
        });
    

        it("should be righ-to-left associative", async () => {
            var foo = await parse("x -> y -> {a=x,b=y}")();
            var foo10 = await unwrap(foo)(10);
            expect(foo10).to.be.instanceof(Func);
            expect(await unwrap(foo10)(20)).to.be.Namespace({a:10, b:20});
        });
        
        it("should return Undefined FunctionDefinition when non-valid name are defined as parameters", async () => {
            expect( await parse("'abc' -> 2")() ).to.be.Undefined('FunctionDefinition', arg0 => {
                expect(arg0).to.be.Undefined('StringLiteral')
            });
        });
    });
    
    describe("'apply' operation: Y X`", () => {
    
        describe("when `Y` is a function", () => {
    
            it("should call F with the parameter X and return its return value", async () => {
                var context = {
                    double: x => 2 * x,
                    sum: (x,y) => x + y
                };
                expect(await parse("(x -> [x]) 10"            )(context)).to.be.List([10]);
                expect(await parse("((x, y) -> [y,x])(10, 20)")(context)).to.be.List([20,10]);
                expect(await parse("double 25"                )(context)).to.be.Numb(50);
                expect(await parse("sum(10, 20)"              )(context)).to.be.Numb(30);
            });
    
            it("should return Undefined if F throws an error", async () => {
                var error = new Error('Test error');
                var context = {fn: x => {throw error}};
                expect( await parse('fn 10')(context) ).to.be.Undefined('Term', arg0 => {
                    expect(arg0).to.equal(error);
                });
            });
    
            it("should return Undefined if F returns Undefined", async () => {
                var undef = new Undefined();
                var context = {fn: x => undef};
                expect(await parse('fn 10')(context)).to.equal(undef);
            });
        });
        
        describe("when `Y` is a string", () => {
            
            it("should return the X-th character if X is an integer", async () => {
                expect(await parse("'abcdef' 2")({})).to.be.Text('c');
            });
    
            it("should return Undefined Term if X is an out of range number or not a natural number", async () => {
                
                for (let i of [100, -1, 1.2, '1', [], {}, new Undefined()]) {
                    expect(await parse("'abc'(i)")({i})).to.be.Undefined("Mapping", arg0 => {
                        expect(arg0).to.equal(i);                    
                    });
                }
            });
    
            it("should return an tuple ot characters if X is a tuple", async () => {
                expect(await parse("'abcdef'(1,5,3)")()).to.be.Tuple(['b','f','d']);
            });            
        })
        
        describe("when `Y` is a list", () => {
            
            it("should return the X-th item if X is an integer", async () => {
                expect(await parse("[10, 20, 30, 40, 50, 60](2)")()).to.be.Numb(30);
            });
    
            it("should return Undefined Term if X is an out of range number or not a natural number", async () => {
                
                for (let i of [100, -1, '1', [], {}, 1.2, -1.2, new Undefined()]) {
                    expect( await parse("[10, 20, 30](i)")({i}) ).to.be.Undefined("Mapping", arg0 => {
                        expect(arg0).to.equal(i);                    
                    });
                }
            });
    
            it("should return a tuple of list items if X is a tuple", async () => {
                const context = {
                    list: [10, 20, 30, 40, 50, 60],
                }
                expect(await parse("list(1,5,3)")(context)).to.be.Tuple([20,60,40]);
            });            
        })
        
        describe("when `Y` is a namespace", () => {
            
            it("should return the value mapped to X if X is a valid name", async () => {
                var context = {
                    ns: {abc:10, def:20}
                };
                expect(await parse("ns 'abc'" )(context)).to.be.Numb(10);
                expect(await parse("ns('def')")(context)).to.be.Numb(20);
            });
            
            it("shoudl return Undefined Mapping if X is not a valid name or a name not mapped to a value", async () => {
                const context = {ns: {a:1, b:2, $c:3}}
                
                for (let name of ['$c', '123', 123, [1,2,3], new Undefined(), ]) {
                    context.name = name;
                    expect( await parse("ns(name)")(context) ).to.be.Undefined("Mapping", arg0 => {
                        expect(arg0).to.equal(name);
                    });
                }
            });

            it("shoudl return Undefined Mapping if X is not an own property", async () => {
                const ns = Object.assign(Object.create({a:10}), {b:20});

                for (let name of ['a', 'isPrototypeOf', 'hasOwnProperty']) {
                    expect( await parse("ns(name)")({ns, name})).to.be.Undefined("Mapping", arg0 => {
                        expect(arg0).to.equal(name);
                    });
                }
            });

            it("shoudl return a tuple of value if X is a tuple with more than one item", async () => {
                var context = {
                    ns: {abc:10, def:20, ghi:30}
                };
                expect(await parse("ns('abc','ghi','def')" )(context)).to.be.Tuple([10, 30, 20]);
            });
        });
    
        describe("when Y is of any other type", () => {
    
            it("should return Undefined ApplyOperation", async () => {
                for (let Y of [true, false, 10, new Undefined]) {
                    expect( await parse("Y(1)")({Y}) ).to.be.Undefined('ApplyOperation', (arg0, arg1) => {
                        expect(arg0).to.equal(Y);
                        expect(arg1).to.equal(1);                        
                    });
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
    
    describe("tuple mapping operation: X => Y", () => {
        
        it("should apply Y to each item of X and return the resulting tuple", async () => {
            expect(await parse("(1,2,3) => x -> 2*x")()).to.be.Tuple([2,4,6]);
            expect(await parse("(1,2,3) => 'abcdef'")()).to.be.Tuple(['b','c','d']);
            expect(await parse("(1,2,3) => (x->2*x,x->3*x)")()).to.be.Tuple([2,3,4,6,6,9]);
        });
    });
    
    describe("Function composition: G << F", () => {
        
        it("should return the function X -> G(F(X))", async () => {
            var context = {f: x=>2*x, g: x=>[x]};
            expect(await parse("g << f")(context)).to.be.instanceof(Func);
            expect(await parse("(g << f) 2")(context)).to.be.List([4]);
        });
        
        it("should work with tuples of functions", async () => {
            var context = {f2: x=>2*x, f3: x=>3*x, f4: x=>4*x, g: (...x)=>[...new Tuple(...x)]};
            expect(await parse("g << (f2,f3,f4)")(context)).to.be.instanceof(Func);
            expect(await parse("(g << (f2,f3,f4)) 2")(context)).to.be.List([4, 6, 8]);
        });
        
        it("should be righ-to-left associative", async () => {
            var context = {f: x=>2*x, g: x=>x**2, h: x=>[x]};
            
            expect(await parse("h << g << f")(context)).to.be.instanceof(Func);
            expect(await parse("(h << g << f) 2")(context)).to.be.List([16]);

            expect(await parse("h << f << g")(context)).to.be.instanceof(Func);
            expect(await parse("(h << f << g) 2")(context)).to.be.List([8]);
        });
    });

    describe("Function piping: F >> G", () => {
        
        it("should return the function X -> G(F(X))", async () => {
            var context = {f: x=>2*x, g: x=>[x]};
            expect(await parse("f >> g")(context)).to.be.instanceof(Func);
            expect(await parse("(f >> g) 2")(context)).to.be.List([4]);
        });

        it("should work with tuples of functions", async () => {
            var context = {f2: x=>2*x, f3: x=>3*x, f4: x=>4*x, g: (...x)=>[...new Tuple(...x)]};
            expect(await parse("(f2,f3,f4) >> g")(context)).to.be.instanceof(Func);
            expect(await parse("((f2,f3,f4) >> g) 2")(context)).to.be.List([4, 6, 8]);
        });
    });    

    describe("sub-contexting: X.Y", () => {
    
        describe("when X is a namespace", () => {
            
            it("should evaluate 'Y' in the 'X' context if 'X' is a namespace", async () => {
                var context = {x: 10, u:new Undefined()};
                await parse("ns = {y=20, z=30, _h=40}")(context);
                expect(await parse("ns.y      ")(context)).to.be.Numb(20);
                expect(await parse("ns.[1,y,z]")(context)).to.be.List([1,20,30]);
                expect(await parse("ns.x      ")(context)).to.be.Numb(10);
                expect(await parse("ns._h     ")(context)).to.be.Numb(40);
                expect(await parse("ns.u      ")(context)).to.equal(context.u);
        
                var context = { ns:{x:10,y:20,z:30} };
                expect(await parse("ns.[x,y,z]")(context)).to.be.List([10,20,30]);
            });
        
            it("should see the prototype chain", async () => {
                var context = {x:10};
                
                // context prototype
                await parse("ns = {y=20}")(context);
                expect(await parse("ns.x")(context)).to.be.Numb(10);
                expect(await parse("ns.y")(context)).to.be.Numb(20);
                
                // namespace prototype
                await parse("ns1 = {x=11}")(context);
                await parse("ns2 = ns1.{y=20}")(context);
                expect(await parse("ns2.x")(context)).to.be.Numb(11);
                expect(await parse("ns2.y")(context)).to.be.Numb(20);                
            });
        
            it("should see the function parameters in a function expressions", async () => {
                var context = {x:10};
                await parse("ns = {x=10}, nsp = {x=20}")(context);
                await parse("f = nsp -> nsp.x")(context);
                expect(await parse("f ns")(context)).to.be.Numb(10);
                
                await parse("f2 = (x,y,z) -> {}")(context);
                expect(await parse("f2(1,2,3).y")(context)).to.be.Numb(2);
            });            
        });
    
        describe("when X is of any other type", () => {
            
            it("should return Undefined SubcontextingOperation", async () => {
                
                for (let X of [10, [1,2,3], "abc", x=>2*x, new Undefined()]) {
                    expect( await parse("X.name")({X}) ).to.be.Undefined("SubcontextingOperation", arg0 => {
                        expect(arg0).to.equal(X);
                    });                    
                }
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
            expect(await parse(expression)({})).to.be.Numb(12.345);
        });
    
        it("should not parse `#` characters in a string as comments", async () => {
            expect(await parse("'this # is a string'")({})).to.be.Text("this # is a string");
            expect(await parse(`"this # is a string"`)({})).to.be.Text("this # is a string");
        });
    });



    // UNARY OPERATORS
    
    describe("+X", () => {
    
        it("should return X", async () => {
            for (let X of [true, false, "abc", [1,2,3], {x:1}, x=>x, new Undefined()]) {
                expect(unwrap( await parse("+X")({X}) )).to.deep.equal(X);
            }
            expect(await parse("+(1,2,3)")({})).to.be.Tuple([1,2,3]);
            expect(await parse("+()")({})).to.be.Tuple([]);
        });
    });
    
    describe("-X", () => {
    
        it("should return -1*X if X is a number", async () => {
            expect(await parse("-3")({})).to.be.Numb(-3);
            expect(await parse("-x")({x:10})).to.be.Numb(-10);
        });
    
        it("should return Undefined NegationOperation if X is not a number", async () => {
            for (let X of [true, false, "abc", [1,2,3], {x:1}, x=>x, new Undefined()]) {
                expect( await parse("-X")({X}) ).to.be.Undefined('NegationOperation', arg0 => {
                    expect(arg0).to.equal(X);
                });
            }
        });
    
        it("should apply the operator to each item of X if X is a Tuple", async () => {
            expect(await parse("-(10, -2, 3)")({})).to.be.Tuple([-10, 2, -3]);
            
            const tuple = await parse("-(3, x, s)")({x:-10, s:'abc'});
            expect(Array.from(tuple)[0]).to.equal(-3);
            expect(Array.from(tuple)[1]).to.equal(10);
            expect(Array.from(tuple)[2]).to.be.Undefined('NegationOperation', arg0 => {
                expect(arg0).to.equal('abc');
            });
        });
    });
    
    
    
    // LOGIC OPERATORS
    
    describe("X | Y", () => {
    
        it("should return X if it booleanizes to true", async () => {
            const context = {TRUE:true, FALSE:false};
    
            // true or true
            expect(await parse("TRUE | TRUE")(context)).to.be.Bool(true);
            expect(await parse("TRUE | 10"  )(context)).to.be.Bool(true);
            expect(await parse("10 | TTRUE" )(context)).to.be.Numb(10);
            expect(await parse("10 | 10"    )(context)).to.be.Numb(10);
    
            // true or false
            expect(await parse("TRUE | FALSE")(context)).to.be.Bool(true);
            expect(await parse("TRUE | 0"    )(context)).to.be.Bool(true);
            expect(await parse("10 | FALSE"  )(context)).to.be.Numb(10);
            expect(await parse("10 | 0"      )(context)).to.be.Numb(10);    
        })
    
        it("should return Y if X booleanizes to false", async () => {
            const context = {TRUE:true, FALSE:false};
    
            // false or true
            expect(await parse("FALSE | TRUE")(context)).to.be.Bool(true);
            expect(await parse("FALSE | 10"  )(context)).to.be.Numb(10);
            expect(await parse("0 | TRUE"    )(context)).to.be.Bool(true);
            expect(await parse("0 | 10"      )(context)).to.be.Numb(10);
    
            // false or false
            expect(await parse("FALSE | FALSE")(context)).to.be.Bool(false);
            expect(await parse("FALSE | 0"    )(context)).to.be.Numb(0);
            expect(await parse("0 | FALSE"    )(context)).to.be.Bool(false);
            expect(await parse("0 | 0"        )(context)).to.be.Numb(0);
        })
    });
    
    describe("X & Y", () => {
    
        it("should return Y if X booleanizes to true", async () => {
            const context = {TRUE:true, FALSE:false};
    
            // true or true
            expect(await parse("TRUE & TRUE")(context)).to.be.Bool(true);
            expect(await parse("TRUE & 10"  )(context)).to.be.Numb(10);
            expect(await parse("10 & TRUE"  )(context)).to.be.Bool(true);
            expect(await parse("10 & 10"    )(context)).to.be.Numb(10);
    
            // true or false
            expect(await parse("TRUE & FALSE")(context)).to.be.Bool(false);
            expect(await parse("TRUE & 0"    )(context)).to.be.Numb(0);
            expect(await parse("10 & FALSE"  )(context)).to.be.Bool(false);
            expect(await parse("10 & 0"      )(context)).to.be.Numb(0);
        });
    
        it("should return X if it booleanizes to false", async () => {
            const context = {TRUE:true, FALSE:false};
    
            // false or true
            expect(await parse("FALSE & TRUE")(context)).to.be.Bool(false);
            expect(await parse("FALSE & 10"  )(context)).to.be.Bool(false);
            expect(await parse("0 & TRUE"    )(context)).to.be.Numb(0);
            expect(await parse("0 & 10"      )(context)).to.be.Numb(0);
    
            // false or false
            expect(await parse("FALSE & FALSE")(context)).to.be.Bool(false);
            expect(await parse("FALSE & 0"    )(context)).to.be.Bool(false);
            expect(await parse("0 & FALSE"    )(context)).to.be.Numb(0);
            expect(await parse("0 & 0"        )(context)).to.be.Numb(0);
        });
    });
    
    describe("X ? Y", () => {
    
        it("should return Y is X booleanizes to true", async () => {
            const context = {TRUE:true, FALSE:false};
    
            expect(await parse("TRUE ? [1,2,3]")(context)).to.be.List([1,2,3]);
            expect(await parse("10 ? [1,2,3]"  )(context)).to.be.List([1,2,3]);
        });
    
        it("should return Undefined Term if X booleanizes to false", async () => {
            const context = {TRUE:true, FALSE:false};
    
            expect(await parse("FALSE ? [1,2,3]")(context)).to.be.Undefined('Term');
            expect(await parse("0 ? [1,2,3]"    )(context)).to.be.Undefined('Term');
        });
    });
    
    describe("X ; Y", () => {
    
        it("should return X if it is not Undefined", async () => {
            expect(await parse("[1,2,3] ; [3,4,5]")({})).to.be.List([1,2,3]);
        });
    
        it("should return Y if X is Undefined", async () => {
            expect(await parse("(2:2) ; [3,4,5]")({})).to.be.List([3,4,5]);
        });
    });
    
    
    
    // ARITHMETIC OPERATIONS
    
    describe("X + Y", () => {
    
        it("shoudl return () if both X and Y are ()", async () => {
            expect(await parse("() + ()")()).to.be.Tuple([]);
        });
    
        it("should return `X OR Y` if both X and Y are booleans", async () => {
            var context = {T:true, F:false};
            expect(await parse("T + T")(context)).to.be.Bool(true);
            expect(await parse("T + F")(context)).to.be.Bool(true);
            expect(await parse("F + T")(context)).to.be.Bool(true);
            expect(await parse("F + F")(context)).to.be.Bool(false);
        });
    
        it("should return `X+Y` if both X and Y are numbers", async () => {
            expect(await parse("10 + 1"   )()).to.be.Numb(11);
            expect(await parse("10 + 0"   )()).to.be.Numb(10);
            expect(await parse("10 + (-2)")()).to.be.Numb(8);
        });
    
        it("should concatenate X and Y if they are both strings", async () => {
            expect(await parse("'abc' + 'def'")()).to.be.Text("abcdef");
            expect(await parse("'abc' + ''"   )()).to.be.Text("abc");
            expect(await parse("'' + 'def'"   )()).to.be.Text("def");
        });
    
        it("should concatenate X and Y if they are both lists", async () => {
            expect(await parse("[1,2,3] + [4,5,6]")()).to.be.List([1,2,3,4,5,6]);
            expect(await parse("[1,2,3] + []"     )()).to.be.List([1,2,3]);
            expect(await parse("[] + [4,5,6]"     )()).to.be.List([4,5,6]);
        });
    
        it("should merge X and Y if they are both namespaces", async () => {
            expect(await parse("{a=1,b=2} + {b=20,c=30}")()).to.be.Namespace({a:1,b:20,c:30});
            expect(await parse("{a=1,b=2} + {}"         )()).to.be.Namespace({a:1,b:2});
            expect(await parse("{} + {b=20,c=30}"       )()).to.be.Namespace({b:20,c:30});
    
            var context = {
                ns1: {a:1, un: new Undefined()},
                ns2: {b:2, un: new Undefined()},
            }
            expect(await parse("ns1 + ns2")(context)).to.be.Namespace({a:1, b:2, un:context.ns2.un});
        });

        it("should return X.__add__(X, Y) if X is a namespace and X.__add__ is a Func item", async () => {
            const ns1 = {val:10, __add__: (X, Y) => X.val + Y};
            expect(await parse('ns1 + 3')({ns1})).to.be.Numb(13);

            ns1.__add__ = "not-a-func";
            expect(await parse('ns1 + {}')({ns1})).to.be.Namespace(ns1);
        });
    
        it("should return Undefined for all the other type combinations", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined(), no=null;
            for (let [L,R] of [
                             [no,T], [n ,F], [no,n ], [no,s ], [no,ls], [no,ns], [no,fn], [no,u ],
                    [T ,no],                 [T ,n ], [T ,s ], [T ,ls], [T ,ns], [T ,fn], [T ,u ],
                    [F ,no],                 [F ,n ], [F ,s ], [F ,ls], [F ,ns], [F ,fn], [F ,u ],
                    [n ,no], [n ,T], [n ,F],          [n ,s ], [n ,ls], [n ,ns], [n ,fn], [n ,u ],
                    [s ,no], [s ,T], [s ,F], [s ,n ],          [s ,ls], [s ,ns], [s ,fn], [s ,u ],
                    [ls,no], [ls,T], [ls,F], [ls,n ], [ls,s ],          [ls,ns], [ls,fn], [ls,u ],
                    [ns,no], [ns,T], [ns,F], [ns,n ], [ns,s ], [ns,ls],          [ns,fn], [ns,u ],
                    [fn,no], [fn,T], [fn,F], [fn,n ], [fn,s ], [fn,ls], [fn,ns],          [fn,u ],
                    [u ,no], [u ,T], [u ,F], [u ,n ], [u ,s ], [u ,ls], [u ,ns], [u ,fn], [u ,u ] ]) {
    
                expect( await parse("L + R")({L,R}) ).to.be.Undefined('SumOperation', (arg0, arg1) => {
                    expect(arg0).to.deep.equal(L);
                    expect(arg1).to.deep.equal(R);
                });
            }
        });
    
        it("should return (x1+y1, x2+y2, ...) if X and/or Y is a tuple", async () => {
            var context = {T:true, F:false};
            expect(await parse("(T, 1, 'a', [1], {a=1}) + (F, 2, 'b', [2], {b=2})")(context)).to.be.Tuple([true, 3, "ab", [1,2], {a:1,b:2}])
    
            // partial exception
            var tuple = await parse("(10,20,30) + (1,2,[])")();
            expect(Array.from(tuple)[0]).to.equal(11);
            expect(Array.from(tuple)[1]).to.equal(22);
            expect(Array.from(tuple)[2]).to.be.Undefined('SumOperation', (arg0, arg1) => {
                expect(arg0).to.equal(30);
                expect(arg1).to.deep.equal([]);
            });
        });
    });
    
    describe("X - Y", () => {
        
        it("shoudl return () if both X and Y are ()", async () => {
            expect(await parse("() - ()")()).to.be.Tuple([]);
        });
    
        it("should return `X-Y` if both X and Y are numbers", async () => {
            expect(await parse("10 - 1"   )()).to.be.Numb(9);
            expect(await parse("20 - 0"   )()).to.be.Numb(20);
            expect(await parse("10 - (-7)")()).to.be.Numb(17);
        });

        it("should return Undefined for all the other type combinations", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined(), no=null;
            for (let [L,R] of [
                             [no,T], [n ,F], [no,n ], [no,s], [no,ls], [no,ns], [no,fn], [no,u ],
                    [T ,no], [T ,T], [T, F], [T ,n ], [T ,s], [T ,ls], [T ,ns], [T ,fn], [T ,u ],
                    [F ,no], [F ,T], [F, F], [F ,n ], [F ,s], [F ,ls], [F ,ns], [F ,fn], [F ,u ],
                    [n ,no], [n ,T], [n ,F],          [n ,s], [n ,ls], [n ,ns], [n ,fn], [n ,u ],
                    [s ,no], [s ,T], [s ,F], [s ,n ], [s, s], [s ,ls], [s ,ns], [s ,fn], [s ,u ],
                    [ls,no], [ls,T], [ls,F], [ls,n ], [ls,s], [ls,ls], [ls,ns], [ls,fn], [ls,u ],
                    [ns,no], [ns,T], [ns,F], [ns,n ], [ns,s], [ns,ls], [ns,ns], [ns,fn], [ns,u ],
                    [fn,no], [fn,T], [fn,F], [fn,n ], [fn,s], [fn,ls], [fn,ns], [fn,fn], [fn,u ],
                    [u ,no], [u ,T], [u ,F], [u ,n ], [u ,s], [u ,ls], [u ,ns], [u ,fn], [u ,u ] ]) {
    
                expect( await parse("L - R")({L,R}) ).to.be.Undefined('SubOperation', (arg0, arg1) => {
                    expect(arg0).to.deep.equal(L);
                    expect(arg1).to.deep.equal(R);
                });
            }
        });

        it("should return X.__sub__(X, Y) if X is a namespace and X.__sub__ is a Func item", async () => {
            const ns1 = {val:10, __sub__: (X, Y) => X.val - Y};
            expect(await parse('ns1 - 3')({ns1})).to.be.Numb(7);

            ns1.__sub__ = "not-a-func";
            expect(await parse('ns1 - {}')({ns1})).to.be.Undefined("SubOperation");
        });
    
        it("should return (x1-y1, x2-y2, ...) if X and/or Y is a tuple", async () => {
            expect(await parse("(10,20,30) - (1,2,3)")(context)).to.be.Tuple([9,18,27]);
    
            // partial exception
            var tuple = await parse("(10,20,30) - (1,2,[])")();
            expect(Array.from(tuple)[0]).to.equal(9);
            expect(Array.from(tuple)[1]).to.equal(18);
            expect(Array.from(tuple)[2]).to.be.Undefined('SubOperation', (arg0, arg1) => {
                expect(arg0).to.equal(30);
                expect(arg1).to.deep.equal([]);
            });
        });
    });
    
    describe("X * Y", () => {
    
        it("should return () if both X and Y are ()", async () => {
            expect(await parse("() * ()")()).to.be.Tuple([]);
        });
    
        it("should return `X AND Y` if both X and Y are booleans", async () => {
            var context = {T:true, F:false,
                    un: new Undefined()};    
            expect(await parse("T * T")(context)).to.be.Bool(true);
            expect(await parse("T * F")(context)).to.be.Bool(false);
            expect(await parse("F * T")(context)).to.be.Bool(false);
            expect(await parse("F * F")(context)).to.be.Bool(false);
        });
    
        it("should return `X*Y` if both X and Y are numbers", async () => {
            expect(await parse("10 * 2"   )()).to.be.Numb(20);
            expect(await parse("10 * 0"   )()).to.be.Numb(0);
            expect(await parse("10 * (-2)")()).to.be.Numb(-20);
        });
    
        it("should return Undefined MulOperation for all the other type combinations", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined(), no=null;
            for (let [L,R] of [
                             [no,T], [n ,F], [no,n ], [no,s], [no,ls], [no,ns], [no,fn], [no,u ],
                    [T ,no],                 [T ,n ], [T ,s], [T ,ls], [T ,ns], [T ,fn], [T ,u ],
                    [F ,no],                 [F ,n ], [F ,s], [F ,ls], [F ,ns], [F ,fn], [F ,u ],
                    [n ,no], [n ,T], [n ,F],          [n ,s], [n ,ls], [n ,ns], [n ,fn], [n ,u ],
                    [s ,no], [s ,T], [s ,F], [s ,n ], [s, s], [s ,ls], [s ,ns], [s ,fn], [s ,u ],
                    [ls,no], [ls,T], [ls,F], [ls,n ], [ls,s], [ls,ls], [ls,ns], [ls,fn], [ls,u ],
                    [ns,no], [ns,T], [ns,F], [ns,n ], [ns,s], [ns,ls], [ns,ns], [ns,fn], [ns,u ],
                    [fn,no], [fn,T], [fn,F], [fn,n ], [fn,s], [fn,ls], [fn,ns], [fn,fn], [fn,u ],
                    [u ,no], [u ,T], [u ,F], [u ,n ], [u ,s], [u ,ls], [u ,ns], [u ,fn], [u ,u ] ]) {
    
                expect( await parse("L * R")({L,R}) ).to.be.Undefined('MulOperation', (arg0, arg1) => {
                    expect(arg0).to.deep.equal(L);
                    expect(arg1).to.deep.equal(R);
                });
            }
        });

        it("should return X.__mul__(X, Y) if X is a namespace and X.__mul__ is a Func item", async () => {
            const ns1 = {val:10, __mul__: (X, Y) => X.val * Y};
            expect(await parse('ns1 * 3')({ns1})).to.be.Numb(30);

            ns1.__mul__ = "not-a-func";
            expect(await parse('ns1 * {}')({ns1})).to.be.Undefined("MulOperation");
        });

        it("should return (x1*y1, x2*y2, ...) if X and/or Y is a tuple", async () => {
            expect(await parse("(10,20,30) * (2,3,4)")(context)).to.be.Tuple([20,60,120]);
    
            // partial exception
            var tuple = await parse("(10,20,30) * (1,2,{})")();
            expect(Array.from(tuple)[0]).to.equal(10);
            expect(Array.from(tuple)[1]).to.equal(40);
            expect(Array.from(tuple)[2]).to.be.Undefined('MulOperation', (arg0, arg1) => {
                expect(arg0).to.equal(30);
                expect(arg1).to.deep.equal({});
            });
        });
    });
    
    describe("X / Y", () => {
    
        it("should return () if both X and Y are nothing", async () => {
            expect(await parse("() / ()")(context)).to.be.Tuple([]);
        });
    
        it("should return `X/Y` if both X and Y are numbers", async () => {
            expect(await parse("10 / 2"   )()).to.be.Numb(5);
            expect(await parse("10 / 5"   )()).to.be.Numb(2);
            expect(await parse("10 / (-2)")()).to.be.Numb(-5);
            expect(await parse("10 / 0"   )()).to.be.Numb(Infinity);
        });
    
        it("should return Undefined DivOperation for all the other type combinations", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined(), no=null;
            for (let [L,R] of [
                             [no,T], [n ,F], [no,n ], [no,s], [no,ls], [no,ns], [no,fn], [no,u ],
                    [T ,no], [T ,T], [T, F], [T ,n ], [T ,s], [T ,ls], [T ,ns], [T ,fn], [T ,u ],
                    [F ,no], [F ,T], [F, F], [F ,n ], [F ,s], [F ,ls], [F ,ns], [F ,fn], [F ,u ],
                    [n ,no], [n ,T], [n ,F],          [n ,s], [n ,ls], [n ,ns], [n ,fn], [n ,u ],
                    [s ,no], [s ,T], [s ,F], [s ,n ], [s, s], [s ,ls], [s ,ns], [s ,fn], [s ,u ],
                    [ls,no], [ls,T], [ls,F], [ls,n ], [ls,s], [ls,ls], [ls,ns], [ls,fn], [ls,u ],
                    [ns,no], [ns,T], [ns,F], [ns,n ], [ns,s], [ns,ls], [ns,ns], [ns,fn], [ns,u ],
                    [fn,no], [fn,T], [fn,F], [fn,n ], [fn,s], [fn,ls], [fn,ns], [fn,fn], [fn,u ],
                    [u ,no], [u ,T], [u ,F], [u ,n ], [u ,s], [u ,ls], [u ,ns], [u ,fn], [u ,u ] ]) {
    
                expect( await parse("L / R")({L,R}) ).to.be.Undefined('DivOperation', (arg0, arg1) => {
                    expect(arg0).to.deep.equal(L);
                    expect(arg1).to.deep.equal(R);
                });
            }
        });
    
        it("should return (x1/y1, x2/y2, ...) if X and/or Y is a tuple", async () => {
            expect(await parse("(10,20,30) / (2,5,3)")(context)).to.be.Tuple([5,4,10]);
    
            // partial exception
            var tuple = await parse("(10,20,30) / (2,5)")();
            expect(Array.from(tuple)[0]).to.equal(5);
            expect(Array.from(tuple)[1]).to.equal(4);
            expect(Array.from(tuple)[2]).to.be.Undefined('DivOperation', (arg0, arg1) => {
                expect(arg0).to.equal(30);
                expect(arg1).to.equal(null);
            });
        });
    });
    
    describe("X ^ Y", () => {
    
        it("should return () if both X and Y are ()", async () => {
            expect(await parse("() ^ ()")()).to.be.Tuple([]);
        });
    
        it("should return `X**Y` if both X and Y are numbers", async () => {
            expect(await parse("10 ^ 2"   )()).to.be.Numb(100);
            expect(await parse("10 ^ 0"   )()).to.be.Numb(1);
            expect(await parse("10 ^ (-2)")()).to.be.Numb(0.01);
        });
    
        it("should return Undefined PowOperation for all the other type combinations", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined(), no=null;
            for (let [L,R] of [
                             [no,T], [n ,F], [no,n ], [no,s], [no,ls], [no,ns], [no,fn], [no,u ],
                    [T ,no], [T ,T], [T, F], [T ,n ], [T ,s], [T ,ls], [T ,ns], [T ,fn], [T ,u ],
                    [F ,no], [F ,T], [F, F], [F ,n ], [F ,s], [F ,ls], [F ,ns], [F ,fn], [F ,u ],
                    [n ,no], [n ,T], [n ,F],          [n ,s], [n ,ls], [n ,ns], [n ,fn], [n ,u ],
                    [s ,no], [s ,T], [s ,F], [s ,n ], [s, s], [s ,ls], [s ,ns], [s ,fn], [s ,u ],
                    [ls,no], [ls,T], [ls,F], [ls,n ], [ls,s], [ls,ls], [ls,ns], [ls,fn], [ls,u ],
                    [ns,no], [ns,T], [ns,F], [ns,n ], [ns,s], [ns,ls], [ns,ns], [ns,fn], [ns,u ],
                    [fn,no], [fn,T], [fn,F], [fn,n ], [fn,s], [fn,ls], [fn,ns], [fn,fn], [fn,u ],
                    [u ,no], [u ,T], [u ,F], [u ,n ], [u ,s], [u ,ls], [u ,ns], [u ,fn], [u ,u ] ]) {
    
                expect( await parse("L ^ R")({L,R}) ).to.be.Undefined('PowOperation', (arg0, arg1) => {
                    expect(arg0).to.deep.equal(L);
                    expect(arg1).to.deep.equal(R);
                });
            }
        });
    
        it("should return (x1*y1, x2*y2, ...) if X and/or Y is a tuple", async () => {
            expect(await parse("(10,20,30) * (2,3,4)")(context)).to.be.Tuple([20,60,120]);
    
            // partial exception
            var tuple = await parse("(10,20,30) ^ (1,2,{})")();
            expect(Array.from(tuple)[0]).to.equal(10);
            expect(Array.from(tuple)[1]).to.equal(400);
            expect(Array.from(tuple)[2]).to.be.Undefined('PowOperation', (arg0, arg1) => {
                expect(arg0).to.equal(30);
                expect(arg1).to.deep.equal({});
            });
        });
    });
    
    describe("X % Y", () => {
        
        it("should return () if both X and Y are nothing", async () => {
            expect(await parse("() % ()")(context)).to.be.Tuple([]);
        });

        it("should return the reminder of X/Y if both X and Y are numbers", async () => {
            expect(await parse("10 % 4"   )()).to.be.Numb(2);
            expect(await parse("10 % 5"   )()).to.be.Numb(0);
            expect(await parse("10 % (-4)")()).to.be.Numb(2);
            expect(await parse("10 % 0"   )()).to.be.Undefined("Number");
        });

        it("should return Undefined ModOperation if X and Y are of any other type", async () => {
            var T=true, F=false, n=10, s="abc", ls=[1,2,3], ns={a:1}, fn=x=>x, u=new Undefined(), no=null;
            for (let [L,R] of [
                             [no,T], [n ,F], [no,n ], [no,s], [no,ls], [no,ns], [no,fn], [no,u ],
                    [T ,no], [T ,T], [T, F], [T ,n ], [T ,s], [T ,ls], [T ,ns], [T ,fn], [T ,u ],
                    [F ,no], [F ,T], [F, F], [F ,n ], [F ,s], [F ,ls], [F ,ns], [F ,fn], [F ,u ],
                    [n ,no], [n ,T], [n ,F],          [n ,s], [n ,ls], [n ,ns], [n ,fn], [n ,u ],
                    [s ,no], [s ,T], [s ,F], [s ,n ], [s, s], [s ,ls], [s ,ns], [s ,fn], [s ,u ],
                    [ls,no], [ls,T], [ls,F], [ls,n ], [ls,s], [ls,ls], [ls,ns], [ls,fn], [ls,u ],
                    [ns,no], [ns,T], [ns,F], [ns,n ], [ns,s], [ns,ls], [ns,ns], [ns,fn], [ns,u ],
                    [fn,no], [fn,T], [fn,F], [fn,n ], [fn,s], [fn,ls], [fn,ns], [fn,fn], [fn,u ],
                    [u ,no], [u ,T], [u ,F], [u ,n ], [u ,s], [u ,ls], [u ,ns], [u ,fn], [u ,u ] ]) {
    
                expect( await parse("L % R")({L,R}) ).to.be.Undefined('ModOperation', (arg0, arg1) => {
                    expect(arg0).to.deep.equal(L);
                    expect(arg1).to.deep.equal(R);
                });
            }            
        });

        it("should return (x1%y1, x2%y2, ...) if X and/or Y is a tuple", async () => {
            expect(await parse("(10,20,30) % (4,7,6)")(context)).to.be.Tuple([2,6,0]);
    
            // partial exception
            var tuple = await parse("(10,20,30) % (4,7)")();
            expect(Array.from(tuple)[0]).to.equal(2);
            expect(Array.from(tuple)[1]).to.equal(6);
            expect(Array.from(tuple)[2]).to.be.Undefined('ModOperation', (arg0, arg1) => {
                expect(arg0).to.equal(30);
                expect(arg1).to.equal(null);
            });            
        });
    });
    
    
    
    // COMPARISON OPERATIONS
    
    describe("X == Y", () => {
    
        it("should return true if both X and Y are nothing", async () => {
            expect(await parse("() == ()")()).to.be.Bool(true);
        });
    
        it("should return true if X and Y are both true or both false", async () => {
            var context = {T:true, F:false};
            expect(await parse("T == T")(context)).to.be.Bool(true);
            expect(await parse("F == F")(context)).to.be.Bool(true);
            expect(await parse("T == F")(context)).to.be.Bool(false);
            expect(await parse("F == T")(context)).to.be.Bool(false);
        });
    
        it("should return true if X and Y are the same number", async () => {
            expect(await parse("3 == 3"  )()).to.be.Bool(true);
            expect(await parse("0 == 0"  )()).to.be.Bool(true);
            expect(await parse("-3 == -3")()).to.be.Bool(true);
            expect(await parse("3 == 2"  )()).to.be.Bool(false);
            expect(await parse("0 == -4" )()).to.be.Bool(false);
        });
    
        it("should return true if X and Y are the same string", async () => {
            expect(await parse("'abc' == 'abc'")()).to.be.Bool(true);
            expect(await parse("'' == ''"      )()).to.be.Bool(true);
            expect(await parse("'abc' == 'def'")()).to.be.Bool(false);
            expect(await parse("'abc' == ''"   )()).to.be.Bool(false);
        });
    
        it("should return true if X and Y are both lists with equal items", async () => {
            expect(await parse("[1,2,3] == [1,2,3]")()).to.be.Bool(true);
            expect(await parse("[] == []"          )()).to.be.Bool(true);
            expect(await parse("[1,2,3] == [4,5,6]")()).to.be.Bool(false);
            expect(await parse("[1,2,3] == []"     )()).to.be.Bool(false);
        });
    
        it("should return true if X and Y are both namespaces with sname name:value pairs", async () => {
            expect(await parse("{a=1,b=2} == {a=1,b=2}")()).to.be.Bool(true);
            expect(await parse("{} == {}"              )()).to.be.Bool(true);
            expect(await parse("{a=1,b=2} == {a=1,c=2}")()).to.be.Bool(false);
            expect(await parse("{a=1,b=2} == {a=1,b=3}")()).to.be.Bool(false);
            expect(await parse("{a=1,b=2} == {a=1}"    )()).to.be.Bool(false);
            expect(await parse("{a=1,b=2} == {}"       )()).to.be.Bool(false);
            expect(await parse("{a=1} == {a=1,b=2}"    )()).to.be.Bool(false);
            expect(await parse("{} == {a=1,b=2}"       )()).to.be.Bool(false);
    
            // Should not include inherited properties in the comparison
            var context = {};
            context.ns1 = {x:10};
            context.ns2 = Object.assign(Object.create(context.ns1), {y:20});
            expect(await parse("ns2 == {x:10,y:20}")(context)).to.be.Bool(false);
    
            // Should ignore non-valid swan names
            var context = {};
            context.ns1 = {x:10, y:20};
            context.ns2 = {x:10, y:20, $z:30};
            expect(await parse("ns1 == ns2")(context)).to.be.Bool(true);
        });
    
        it("should return true if X and Y are the same function", async () => {
            var context = {fn1:x=>2*x, fn2:x=>2*x};
            expect(await parse("fn1 == fn1"          )(context)).to.be.Bool(true);
            expect(await parse("fn1 == fn2"          )(context)).to.be.Bool(false);
            expect(await parse("(x->2*x) == (x->2*x)")(context)).to.be.Bool(false);
            expect(await parse("(x->2*x) == fn1"     )(context)).to.be.Bool(false);
            expect(await parse("fn1 == (x->2*x)"     )(context)).to.be.Bool(false);
        });
    
        it("should return true if X and Y are the same Undefined object", async () => {
            var context = {un1: new Undefined(), un2: new Undefined};
            expect(await parse("un1 == un1")(context)).to.be.Bool(true);
            expect(await parse("un1 == un2")(context)).to.be.Bool(false);
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
    
                expect(await parse("L == R")({L,R})).to.be.Bool(false);
            }
        });
    
        it("should compare tuples with lexicographical criteria", async () => {
            expect(await parse("(1,2,3) == (1,2,3)")()).to.be.Bool(true);
            expect(await parse("(1,2,3) == (1,2)"  )()).to.be.Bool(false);
            expect(await parse("(1,2) == (1,2,3)"  )()).to.be.Bool(false);
            expect(await parse("1 == (1,2,3)"      )()).to.be.Bool(false);
            expect(await parse("(1,2,3) == 1"      )()).to.be.Bool(false);
        });
    });
    
    describe("X != Y", () => {
    
        it("should return false if both X and Y are nothing", async () => {
            expect(await parse("() != ()")()).to.be.Bool(false);
        });
    
        it("should return false if X and Y are both false or both true", async () => {
            var context = {T:true, F:false};
            expect(await parse("T != T")(context)).to.be.Bool(false);
            expect(await parse("F != F")(context)).to.be.Bool(false);
            expect(await parse("T != F")(context)).to.be.Bool(true);
            expect(await parse("F != T")(context)).to.be.Bool(true);
        });
    
        it("should return false if X and Y are the same number", async () => {
            expect(await parse("3 != 3"  )()).to.be.Bool(false);
            expect(await parse("0 != 0"  )()).to.be.Bool(false);
            expect(await parse("-3 != -3")()).to.be.Bool(false);
            expect(await parse("3 != 2"  )()).to.be.Bool(true);
            expect(await parse("0 != -4" )()).to.be.Bool(true);
        });
    
        it("should return false if X and Y are the same string", async () => {
            expect(await parse("'abc' != 'abc'")()).to.be.Bool(false);
            expect(await parse("'' != ''"      )()).to.be.Bool(false);
            expect(await parse("'abc' != 'def'")()).to.be.Bool(true);
            expect(await parse("'abc' != ''"   )()).to.be.Bool(true);
        });
    
        it("should return false if X and Y are both lists with equal items", async () => {
            expect(await parse("[1,2,3] != [1,2,3]")()).to.be.Bool(false);
            expect(await parse("[] != []"          )()).to.be.Bool(false);
            expect(await parse("[1,2,3] != [4,5,6]")()).to.be.Bool(true);
            expect(await parse("[1,2,3] != []"     )()).to.be.Bool(true);
        });
    
        it("should return false if X and Y are both namespace with sname name:value pairs", async () => {
            expect(await parse("{a=1,b=2} != {a=1,b=2}")()).to.be.Bool(false);
            expect(await parse("{} != {}"              )()).to.be.Bool(false);
            expect(await parse("{a=1,b=2} != {a=1,c=2}")()).to.be.Bool(true);
            expect(await parse("{a=1,b=2} != {a=1,b=3}")()).to.be.Bool(true);
            expect(await parse("{a=1,b=2} != {a=1}"    )()).to.be.Bool(true);
            expect(await parse("{a=1,b=2} != {}"       )()).to.be.Bool(true);
            expect(await parse("{a=1} != {a=1,b=2}"    )()).to.be.Bool(true);
            expect(await parse("{} != {a=1,b=2}"       )()).to.be.Bool(true);
        });
    
        it("should return false if X and Y are the same function", async () => {
            var context = {fn1:x=>2*x, fn2:x=>2*x};
            expect(await parse("fn1 != fn1"          )(context)).to.be.Bool(false);
            expect(await parse("fn1 != fn2"          )(context)).to.be.Bool(true);
            expect(await parse("(x->2*x) != (x->2*x)")(context)).to.be.Bool(true);
            expect(await parse("(x->2*x) != fn1"     )(context)).to.be.Bool(true);
            expect(await parse("fn1 != (x->2*x)"     )(context)).to.be.Bool(true);
        });
    
        it("should return false if X and Y are the same Undefined object", async () => {
            var context = {un1: new Undefined(), un2: new Undefined};
            expect(await parse("un1 != un1")(context)).to.be.Bool(false);
            expect(await parse("un1 != un2")(context)).to.be.Bool(true);
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
    
                expect(await parse("L != R")({L,R})).to.be.Bool(true);
            }
        });
    
        it("should compare tuples with lexicographical criteria", async () => {
            expect(await parse("(1,2,3) != (1,2,3)")()).to.be.Bool(false);
            expect(await parse("(1,2,3) != (1,2)"  )()).to.be.Bool(true);
            expect(await parse("(1,2) != (1,2,3)"  )()).to.be.Bool(true);
            expect(await parse("1 != (1,2,3)"      )()).to.be.Bool(true);
            expect(await parse("(1,2,3) != 1"      )()).to.be.Bool(true);
        });
    });
    
    describe("X < Y", () => {
    
        it("should return false if both X and Y are nothing", async () => {
            expect(await parse("() < ()")()).to.be.Bool(false);
        });
    
        it("should return true if X is false and Y is true", async () => {
            var context = {T:true, F:false};
            expect(await parse("T < T")(context)).to.be.Bool(false);
            expect(await parse("F < F")(context)).to.be.Bool(false);
            expect(await parse("T < F")(context)).to.be.Bool(false);
            expect(await parse("F < T")(context)).to.be.Bool(true);
        });
    
        it("should return true if X is a lower number than Y", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("1  < 2   ")(context)).to.be.Bool(true);
            expect(await parse("0  < 2   ")(context)).to.be.Bool(true);
            expect(await parse("-1 < 2   ")(context)).to.be.Bool(true);
            expect(await parse("2  < 1   ")(context)).to.be.Bool(false);
            expect(await parse("2  < 0   ")(context)).to.be.Bool(false);
            expect(await parse("2  < (-2)")(context)).to.be.Bool(false);
            expect(await parse("2  < 2   ")(context)).to.be.Bool(false);
        });
    
        it("should return true if X and Y are both strings and X precedes Y alphabetically", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("'abc' < 'def'")(context)).to.be.Bool(true);
            expect(await parse("'abc' < 'abd'")(context)).to.be.Bool(true);
            expect(await parse("'ab'  < 'abc'")(context)).to.be.Bool(true);
            expect(await parse("''    < 'abc'")(context)).to.be.Bool(true);
            expect(await parse("'abc' < 'abc'")(context)).to.be.Bool(false);
            expect(await parse("'abd' < 'abc'")(context)).to.be.Bool(false);
            expect(await parse("'abc' < 'ab' ")(context)).to.be.Bool(false);
            expect(await parse("'abc' < ''   ")(context)).to.be.Bool(false);
        });
    
        it("should return true if X and Y are both lists and X precedes Y lexicographically", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("[1,2,3] < [4,5,6]")(context)).to.be.Bool(true);
            expect(await parse("[1,2,3] < [1,2,4]")(context)).to.be.Bool(true);
            expect(await parse("[1,2]   < [1,2,4]")(context)).to.be.Bool(true);
            expect(await parse("[]      < [1,2,3]")(context)).to.be.Bool(true);
            expect(await parse("[1,2,3] < [1,2,3]")(context)).to.be.Bool(false);
            expect(await parse("[1,2,4] < [1,2,3]")(context)).to.be.Bool(false);
            expect(await parse("[1,2,4] < [1,2]  ")(context)).to.be.Bool(false);
            expect(await parse("[1,2,3] < []     ")(context)).to.be.Bool(false);
        });
    
        it("should return false if both X and Y are namespaces", async () => {
            const context = {ns1:{}, ns2:{a:1}};
            expect(await parse("ns1 < ns2")(context)).to.be.Bool(false);
            expect(await parse("ns2 < ns1")(context)).to.be.Bool(false);
            expect(await parse("ns1 < ns1")(context)).to.be.Bool(false);
            expect(await parse("ns2 < ns2")(context)).to.be.Bool(false);
        });
    
        it("should return false if both X and Y are functions", async () => {
            const context = {fn1:x=>2*x, fn2:(x,y)=>x+y};
            expect(await parse("fn1 < fn2")(context)).to.be.Bool(false);
            expect(await parse("fn2 < fn1")(context)).to.be.Bool(false);
            expect(await parse("fn1 < fn1")(context)).to.be.Bool(false);
            expect(await parse("fn2 < fn2")(context)).to.be.Bool(false);
        });
    
        it("should return false if both X and Y are unfefined", async () => {
            const context = {un1:new Undefined("Op1",1,2), un2:new Undefined("Op2",1,2,3)};
            expect(await parse("un1 < un2")(context)).to.be.Bool(false);
            expect(await parse("un2 < un1")(context)).to.be.Bool(false);
            expect(await parse("un1 < un1")(context)).to.be.Bool(false);
            expect(await parse("un2 < un2")(context)).to.be.Bool(false);
        });
    
        it("should return true if X is nothing and Y is not", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("() < ()"    )(context)).to.be.Bool(false);
            expect(await parse("() < T"     )(context)).to.be.Bool(true);
            expect(await parse("() < F"     )(context)).to.be.Bool(true);
            expect(await parse("() < 1"     )(context)).to.be.Bool(true);
            expect(await parse("() < 'abc'" )(context)).to.be.Bool(true);
            expect(await parse("() < ls"    )(context)).to.be.Bool(true);
            expect(await parse("() < ns"    )(context)).to.be.Bool(true);
            expect(await parse("() < fn"    )(context)).to.be.Bool(true);
        });
    
        it("should return false if Y is nothing and X is not", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("()    < ()")(context)).to.be.Bool(false);
            expect(await parse("T     < ()")(context)).to.be.Bool(false);
            expect(await parse("F     < ()")(context)).to.be.Bool(false);
            expect(await parse("1     < ()")(context)).to.be.Bool(false);
            expect(await parse("'abc' < ()")(context)).to.be.Bool(false);
            expect(await parse("ls    < ()")(context)).to.be.Bool(false);
            expect(await parse("ns    < ()")(context)).to.be.Bool(false);
            expect(await parse("fn    < ()")(context)).to.be.Bool(false);
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
    
                expect(await parse("L < R")({L,R})).to.be.Bool(false);
            }
        });
    
        it("should compare tuples with lexicographical criteria", async () => {
            expect(await parse("(1,2,3) < (4,5,6)")()).to.be.Bool(true);
            expect(await parse("(1,2,3) < (1,2,4)")()).to.be.Bool(true);
            expect(await parse("(1,2)   < (1,2,4)")()).to.be.Bool(true);
            expect(await parse("()      < (1,2,3)")()).to.be.Bool(true);
            expect(await parse("(1,2,3) < (1,2,3)")()).to.be.Bool(false);
            expect(await parse("(1,2,4) < (1,2,3)")()).to.be.Bool(false);
            expect(await parse("(1,2,4) < (1,2)  ")()).to.be.Bool(false);
            expect(await parse("(1,2,3) < ()     ")()).to.be.Bool(false);
        });
    });
    
    describe("X >= Y", () => {
    
        it("should return true if both X and Y are nothing", async () => {
            expect(await parse("() >= ()")()).to.be.Bool(true);
        });
    
        it("should return true if X and Y are both booleans and X is true and Y either true or false", async () => {
            var context = {T:true, F:false};
            expect(await parse("T >= T")(context)).to.be.Bool(true);
            expect(await parse("F >= F")(context)).to.be.Bool(true);
            expect(await parse("T >= F")(context)).to.be.Bool(true);
            expect(await parse("F >= T")(context)).to.be.Bool(false);
        });
    
        it("should return true if X and Y are both numbers and X is a either a greater number than Y or equal to Y", async () => {
            expect(await parse("1  >= 2   ")()).to.be.Bool(false);
            expect(await parse("0  >= 2   ")()).to.be.Bool(false);
            expect(await parse("-1 >= 2   ")()).to.be.Bool(false);
            expect(await parse("2  >= 1   ")()).to.be.Bool(true);
            expect(await parse("2  >= 0   ")()).to.be.Bool(true);
            expect(await parse("2  >= (-2)")()).to.be.Bool(true);
            expect(await parse("2  >= 2   ")()).to.be.Bool(true);
        });
    
        it("should return true if X and Y are both strings and X either precedes Y alphabetically or is equal to Y", async () => {
            expect(await parse("'abc' >= 'def'")()).to.be.Bool(false);
            expect(await parse("'abc' >= 'abd'")()).to.be.Bool(false);
            expect(await parse("'ab'  >= 'abc'")()).to.be.Bool(false);
            expect(await parse("''    >= 'abc'")()).to.be.Bool(false);
            expect(await parse("'abc' >= 'abc'")()).to.be.Bool(true);
            expect(await parse("'abd' >= 'abc'")()).to.be.Bool(true);
            expect(await parse("'abc' >= 'ab' ")()).to.be.Bool(true);
            expect(await parse("'abc' >= ''   ")()).to.be.Bool(true);
        });
    
        it("should return true if X and Y are both lists and either X preceeds Y lexicographically or is equal to Y", async () => {
            expect(await parse("[1,2,3] >= [4,5,6]")()).to.be.Bool(false);
            expect(await parse("[1,2,3] >= [1,2,4]")()).to.be.Bool(false);
            expect(await parse("[1,2]   >= [1,2,4]")()).to.be.Bool(false);
            expect(await parse("[]      >= [1,2,3]")()).to.be.Bool(false);
            expect(await parse("[1,2,3] >= [1,2,3]")()).to.be.Bool(true);
            expect(await parse("[1,2,4] >= [1,2,3]")()).to.be.Bool(true);
            expect(await parse("[1,2,4] >= [1,2]  ")()).to.be.Bool(true);
            expect(await parse("[1,2,3] >= []     ")()).to.be.Bool(true);
        });
    
        it("should return true if both X and Y are namespaces, but only if they are the same object", async () => {
            const context = {ns1:{}, ns2:{a:1}};
            expect(await parse("ns1 >= ns2")(context)).to.be.Bool(false);
            expect(await parse("ns2 >= ns1")(context)).to.be.Bool(false);
            expect(await parse("ns1 >= ns1")(context)).to.be.Bool(true);
            expect(await parse("ns2 >= ns2")(context)).to.be.Bool(true);
        });
    
        it("should return true if both X and Y are functions, but only if they are the same object", async () => {
            const context = {fn1:x=>2*x, fn2:(x,y)=>x+y};
            expect(await parse("fn1 >= fn2")(context)).to.be.Bool(false);
            expect(await parse("fn2 >= fn1")(context)).to.be.Bool(false);
            expect(await parse("fn1 >= fn1")(context)).to.be.Bool(true);
            expect(await parse("fn2 >= fn2")(context)).to.be.Bool(true);
        });
    
        it("should return true if both X and Y are unfefined, but only if they are the same object", async () => {
            const context = {un1:new Undefined("Op1",1,2), un2:new Undefined("Op2",1,2,3)};
            expect(await parse("un1 >= un2")(context)).to.be.Bool(false);
            expect(await parse("un2 >= un1")(context)).to.be.Bool(false);
            expect(await parse("un1 >= un1")(context)).to.be.Bool(true);
            expect(await parse("un2 >= un2")(context)).to.be.Bool(true);
        });
    
        it("should return false if X is nothing and Y is not", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("() >= ()   ")(context)).to.be.Bool(true);
            expect(await parse("() >= T    ")(context)).to.be.Bool(false);
            expect(await parse("() >= F    ")(context)).to.be.Bool(false);
            expect(await parse("() >= 1    ")(context)).to.be.Bool(false);
            expect(await parse("() >= 'abc'")(context)).to.be.Bool(false);
            expect(await parse("() >= ls   ")(context)).to.be.Bool(false);
            expect(await parse("() >= ns   ")(context)).to.be.Bool(false);
            expect(await parse("() >= fn   ")(context)).to.be.Bool(false);
        });
    
        it("should return true if Y is nothing", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("()    >= ()")(context)).to.be.Bool(true);
            expect(await parse("T     >= ()")(context)).to.be.Bool(true);
            expect(await parse("F     >= ()")(context)).to.be.Bool(true);
            expect(await parse("1     >= ()")(context)).to.be.Bool(true);
            expect(await parse("'abc' >= ()")(context)).to.be.Bool(true);
            expect(await parse("ls    >= ()")(context)).to.be.Bool(true);
            expect(await parse("ns    >= ()")(context)).to.be.Bool(true);
            expect(await parse("fn    >= ()")(context)).to.be.Bool(true);
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
    
                expect(await parse("L >= R")({L,R})).to.be.Bool(false);
            }
        });
    
        it("should compare tuples with lexicographical criteria", async () => {
            expect(await parse("(1,2,3) >= (4,5,6)")()).to.be.Bool(false);
            expect(await parse("(1,2,3) >= (1,2,4)")()).to.be.Bool(false);
            expect(await parse("(1,2)   >= (1,2,4)")()).to.be.Bool(false);
            expect(await parse("()      >= (1,2,3)")()).to.be.Bool(false);
            expect(await parse("(1,2,3) >= (1,2,3)")()).to.be.Bool(true);
            expect(await parse("(1,2,4) >= (1,2,3)")()).to.be.Bool(true);
            expect(await parse("(1,2,4) >= (1,2)  ")()).to.be.Bool(true);
            expect(await parse("(1,2,3) >= ()     ")()).to.be.Bool(true);
        });
    });
    
    describe("X > Y", () => {
    
        it("should return false if both X and Y are nothing", async () => {
            expect(await parse("() > ()")()).to.be.Bool(false);
        });
    
        it("should return true if X is true and Y is false", async () => {
            var context = {T:true, F:false};
            expect(await parse("T > T")(context)).to.be.Bool(false);
            expect(await parse("F > F")(context)).to.be.Bool(false);
            expect(await parse("T > F")(context)).to.be.Bool(true);
            expect(await parse("F > T")(context)).to.be.Bool(false);
        });
    
        it("should return true if X is a higher number than Y", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("1  > 2   ")(context)).to.be.Bool(false);
            expect(await parse("0  > 2   ")(context)).to.be.Bool(false);
            expect(await parse("-1 > 2   ")(context)).to.be.Bool(false);
            expect(await parse("2  > 1   ")(context)).to.be.Bool(true);
            expect(await parse("2  > 0   ")(context)).to.be.Bool(true);
            expect(await parse("2  > (-2)")(context)).to.be.Bool(true);
            expect(await parse("2  > 2   ")(context)).to.be.Bool(false);
        });
    
        it("should return true if X and Y are both strings and X precedes Y alphabetically", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("'abc' > 'def'")(context)).to.be.Bool(false);
            expect(await parse("'abc' > 'abd'")(context)).to.be.Bool(false);
            expect(await parse("'ab'  > 'abc'")(context)).to.be.Bool(false);
            expect(await parse("''    > 'abc'")(context)).to.be.Bool(false);
            expect(await parse("'abc' > 'abc'")(context)).to.be.Bool(false);
            expect(await parse("'abd' > 'abc'")(context)).to.be.Bool(true);
            expect(await parse("'abc' > 'ab' ")(context)).to.be.Bool(true);
            expect(await parse("'abc' > ''   ")(context)).to.be.Bool(true);
        });
    
        it("should return true if X and Y are both lists and X follows Y lexicographically", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("[1,2,3] > [4,5,6]")(context)).to.be.Bool(false);
            expect(await parse("[1,2,3] > [1,2,4]")(context)).to.be.Bool(false);
            expect(await parse("[1,2]   > [1,2,4]")(context)).to.be.Bool(false);
            expect(await parse("[]      > [1,2,3]")(context)).to.be.Bool(false);
            expect(await parse("[1,2,3] > [1,2,3]")(context)).to.be.Bool(false);
            expect(await parse("[1,2,4] > [1,2,3]")(context)).to.be.Bool(true);
            expect(await parse("[1,2,4] > [1,2]  ")(context)).to.be.Bool(true);
            expect(await parse("[1,2,3] > []     ")(context)).to.be.Bool(true);
        });
    
        it("should return false if both X and Y are namespaces", async () => {
            const context = {ns1:{}, ns2:{a:1}};
            expect(await parse("ns1 > ns2")(context)).to.be.Bool(false);
            expect(await parse("ns2 > ns1")(context)).to.be.Bool(false);
            expect(await parse("ns1 > ns1")(context)).to.be.Bool(false);
            expect(await parse("ns2 > ns2")(context)).to.be.Bool(false);
        });
    
        it("should return false if both X and Y are functions", async () => {
            const context = {fn1:x=>2*x, fn2:(x,y)=>x+y};
            expect(await parse("fn1 > fn2")(context)).to.be.Bool(false);
            expect(await parse("fn2 > fn1")(context)).to.be.Bool(false);
            expect(await parse("fn1 > fn1")(context)).to.be.Bool(false);
            expect(await parse("fn2 > fn2")(context)).to.be.Bool(false);
        });
    
        it("should return false if both X and Y are unfefined", async () => {
            const context = {un1:new Undefined("Op1",1,2), un2:new Undefined("Op2",1,2,3)};
            expect(await parse("un1 > un2")(context)).to.be.Bool(false);
            expect(await parse("un2 > un1")(context)).to.be.Bool(false);
            expect(await parse("un1 > un1")(context)).to.be.Bool(false);
            expect(await parse("un2 > un2")(context)).to.be.Bool(false);
        });
    
        it("should return false if X is nothing", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("() > ()"    )(context)).to.be.Bool(false);
            expect(await parse("() > T"     )(context)).to.be.Bool(false);
            expect(await parse("() > F"     )(context)).to.be.Bool(false);
            expect(await parse("() > 1"     )(context)).to.be.Bool(false);
            expect(await parse("() > 'abc'" )(context)).to.be.Bool(false);
            expect(await parse("() > ls"    )(context)).to.be.Bool(false);
            expect(await parse("() > ns"    )(context)).to.be.Bool(false);
            expect(await parse("() > fn"    )(context)).to.be.Bool(false);
        });
    
        it("should return true if Y is nothing and X is not", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("()    > ()")(context)).to.be.Bool(false);
            expect(await parse("T     > ()")(context)).to.be.Bool(true);
            expect(await parse("F     > ()")(context)).to.be.Bool(true);
            expect(await parse("1     > ()")(context)).to.be.Bool(true);
            expect(await parse("'abc' > ()")(context)).to.be.Bool(true);
            expect(await parse("ls    > ()")(context)).to.be.Bool(true);
            expect(await parse("ns    > ()")(context)).to.be.Bool(true);
            expect(await parse("fn    > ()")(context)).to.be.Bool(true);
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
    
                expect(await parse("L > R")({L,R})).to.be.Bool(false);
            }
        });
    
        it("should compare tuples with lexicographical criteria", async () => {
            expect(await parse("(1,2,3) > (4,5,6)")()).to.be.Bool(false);
            expect(await parse("(1,2,3) > (1,2,4)")()).to.be.Bool(false);
            expect(await parse("(1,2)   > (1,2,4)")()).to.be.Bool(false);
            expect(await parse("()      > (1,2,3)")()).to.be.Bool(false);
            expect(await parse("(1,2,3) > (1,2,3)")()).to.be.Bool(false);
            expect(await parse("(1,2,4) > (1,2,3)")()).to.be.Bool(true);
            expect(await parse("(1,2,4) > (1,2)  ")()).to.be.Bool(true);
            expect(await parse("(1,2,3) > ()     ")()).to.be.Bool(true);
        });
    });
    
    describe("X <= Y", () => {
    
        it("should return true if both X and Y are nothing", async () => {
            expect(await parse("() <= ()")()).to.be.Bool(true);
        });
    
        it("should return true if X and Y are both booleans and X is false and Y either true or false", async () => {
            var context = {T:true, F:false};
            expect(await parse("T <= T")(context)).to.be.Bool(true);
            expect(await parse("F <= F")(context)).to.be.Bool(true);
            expect(await parse("T <= F")(context)).to.be.Bool(false);
            expect(await parse("F <= T")(context)).to.be.Bool(true);
        });
    
        it("should return true if X and Y are both numbers and X is a either a smaller number than Y or equal to Y", async () => {
            expect(await parse("1  <= 2   ")()).to.be.Bool(true);
            expect(await parse("0  <= 2   ")()).to.be.Bool(true);
            expect(await parse("-1 <= 2   ")()).to.be.Bool(true);
            expect(await parse("2  <= 1   ")()).to.be.Bool(false);
            expect(await parse("2  <= 0   ")()).to.be.Bool(false);
            expect(await parse("2  <= (-2)")()).to.be.Bool(false);
            expect(await parse("2  <= 2   ")()).to.be.Bool(true);
        });
    
        it("should return true if X and Y are both strings and X either follows Y alphabetically or is equal to Y", async () => {
            expect(await parse("'abc' <= 'def'")()).to.be.Bool(true);
            expect(await parse("'abc' <= 'abd'")()).to.be.Bool(true);
            expect(await parse("'ab'  <= 'abc'")()).to.be.Bool(true);
            expect(await parse("''    <= 'abc'")()).to.be.Bool(true);
            expect(await parse("'abc' <= 'abc'")()).to.be.Bool(true);
            expect(await parse("'abd' <= 'abc'")()).to.be.Bool(false);
            expect(await parse("'abc' <= 'ab' ")()).to.be.Bool(false);
            expect(await parse("'abc' <= ''   ")()).to.be.Bool(false);
        });
    
        it("should return true if X and Y are both lists and either X preceeds Y lexicographically or is equal to Y", async () => {
            expect(await parse("[1,2,3] <= [4,5,6]")()).to.be.Bool(true);
            expect(await parse("[1,2,3] <= [1,2,4]")()).to.be.Bool(true);
            expect(await parse("[1,2]   <= [1,2,4]")()).to.be.Bool(true);
            expect(await parse("[]      <= [1,2,3]")()).to.be.Bool(true);
            expect(await parse("[1,2,3] <= [1,2,3]")()).to.be.Bool(true);
            expect(await parse("[1,2,4] <= [1,2,3]")()).to.be.Bool(false);
            expect(await parse("[1,2,4] <= [1,2]  ")()).to.be.Bool(false);
            expect(await parse("[1,2,3] <= []     ")()).to.be.Bool(false);
        });
    
        it("should return true if both X and Y are namespaces, but only if they are the same object", async () => {
            const context = {ns1:{}, ns2:{a:1}};
            expect(await parse("ns1 <= ns2")(context)).to.be.Bool(false);
            expect(await parse("ns2 <= ns1")(context)).to.be.Bool(false);
            expect(await parse("ns1 <= ns1")(context)).to.be.Bool(true);
            expect(await parse("ns2 <= ns2")(context)).to.be.Bool(true);
        });
    
        it("should return true if both X and Y are functions, but only if they are the same object", async () => {
            const context = {fn1:x=>2*x, fn2:(x,y)=>x+y};
            expect(await parse("fn1 <= fn2")(context)).to.be.Bool(false);
            expect(await parse("fn2 <= fn1")(context)).to.be.Bool(false);
            expect(await parse("fn1 <= fn1")(context)).to.be.Bool(true);
            expect(await parse("fn2 <= fn2")(context)).to.be.Bool(true);
        });
    
        it("should return true if both X and Y are unfefined, but only if they are the same object", async () => {
            const context = {un1:new Undefined("Op1",1,2), un2:new Undefined("Op2",1,2,3)};
            expect(await parse("un1 <= un2")(context)).to.be.Bool(false);
            expect(await parse("un2 <= un1")(context)).to.be.Bool(false);
            expect(await parse("un1 <= un1")(context)).to.be.Bool(true);
            expect(await parse("un2 <= un2")(context)).to.be.Bool(true);
        });
    
        it("should return true if X is nothing", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("() <= ()   ")(context)).to.be.Bool(true);
            expect(await parse("() <= T    ")(context)).to.be.Bool(true);
            expect(await parse("() <= F    ")(context)).to.be.Bool(true);
            expect(await parse("() <= 1    ")(context)).to.be.Bool(true);
            expect(await parse("() <= 'abc'")(context)).to.be.Bool(true);
            expect(await parse("() <= ls   ")(context)).to.be.Bool(true);
            expect(await parse("() <= ns   ")(context)).to.be.Bool(true);
            expect(await parse("() <= fn   ")(context)).to.be.Bool(true);
        });
    
        it("should return false if Y is nothing and X is not", async () => {
            var context = {fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false};
            expect(await parse("()    <= ()")(context)).to.be.Bool(true);
            expect(await parse("T     <= ()")(context)).to.be.Bool(false);
            expect(await parse("F     <= ()")(context)).to.be.Bool(false);
            expect(await parse("1     <= ()")(context)).to.be.Bool(false);
            expect(await parse("'abc' <= ()")(context)).to.be.Bool(false);
            expect(await parse("ls    <= ()")(context)).to.be.Bool(false);
            expect(await parse("ns    <= ()")(context)).to.be.Bool(false);
            expect(await parse("fn    <= ()")(context)).to.be.Bool(false);
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
    
                expect(await parse("L <= R")({L,R})).to.be.Bool(false);
            }
        });
    
        it("should compare tuples with lexicographical criteria", async () => {
            expect(await parse("(1,2,3) <= (4,5,6)")()).to.be.Bool(true);
            expect(await parse("(1,2,3) <= (1,2,4)")()).to.be.Bool(true);
            expect(await parse("(1,2)   <= (1,2,4)")()).to.be.Bool(true);
            expect(await parse("()      <= (1,2,3)")()).to.be.Bool(true);
            expect(await parse("(1,2,3) <= (1,2,3)")()).to.be.Bool(true);
            expect(await parse("(1,2,4) <= (1,2,3)")()).to.be.Bool(false);
            expect(await parse("(1,2,4) <= (1,2)  ")()).to.be.Bool(false);
            expect(await parse("(1,2,3) <= ()     ")()).to.be.Bool(false);
        });
    });
    
    
    
    // MISCELLANEOUS
    
    describe("string templates", () => {
    
        it("should evaluate string literals between accent quotes '``'", async () => {
            expect(await parse("`ab\nc`")()).to.be.Text("ab\nc");
            expect(await parse("``")()).to.be.Text("");
        });
    
        it("should replace expressions between `{%` and `%}` with their value", async () => {
            expect(await parse("`aaa {% 2*x %} bbb`")({x:10})).to.be.Text("aaa 20 bbb");
        });
    });
    
    describe("precedence", () => {
    
        describe("Arithmetic operations", () => {
    
            it("should execute `+` and `-` with the same precedence", async () => {
                expect(await parse("3+5-2")()).to.be.Numb(6);
            });
    
            it("should execute `*` and `/` with the same precedence", async () => {
                expect(await parse("10*2/5")()).to.be.Numb(4);
                expect(await parse("10/2*5")()).to.be.Numb(25);
            });
    
            it("should execute `*` and `/` before `+` and `-`", async () => {
                expect(await parse("3+2*4")()).to.be.Numb(11);
                expect(await parse("2*4+3")()).to.be.Numb(11);
                expect(await parse("8+6/2")()).to.be.Numb(11);
                expect(await parse("6/2+8")()).to.be.Numb(11);
            });
            
            it("should execute `^` before `*` and `/`", async () => {
                expect(await parse("3*2^4")()).to.be.Numb(48);
                expect(await parse("2^4*3")()).to.be.Numb(48);
            });            
        });
    
        describe("Parenthesis", () => {
    
            it("Should execute parenthesis first", async () => {
                expect(await parse("3*(6-1)")()).to.be.Numb(15);
            });            
        });
    
        describe("Apply and Subcontexting", () => {
    
            it("should execute apply operations before arithmetic operations", async () => {
                const context = {fn:x=>2*x, ns:{a:10, b:20, fn:x=>10*x}, ls:[10,20,30]}
    
                expect(await parse("fn 3+5")(context)).to.be.Numb(11);
                expect(await parse("fn(3+5)")(context)).to.be.Numb(16);
    
                expect(await parse("ls 1 + 1")(context)).to.be.Numb(21);
                expect(await parse("ls(1+1)")(context)).to.be.Numb(30);
    
                expect(await parse("ns 'a' + 1")(context)).to.be.Numb(11);
                expect(await parse("ns('a'+1)")(context)).to.be.Undefined('Mapping');                
            });
    
            it("should execute subcontexting operations before arithmetic operations", async () => {
                const context = {ns:{a:10, b:20, fn:x=>10*x}, b:2}
                expect(await parse("ns.a + b")(context)).to.be.Numb(12);
                expect(await parse("ns.(a + b)")(context)).to.be.Numb(30);                
            });
    
            it("should execute apply and subcontexting operations with the same precedence", async () => {
                const context = {fn:x=>2*x, ns:{a:10, b:20, fn:x=>10*x}, b:2}
                expect(await parse("ns.fn b")(context)).to.be.Numb(20);
                expect(await parse("ns.(fn b)")(context)).to.be.Numb(200);
                expect(await parse("fn ns.a")(context)).to.be.Undefined('SubcontextingOperation');
                expect(await parse("fn(ns.a)")(context)).to.be.Numb(20);                
            });
        });
    
        describe("Comparison operations", () => {
    
            it("should execute comparison operations after arithmetic operations", async () => {
                expect(await parse("3 + 2 == 1 + 4")()).to.be.Bool(true);
                expect(await parse("3 + 2 != 1 + 1")()).to.be.Bool(true);
                expect(await parse("3 + 2 <  5 + 4")()).to.be.Bool(true);
                expect(await parse("3 + 2 <= 5 + 4")()).to.be.Bool(true);
                expect(await parse("3 + 7 >  1 + 4")()).to.be.Bool(true);
                expect(await parse("3 + 2 >= 1 + 4")()).to.be.Bool(true);
            });
    
            it("should execute comparison operations after apply operations", async () => {
                const context = {fn2:x=>2*x, fn10:x=>10*x};
                expect(await parse("fn2 10 == fn10 2")(context)).to.be.Bool(true);
            });
    
            it("should execute comparison operations after subcontexting operations", async () => {
                const context = {ns:{a:10, b:20}, a:2, b:1};
                expect(await parse("ns . a < ns . b")(context)).to.be.Bool(true);
            });
        });
    
        describe("Logic operations", () => {
    
            it("shoudl execute `|` and `&` with the same precedence", async () => {
                expect(await parse("1 | 2 & 3  ")()).to.be.Numb(3);
                expect(await parse("1 | (2 & 3)")()).to.be.Numb(1);
            });
    
            it("shoudl execute `?` after `|` and `&`", async () => {
                expect(await parse("1 | 0 ? 3  ")()).to.be.Numb(3);
                expect(await parse("1 | (0 ? 3)")()).to.be.Numb(1);
                expect(await parse("1 & 2 ? 3  ")()).to.be.Numb(3);
            });
    
            it("shoudl execute `;` after `?`", async () => {
                expect(await parse("1 ? 2 ; 3 ")()).to.be.Numb(2);
                expect(await parse("0 ? 2 ; 3 ")()).to.be.Numb(3);                
                expect(await parse("1 ; 2 ? 3 ")()).to.be.Numb(1);  
                expect(await parse("(2:2) ; 2 ? 3")()).to.be.Numb(3);  
            });
    
            it("should execute logic operations after comparison operations", async () => {
                expect(await parse("1 < 2 & 3 > 2 ? 4 ; 5")()).to.be.Numb(4);
                expect(await parse("1 > 2 | 3 < 2 ? 4 ; 5")()).to.be.Numb(5);
            });
        });
    
        describe("Function definition", () => {
    
            it("should execute after logic operations", async () => {
                expect(await parse("(x -> x ? 1 ; 2)(10)")()).to.be.Numb(1);
                expect(await parse("(x -> x ? 1 ; 2)(0) ")()).to.be.Numb(2);
            });
    
            it("should be right-associative", async () => {
                expect(await parse("(x -> y -> x - y)(10)(3)")()).to.be.Numb(7);
            });
        });
    
        describe("Assignment and labelling operations", () => {
    
            it("should execute `:` and `=` with the same precedence", async () => {
                const context = {};
                expect(await parse("x = y : 10")()).to.be.Undefined("LabellingOperation");
                expect(await parse("x = (y : 10)")(context)).to.be.Tuple([]);
                expect(context.x).to.equal(10);
                expect(context.y).to.equal(10);
            });
    
            it("should execute `:` and `=` after function definitions", async () => {
                const context = {};
    
                await parse("f : x -> 2 * x")(context);
                expect(await context.f(2)).to.be.Numb(4);
    
                await parse("g = x -> 3 * x")(context);
                expect(await context.g(2)).to.be.Numb(6);
            });
        });
    
        describe("Pairing operation", () => {
    
            it("should always be executed with lowest priority", async () => {
                const context = {};
                await parse("x = 1 , y = 2")(context);
                expect(context.x).to.equal(1);
                expect(context.y).to.equal(2);
            });
        });
    });
    
    describe("parsing errors", () => {
    
        // Lexer Errors
    
        it("should throw a Syntax Error on missing closing quote", async () => {
            try {
                parse("\n'abc")
                throw new Error("It didn not throw!");
            } catch (e) {
                expect(e.message).to.equal("Closing quote expected @2:4")
            }
        });
    
        it("should throw a Syntax Error on missing numeric literal exponent", async () => {
            try {
                parse("123E+")
                throw new Error("It didn not throw!");
            } catch (e) {
                expect(e.message).to.equal("Expected exponent value @1:5");
            }
        });
    
        it("should throw a Syntax Error on invalid numeric literal", async () => {
            try {
                parse("1abc")
                throw new Error("It didn not throw!");
            } catch (e) {
                expect(e.message).to.equal("Invalid number @1:0");
            }
        });
    
        it("should throw a Syntax Error on unexpected period", async () => {
            try {
                parse("12.34.56")
                throw new Error("It didn not throw!");
            } catch (e) {
                expect(e.message).to.equal("Unexpected period @1:5");
            }
        });
    
        it("should throw a Syntax Error on invalid identifier", async () => {
            try {
                parse("$a")
                throw new Error("It didn not throw!");
            } catch (e) {
                expect(e.message).to.equal("Unexpected character '$' @1:0");
            }
        });
    
    
        // Parsing Errors
    
        it("should throw a Syntax Error on missing operand", async () => {
            try {
                parse("125 +")
                throw new Error("It didn not throw!");
            } catch (e) {
                expect(e.message).to.equal("Operand expected @1:5");
            }

            try {
                parse("(125 +")
                throw new Error("It didn not throw!");
            } catch (e) {
                expect(e.message).to.equal("Operand expected @1:6");
            }
            
            try {
                parse("125 + *")
                throw new Error("It didn not throw!");
            } catch (e) {
                expect(e.message).to.equal("Operand expected @1:6");
            }
        });
    });
    
    describe("Undefined Operation", () => {
        
        it("Should contain the source position of the undefined operation", async () => {
            const source = "{} - []";
            const undef = await parse("{} - []")();
            expect(undef).to.be.Undefined("SubOperation");
            expect(undef.position).to.deep.equal({
                source: source,
                index: 3
            })
        });
    });
});
