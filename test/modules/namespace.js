const expect = require("../expect");

const types = require("../../lib/types");
const parse = require("../../lib/interpreter");
const namespace = require("../../lib/modules/namespace")(types);

const evaluate = async (expression, presets={}) => {
    const context = Object.assign({namespace}, presets);
    return await parse(expression)(context);
}



describe("namespace module", () => {
    
    describe("n = namespace.size N", () => {

        it("should return the number of items of the namespace", async () => {
            expect(await evaluate("namespace.size {a:10,b:20,c:30}")).to.be.Numb(3);            
        });
                
        it("should return Undefined Number if the argument is not a Namespace item", async () => {
            expect(await evaluate("namespace.size 123")).to.be.Undefined("Number");
        });
        
        it("should apply only to the first item, if the parameter is a tuple", async () => {
            expect(await evaluate("namespace.size ({a:10,b:20,c:30}, {d:40})")).to.be.Numb(3);
        });
    });

    describe("t = namespace.domain N", () => {

        it("should return the domain of the Namespace as a Tuple", async () => {
            expect(await evaluate("namespace.domain {b:10,a:20,c:30}")).to.be.Tuple(['a','b','c']);
        });
                
        it("should return Undefined Tuple if the argument is not a Namespace item", async () => {
            expect(await evaluate("namespace.domain 123")).to.be.Undefined("Tuple");
        });
        
        it("should apply only to the first item, if the parameter is a tuple", async () => {
            expect(await evaluate("namespace.domain({b:10,a:20,c:30},{d:40})")).to.be.Tuple(['a','b','c']);
        });
    });

    describe("f = namespace.map F", () => {
    
        describe("when F is an item", () => {
    
            it("should return a function", async () => {
                expect(await evaluate("namespace.map(x->2*x)")).to.be.instanceof(types.Func);
            });
    
            describe("ML = f N ", () => {
    
                it("should map the items of N via the function F", async () => {
                    expect(await evaluate("namespace.map(x->2*x) {a:1,b:2,c:3}")).to.be.Namespace({a:2,b:4,c:6});
                });
    
                it("should return Undefined Namespace if F is not a Func item", async () => {
                    expect(await evaluate("namespace.map 10")).to.be.instanceof(types.Func);
                    expect(await evaluate("namespace.map 10 [1,2,3]")).to.be.Undefined("Namespace");
                });
    
                it("should return Undefined Namespace if `L` is not a Namespace item", async () => {
                    expect(await evaluate("namespace.map(x->x)")).to.be.instanceof(types.Func);
                    expect(await evaluate("namespace.map(x->x) 10")).to.be.Undefined("Namespace");
                });
    
                it("should apply only to the first item, if the parameter is a tuple", async () => {
                    expect(await evaluate("namespace.map(x->2*x)({a:1,b:2,c:3},{d:4})")).to.be.Namespace({a:2,b:4,c:6});
                });
            });
        });
    
        describe("when the argument is a tuple", () => {
    
            it("should apply only to the first item", async () => {
                expect(await evaluate("namespace.map(x->2*x,x->3*x)")).to.be.instanceof(types.Func);
                expect(await evaluate("namespace.map(x->2*x,x->3*x) {a:1,b:2}")).to.be.Namespace({a:2,b:4});
                expect(await evaluate("namespace.map(x->2*x,x->3*x)({a:1,b:2},{c:3})")).to.be.Namespace({a:2,b:4});
            });
        });    
    });              
});
