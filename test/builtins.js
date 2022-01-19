const expect = require("./expect");

const types = require("../lib/types");
const builtins = require("../lib/builtins");

const parse = require("../lib/interpreter");
const evaluate = (expression, presets={}) => parse(expression)(Object.assign(Object.create(builtins), presets));




describe("builtins", () => {
    
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
        
        it("should return the standard library module identified by the passed id", async () => {
            
            // Test content
            const time1 = require("../lib/modules/time")(types);
            const time2 = await evaluate("require 'time'");
            expect(time2).to.be.instanceof(types.Namespace);
            for (let key in time1) {
                expect(typeof time1[key]).to.equal(typeof time2.vget(key));
            }
            
            // Test in action
            expect(await evaluate("require 'bool' .not (1,22,3,4) ")).to.be.Bool(false);
            expect(await evaluate("require 'numb' .max (1,22,3,4) ")).to.be.Numb(22);
            expect(await evaluate("require 'text' .size 'abc'     ")).to.be.Numb(3);
            expect(await evaluate("require 'list' .size [10,20,30]")).to.be.Numb(3);
            expect(await evaluate("require 'namespace' .size {a:1,b:2}")).to.be.Numb(2);
            expect(await evaluate("require 'time' .to_ISO_string 1639513675.900")).to.be.Text("2021-12-14T20:27:55.900Z");
            expect(await evaluate("type(require 'debug' .log [])")).to.be.Text("Text");
        });
    });
});













