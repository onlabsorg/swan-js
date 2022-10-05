const expect = require("../expect");

const types = require("../../lib/types");
const parse = require("../../lib/interpreter");
const dict = require("../../lib/modules/dict")(types);

const evaluate = async (expression, presets={}) => {
    const context = Object.assign({dict}, presets);
    return await parse(expression)(context);
}



describe("dict module", () => {

    describe("dict: List Tuple kv -> Namespace d", () => {
        
        it("should return a namespace", async () => {
            expect(await evaluate("dict([1,10],[2,20],[3,30])")).to.be.instanceof(types.Namespace);
        });
    });    
    
    describe("d.size: Numb", () => {
        
        it("should return the number of items in the dictionary", async () => {
            expect(await evaluate("dict([1,10],[2,20],[3,30]).size")).to.be.Numb(3);            
        });
    });        

    describe("d.keys: Tuple", () => {
        
        it("should return the tuple of keys of the dictionary", async () => {
            expect(await evaluate("dict([1,10],[2,20],[3,30]).keys")).to.be.Tuple([1,2,3]);
        });
    });
    
    describe("d.values: Tuple", () => {
        
        it("should return the tuple of values of the dictionary", async () => {
            expect(await evaluate("dict([1,10],[2,20],[3,30]).values")).to.be.Tuple([10,20,30]);
        });
    });
    
    describe("d.entries: Tuple", () => {
        
        it("should return the tuple of [key,value] pairs of the dictionary", async () => {
            expect(await evaluate("dict([1,10],[2,20],[3,30]).entries")).to.be.Tuple([[1,10], [2,20], [3,30]]);
        });
    });
    
    describe("d.get: Term k -> Term v", () => {
        
        it("should return the value `v` mapped to the key `k`", async () => {
            expect(await evaluate("dict([1,10],[2,20],[3,30]).get(2)")).to.be.Numb(20);
        });

        it("should return `Undefined('Mapping')` if no value is mapped to `k`", async () => {
            expect(await evaluate("dict([1,10],[2,20],[3,30]).get(4)")).to.be.Undefined('Mapping', (...args) => {
                expect(args.length).to.equal(1);
                expect(args[0]).to.equal(4);
            });
        });
    });

    describe("d.has: Term k -> Bool b", () => {
        
        it("should return true if the dictionary contains the key `k`", async () => {
            expect(await evaluate("dict([1,10],[2,20],[3,30]).has(2)")).to.be.Bool(true);
            expect(await evaluate("dict([1,10],[2,20],[3,30]).has(4)")).to.be.Bool(false);
        });
    });

});
