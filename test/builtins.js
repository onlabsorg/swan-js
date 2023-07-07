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

    describe("undefined: Tuple t -> Undefined u", () => {

        it("should return an Undefined data type", async () => {
            expect(await evaluate("undefined('Test',1,2)")).to.be.Undefined("Test", (...args) => {
                expect(args.length).to.equal(2);
                expect(args[0]).to.equal(1);
                expect(args[1]).to.equal(2);
            })
        });
    });

    describe("enum: Term x -> Tuple t", () => {

        it("should return a tuple of integer numbers between 0 and x (excluded) if x is a Numb item", async () => {
            expect(await evaluate("enum 4")).to.be.Tuple([0,1,2,3]);
            expect(await evaluate("enum 4.1")).to.be.Tuple([0,1,2,3,4]);
        });

        it("should return the tuple of characters of x if it is a Text item", async () => {
            expect(await evaluate("enum 'abc'")).to.be.Tuple(['a','b','c']);
        });

        it("should return the tuple of items of x if it is a List item", async () => {
            expect(await evaluate("enum [10,20,30]")).to.be.Tuple([10,20,30]);
        });

        it("should return the tuple of names of x if it is a Namespace item", async () => {
            expect(await evaluate("enum {A:1,B:2,C:3}")).to.be.Tuple(['A','B','C']);
        });

        it("should return Undefined Enumeration if x is a Bool item", async () => {
            expect(await evaluate("enum TRUE")).to.be.Undefined("Enumeration");
        });

        it("should return Undefined Enumeration if x is a Func item", async () => {
            expect(await evaluate("enum(x->x)")).to.be.Undefined("Enumeration");
        });

        it("Should return the tuple of type and arguments if x is ab Undefined item", async () => {
            expect(await evaluate("enum(undefined('UND',10,20))")).to.be.Tuple(["UND", 10, 20]);
        });

        it("should apply to all the item of x if x is a Tuple", async () => {
            expect(await evaluate("enum('abc', [10,20,30], 4)")).to.be.Tuple(['a','b','c',10,20,30,0,1,2,3])
        });
    });

    describe("tsize: Term x -> Numb n", () => {

        it("should return the number of items in the tuple x", async () => {
            expect(await evaluate("tsize(10,20,30)")).to.be.Numb(3);
            expect(await evaluate("tsize 10")).to.be.Numb(1);
            expect(await evaluate("tsize()")).to.be.Numb(0);
        });
    });

    describe("msize: Mapping m -> Numb n", () => {

        it("should return the number of items of a mapping", async () => {
            expect(await evaluate("msize 'abcde'")).to.be.Numb(5);
            expect(await evaluate("msize [10,20,30]")).to.be.Numb(3);
            expect(await evaluate("msize {a:1,b:2,c:3,d:4}")).to.be.Numb(4);
        });

        it("should return Undefined Size if m is not a mapping", async () => {
            expect(await evaluate("msize 10")).to.be.Undefined("Size");
            expect(await evaluate("msize TRUE")).to.be.Undefined("Size");
            expect(await evaluate("msize(x->x)")).to.be.Undefined("Size");
        });

        it("should return a tuple of mapping sizes if m is a tuple", async () => {
            expect(await evaluate("msize('abc',[10,20],{x:10})")).to.be.Tuple([3,2,1]);
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

        it("should return the argument itself if is a str item", async () => {
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
            
            it("should return `NS.__text__` if `NS.__text__` is a Text item", async () => {
                expect(await evaluate("str{t:456, __text__: 'abc'}")).to.be.Text("abc");
                expect(await evaluate("str{t:456, __text__: 457}")).to.be.Text("[[Namespace of 2 items]]");
            });

            it("should return `NS.__text__(NS)` if `NS.__text__` is a Func item", async () => {
                expect(await evaluate("str{s: 'abcd', __text__: ns -> ns.s}")).to.be.Text("abcd");
            });
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

        it("should return a tuple of parent items if x is a tuple", async () => {
            const presets = {p1:{x:10}, p2:{y:20}};
            presets.c1 = Object.create(presets.p1);
            presets.c2 = Object.create(presets.p2);
            expect(await evaluate("parent(c1,c2)", presets)).to.be.Tuple([presets.p1, presets.p2]);
        });
    });

    describe("own: Namespace x -> Namespace o", () => {
        
        it("should return the own namespace of x", async () => {
            const presets = {p:{x:10}};
            presets.c = Object.create(presets.p);
            presets.c.y = 20;
            expect(await evaluate("own c", presets)).to.be.Namespace({y:20});
            expect(await evaluate("parent(Namespace.own c)", presets)).to.be.Undefined("Namespace");
        });

        it("should return Undefined Namespace if x is not a namespace", async () => {
            expect(await evaluate("own 123")).to.be.Undefined("Namespace");
        });

        it("should apply only to the first item if x is a tuple", async () => {
            const presets = {p1:{x:10}, p2:{y:20}};
            presets.c1 = Object.create(presets.p1);
            presets.c1.z1 = 30; 
            presets.c2 = Object.create(presets.p2);
            presets.c2.z2 = 30;
            expect(await evaluate("own(c1,c2)", presets)).to.be.Tuple([{z1:30}, {z2:30}]);
        });
    });
    
    describe("require: Text id -> Namespace m", () => {
        
        it("should return the standard library module identified by the passed module id", async () => {
            
            // Test content
            const time1 = require("../lib/modules/time")(types);
            const time2 = await evaluate("require 'time'");
            for (let key in time1) {
                expect(typeof time1[key]).to.equal(typeof time2.vget(key));
            }
            
            // Test in action
            expect(await evaluate("require 'math' .max (1,22,3,4) ")).to.be.Numb(22);
            expect(await evaluate("require 'time' .to_ISO_string 1639513675.900")).to.be.Text("2021-12-14T20:27:55.900Z");
            expect(await evaluate("require 'dict' .isDict(10)")).to.be.Bool(false);
            expect(await evaluate("type(require 'debug' .log [])")).to.be.Text("Text");
            expect(await evaluate("type(require 'path' .join)")).to.be.Text("Func");
        });

        it("should return a tuple of modules if id is a tuple", async () => {

            const time1 = require("../lib/modules/time")(types);
            const json1 = require("../lib/modules/json")(types);

            const modules = await evaluate("require('time', 'json')");
            expect(modules).to.be.instanceof(types.Tuple);
            expect(Array.from(modules).length).to.equal(2);
            const [time2, json2] = Array.from(modules.items());

            for (let key in time1) {
                expect(typeof time1[key]).to.equal(typeof time2.vget(key));
            }

            for (let key in json1) {
                expect(typeof json1[key]).to.equal(typeof json2.vget(key));
            }
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
            expect(await evaluate("__apply__ = (n) -> 2*n, this 10")).to.be.Numb(20);            
            expect(await evaluate("z=30, enum({x:10, y:20}.this)")).to.be.Tuple(['x', 'y'])
        });
    });
});
