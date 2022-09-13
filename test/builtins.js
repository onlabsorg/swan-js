const expect = require("./expect");

const types = require("../lib/types");
const builtins = require("../lib/builtins");

const parse = require("../lib/interpreter");
const evaluate = (expression, presets={}) => parse(expression)(Object.assign(Object.create(builtins), presets));


describe("builtins", () => {
    
    describe("TRUE", () => {
        
        it("should be true", async () => {
            expect(await evaluate("TRUE")).to.be.Bool(true);
        });
    });
    
    describe("FALSE", () => {
        
        it("should be true", async () => {
            expect(await evaluate("FALSE")).to.be.Bool(false);
        });
    });

    describe("bool: Term t -> Bool b", () => {
        
        it("should return FALSE if the argument is a falsy term", async () => {
            expect(await evaluate("bool ()       ")).to.be.Bool(false);
            expect(await evaluate("bool (1 == 2) ")).to.be.Bool(false);
            expect(await evaluate("bool 0        ")).to.be.Bool(false);
            expect(await evaluate("bool ''       ")).to.be.Bool(false);
            expect(await evaluate("bool []       ")).to.be.Bool(false);
            expect(await evaluate("bool {}       ")).to.be.Bool(false);
            expect(await evaluate("bool ('a'/'b')")).to.be.Bool(false);
            expect(await evaluate("bool (0,'',[])")).to.be.Bool(false);
        });

        it("should return TRUE if the argument is a truty term", async () => {
            expect(await evaluate("bool (x->x)   ")).to.be.Bool(true);
            expect(await evaluate("bool (1 == 1) ")).to.be.Bool(true);
            expect(await evaluate("bool 10       ")).to.be.Bool(true);
            expect(await evaluate("bool 'abc'    ")).to.be.Bool(true);
            expect(await evaluate("bool [1,2,3]  ")).to.be.Bool(true);
            expect(await evaluate("bool {a:1}    ")).to.be.Bool(true);
            expect(await evaluate("bool (1,'',[])")).to.be.Bool(true);
        });
    });
    
    describe("not: Term t -> Bool b", () => {
        
        it("should return TRUE if the argument is a falsy term", async () => {
            expect(await evaluate("not ()       ")).to.be.Bool(true);
            expect(await evaluate("not (1 == 2) ")).to.be.Bool(true);
            expect(await evaluate("not 0        ")).to.be.Bool(true);
            expect(await evaluate("not ''       ")).to.be.Bool(true);
            expect(await evaluate("not []       ")).to.be.Bool(true);
            expect(await evaluate("not {}       ")).to.be.Bool(true);
            expect(await evaluate("not ('a'/'b')")).to.be.Bool(true);
            expect(await evaluate("not (0,'',[])")).to.be.Bool(true);
        });

        it("should return FALSE if the argument is a truty term", async () => {
            expect(await evaluate("not (x->x)   ")).to.be.Bool(false);
            expect(await evaluate("not (1 == 1) ")).to.be.Bool(false);
            expect(await evaluate("not 10       ")).to.be.Bool(false);
            expect(await evaluate("not 'abc'    ")).to.be.Bool(false);
            expect(await evaluate("not [1,2,3]  ")).to.be.Bool(false);
            expect(await evaluate("not {a:1}    ")).to.be.Bool(false);
            expect(await evaluate("not (1,'',[])")).to.be.Bool(false);
        });
    });            
    
    describe("str: Term t -> Text s", () => {
        
        it("should return either 'TRUE' or 'FALSE' if the argument is a Bool item", async () => {
            expect(await evaluate("str(1==1)")).to.be.Text("TRUE");
            expect(await evaluate("str(1!=1)")).to.be.Text("FALSE");
        });
        
        it("should return the stringified decimal if the argument is a Numb item", async () => {
            expect(await evaluate("str 123.45")).to.be.Text("123.45");
        });

        it("should return the argument itself if is a Text item", async () => {
            expect(await evaluate("str 'abc'")).to.be.Text("abc");
        });

        it("should return '[[List of <n> items]]' if the argument is a List item", async () => {
            expect(await evaluate("str [10,20,30]")).to.be.Text("[[List of 3 items]]");
            expect(await evaluate("str [10]      ")).to.be.Text("[[List of 1 item]]");
            expect(await evaluate("str []        ")).to.be.Text("[[List of 0 items]]");
        });
        
        it("should return '[[Func]]' if the argument is a Func item", async () => {
            expect(await evaluate("str(x->x)")).to.be.Text("[[Func]]");
        });
        
        it("should return '[[Undefined <type>]]' if the argument is an Undefined item", async () => {
            const u = new types.Undefined("TestOp")
            expect(await evaluate("str(u)", {u})).to.be.Text("[[Undefined TestOp]]");
        });
        
        it("should concatenate the stringified items if the argument is a tuple", async () => {
            expect(await evaluate("str(12,'+',10)")).to.be.Text("12+10");
            expect(await evaluate("str()         ")).to.be.Text("");
        });
        
        describe("when the argument is a Namespace item NS", () => {
            
            it("should return '[[Namespace of n items]]' if no __str__ name is defined", async () => {
                expect(await evaluate("str{k1:1,k2:2,k3:3}")).to.be.Text("[[Namespace of 3 items]]");
                expect(await evaluate("str{k1:1          }")).to.be.Text("[[Namespace of 1 item]]");
                expect(await evaluate("str{              }")).to.be.Text("[[Namespace of 0 items]]");
            });
            
            it("should return `str(NS.__str__(NS))` if `NS.__str__` is a Func item", async () => {
                expect(await evaluate("str{t:456, __str__: self -> self.t}")).to.be.Text("456");
                expect(await evaluate("str{t:456, __str__: 'abc'}")).to.be.Text("[[Namespace of 2 items]]");
            });
        });
    });
    
    describe("size: Mapping m -> Numb n", () => {
        
        it("should return the number of characters if m is a Text item", async () => {
            expect(await evaluate("size 'abc'")).to.be.Numb(3);
        });
        
        it("should return the number of items if m is a List item", async () => {
            expect(await evaluate("size [10,20,30]")).to.be.Numb(3);
        });
        
        it("should return the number of name:value pairs if m is a Namespace item", async () => {
            expect(await evaluate("size {a:2,b:4,c:6}")).to.be.Numb(3);
        });

        it("should return Undefined Number if the argument is not a mapping", async () => {
            expect(await evaluate("size TRUE")).to.be.Undefined("Number");
            expect(await evaluate("size 123")).to.be.Undefined("Number");
            expect(await evaluate("size(x->x)")).to.be.Undefined("Number");
        });

        it("should apply to the first items only, if the argument is a truple", async () => {
            expect(await evaluate("size('ABC','Defg')")).to.be.Numb(3);
        });                        
    });

    describe("dom: Mapping m -> Tuple t", () => {
        
        it("should return (0,1,2,...,Len-1) if m is a Text item", async () => {
            expect(await evaluate("dom 'abc'")).to.be.Tuple([0,1,2]);
        });
        
        it("should return (0,1,2,...,Len-1) if m is a List item", async () => {
            expect(await evaluate("dom [10,20,30]")).to.be.Tuple([0,1,2]);
        });
        
        it("should return the tuple of name:value pairs if m is a Namespace item", async () => {
            expect(await evaluate("dom {a:2,b:4,c:6}")).to.be.Tuple(['a','b','c']);
        });

        it("should return Undefined Term if the argument is not a mapping", async () => {
            expect(await evaluate("dom TRUE")).to.be.Undefined("Term");
            expect(await evaluate("dom 123")).to.be.Undefined("Term");
            expect(await evaluate("dom(x->x)")).to.be.Undefined("Term");
        });

        it("should apply to the first items only, if the argument is a truple", async () => {
            expect(await evaluate("dom('ABC','Defg')")).to.be.Tuple([0,1,2]);
        });                        
    });

    describe("type: Item x -> Text t", () => {
        
        it("should return the type name of the passed item", async () => {
            expect(await evaluate("type(1==1)")).to.be.Text("Bool");
            expect(await evaluate("type 10   ")).to.be.Text("Numb");
            expect(await evaluate("type 'abc'")).to.be.Text("Text");
            expect(await evaluate("type [10] ")).to.be.Text("List");
            expect(await evaluate("type {a:1}")).to.be.Text("Namespace");
            expect(await evaluate("type(x->x)")).to.be.Text("Func");
            expect(await evaluate("type(2*[])")).to.be.Text("Undefined");
        });
        
        it("should return a tuple of strings if the argument is a tuple", async () => {
            expect(await evaluate("type(10,'abc',[])")).to.be.Tuple(["Numb","Text","List"]);
            expect(await evaluate("type()")).to.be.Tuple([]);
        });
    
    });    
    
    describe("range: Numb n -> Numb Tuple r", () => {
        
        it("should return a tuple of integer numbers between 0 and n (excluded)", async () => {
            expect(await evaluate("range 4")).to.be.Tuple([0,1,2,3]);
            expect(await evaluate("range 4.1")).to.be.Tuple([0,1,2,3,4]);
        });
        
        it("should return Undefined Tuple if n is not a Numb item", async () => {
            expect(await evaluate("range 'abc'")).to.be.Undefined("Tuple");
        });
        
        it("should apply only to the first item if n is a tuple", async () => {
            expect(await evaluate("range(4,2)")).to.be.Tuple([0,1,2,3]);
        });
    });
    
    describe("parent: Namespace x -> Namespace p", () => {
        
        it("should return the prototype of x", async () => {
            const presets = {p:{x:10}};
            presets.c = Object.create(presets.p);
            expect(await evaluate("parent c", presets)).to.be.Namespace(presets.p);
        });

        it("should return Undefined Namespace if x has no prototype", async () => {
            const presets = { o: Object.create(null) };
            expect(await evaluate("parent o", presets)).to.be.Undefined("Namespace");
        });

        it("should return Undefined Namespace if x is not a namespace", async () => {
            expect(await evaluate("parent 123")).to.be.Undefined("Namespace");
        });
    });

    describe("own: Namespace x -> Namespace o", () => {
        
        it("should return the own namespace of x", async () => {
            const presets = {p:{x:10}};
            presets.c = Object.create(presets.p);
            presets.c.y = 20;
            expect(await evaluate("own c", presets)).to.be.Namespace({y:20});
            expect(await evaluate("parent(own c)", presets)).to.be.Undefined("Namespace");
        });

        it("should return Undefined Namespace if x is not a namespace", async () => {
            expect(await evaluate("own 123")).to.be.Undefined("Namespace");
        });
    });

    describe("undefined: Tuple t -> Undefined u", () => {
        
        it("should return and Undefined data type", async () => {
            expect(await evaluate("undefined('Test',1,2)")).to.be.Undefined("Test", (...args) => {
                expect(args.length).to.equal(2);
                expect(args[0]).to.equal(1);
                expect(args[1]).to.equal(2);
            })
        });
    });    
    
    describe("require: Text id -> Namespace m", () => {
        
        it("should return the standard library module identified by the passed module id", async () => {
            
            // Test content
            const time1 = require("../lib/modules/time")(types);
            const time2 = await evaluate("require 'time'");
            expect(time2).to.be.instanceof(types.Namespace);
            for (let key in time1) {
                expect(typeof time1[key]).to.equal(typeof time2.vget(key));
            }
            
            // Test in action
            expect(await evaluate("require 'numb' .max (1,22,3,4) ")).to.be.Numb(22);
            expect(await evaluate("require 'text' .upper 'aBc'     ")).to.be.Text("ABC");
            expect(await evaluate("require 'list' .reverse [10,20,30]")).to.be.List([30,20,10]);
            expect(await evaluate("require 'time' .to_ISO_string 1639513675.900")).to.be.Text("2021-12-14T20:27:55.900Z");
            expect(await evaluate("type(require 'debug' .log [])")).to.be.Text("Text");
        });
    });
    
    describe("this", () => {
        
        it("should return the current context", async () => {
            expect(await evaluate("x=10, this.x")).to.be.Numb(10);
            expect(await evaluate("x=10, {x=20, y=this.x}.y")).to.be.Numb(20);
            expect(await evaluate("x=10, {x=20}.this.x")).to.be.Numb(20);
            expect(await evaluate("x=10, {y=20}.this.x")).to.be.Numb(10);
            expect(await evaluate("x=10, {x=20}.this 'x'")).to.be.Numb(20);
            expect(await evaluate("x=10, {y=20}.this 'x'")).to.be.Undefined('Mapping', (arg) => {
                expect(arg).to.equal("x");
            });
            expect(await evaluate("__apply__ = (ctx, n) -> 2*n, this 10")).to.be.Numb(20);            
            expect(await evaluate("z=30, dom({x:10, y:20}.this)")).to.be.Tuple(['x', 'y'])
        });
    });
});
