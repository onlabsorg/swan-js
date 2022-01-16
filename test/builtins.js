const expect = require("./expect");

const types = require("../lib/types");

const parse = require("../lib/interpreter");
const evaluate = (expression, presets={}) => parse(expression)(Object.assign(Object.create(builtins), presets));

const {Bool, Numb, Text, List, Namespace, Func, Time, Tuple, Undefined} = builtins = require("../lib/builtins");



describe("builtins", () => {
    
    describe("Namespace", () => {
    
        describe("Namespace.size(object)", () => {
    
            it("should return the number of items in the namespace", () => {
                expect(Namespace.size({a:1,b:2,$c:3})).to.equal(2);
                expect(Namespace.size({})).to.equal(0);
            });
    
            it("shoudl throw a type error if the passed argument is not a string", () => {
                expect(() => Namespace.size([])).to.throw(TypeError);
            });
        });
    
        describe("Namespace.map(fn)(object)", () => {
    
            it("should return an object containing the image through fn of the entries of the passed parameter", async () => {
                const fn = x => 2*x;
                expect(await Namespace.map(fn)({x:1,y:2,z:3,$w:4})).to.deep.equal({x:2,y:4,z:6});
            });
    
            it("should throw an error if the passed parameter is not an object", async () => {
                try {
                    await Namespace.map(x=>x)([]);
                    throw new Error("It did not throw!");
                } catch (e) {
                    expect(e).to.be.instanceof(TypeError);
                    expect(e.message).to.equal("Namespace type expected");
                }
            });
        });        
    });
    
    describe("Func", () => {
    
        describe("Func.pipe(...funcs)", () => {
    
            it("should return a function that pipes all the passed functions", async () => {
                const fn = Func.pipe(x => 2*x, [10,20,30,40,50,60,70,80], x => [x]);
                expect(fn).to.be.a("function");
                expect(await fn(3)).to.deep.equal([70]);
            });
        });
    
        describe("Func.compose(...funcs)", () => {
    
            it("should return a function that composes all the passed functions", async () => {
                const fn = Func.compose(x => [x], [10,20,30,40,50,60,70,80], x => 2*x);
                expect(fn).to.be.a("function");
                expect(await fn(3)).to.deep.equal([70]);
            });
        });
    });
    
    describe("Tuple", () => {
    
        describe("Tuple.from(value)", () => {
    
            it("should return the tuple of characters of value if it is a string", () => {
    
                expect(Tuple.from("abc")).to.be.instanceof(types.Tuple);
                expect(Array.from(Tuple.from("abc"))).to.be.deep.equal(['a','b','c']);
    
                expect(Tuple.from("a")).to.equal('a');
            });
    
            it("should return the tuple of items of value if it is an array", () => {
    
                expect(Tuple.from([1,2,3])).to.be.instanceof(types.Tuple);
                expect(Array.from(Tuple.from([1,2,3]))).to.be.deep.equal([1,2,3]);
    
                expect(Tuple.from([1])).to.equal(1);                
            });
    
            it("should return the tuple of keys of value if it is an object", () => {
    
                expect(Tuple.from({yy:20,xx:10,$z:30})).to.be.instanceof(types.Tuple);
                expect(Array.from(Tuple.from({yy:20,xx:10,$z:30}))).to.be.deep.equal(['xx','yy']);
    
                expect(Tuple.from({x:10, $y:10})).to.equal('x');
            });
    
            it("should return the null for all the other types", () => {
                expect(Tuple.from(null                 )).to.be.null;
                expect(Tuple.from(true                 )).to.be.null;
                expect(Tuple.from(false                )).to.be.null;
                expect(Tuple.from(10                   )).to.be.null;
                expect(Tuple.from(x=>x                 )).to.be.null;
                expect(Tuple.from(new types.Undefined())).to.be.null;
            });
        });
    
        describe("Tuple.map(fn)(...values)", () => {
    
            it("should return a tuple containing the image through fn of the passed items", async () => {
                const fn = x => 2*x;
    
                const tuple = await Tuple.map(fn)(1,2,3);
                expect(tuple).to.be.instanceof(types.Tuple);
                expect(Array.from(tuple)).to.deep.equal([2,4,6]);
    
                expect(await Tuple.map(fn)(4)).to.equal(8);
            });
        });
    });
    
    describe("Undefined", () => {
    
        describe("Undefined.create(type, ...args)", () => {
    
            it("should return a types.Undefined object", () => {
                const undef = Undefined.create("TestCase", 1, 2, 3);
                expect(undef).to.be.instanceof(types.Undefined);
                expect(undef.type).to.equal("TestCase");
                expect(undef.args).to.deep.equal([1,2,3]);
            });
        });
    
        describe("Undefined.type(undef)", () => {
    
            it("should return the type of the undefined argument", () => {
                const undef = Undefined.create("TestCase", 1, 2, 3);
                expect(Undefined.type(undef)).to.equal("TestCase");
            });
    
            it("should throw an error if the passed parameter is not Undefined", async () => {
                try {
                    Undefined.type([]);
                    throw new Error("It did not throw!");
                } catch (e) {
                    expect(e).to.be.instanceof(TypeError);
                    expect(e.message).to.equal("Undefined type expected");
                }
            });
        });
    
        describe("Undefined.args(undef)", () => {
    
            it("should return the args of the undefined argument", () => {
                const undef = Undefined.create("TestCase", 1, 2, 3);
                expect(Undefined.args(undef)).to.deep.equal([1,2,3]);
            });
    
            it("should throw an error if the passed parameter is not Undefined", async () => {
                try {
                    Undefined.args([]);
                    throw new Error("It did not throw!");
                } catch (e) {
                    expect(e).to.be.instanceof(TypeError);
                    expect(e.message).to.equal("Undefined type expected");
                }
            });
        });
    });
});













