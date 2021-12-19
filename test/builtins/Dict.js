const expect = require("chai").expect;
const {Dict} = require("../../lib/builtins");
const types = require("../../lib/types");


describe("Dict", () => {

    describe("dict = Dict.create(...entries)", () => {
        
        it("should return a dict object", () => {
            var d = Dict.create(["x", 10], ["y", 20]);
            expect(d.has).to.be.a("function");
            expect(d.get).to.be.a("function");
            expect(d.keys).to.be.an("array");
            expect(d.values).to.be.an("array");
            expect(d.size).to.be.a("number");
        });
        
        it("should throw an error if an entry is not an array", () => {
            expect(() => Dict.create({},{})).to.throw(TypeError);
        });
        
        describe("dict.size", () => {
            
            it("should return the number of entries in d", () => {
                const d = Dict.create(["x", 10], ["y", 20]);
                expect(d.size).to.equal(2);
                expect(Dict.create().size).to.equal(0)
            });
            
            it("should ignore empty entries", () => {
                const entries = [["x",1], [], ["z",3]];
                expect(Dict.create(...entries).size).to.equal(2);
            });
        });        
        
        describe("dict.keys", () => {
            
            it("should contain the list of keys of the dictionary", () => {
                var d = Dict.create(["x", 10], ["y", 20]);
                expect(d.keys).to.deep.equal(["x", "y"]);
                expect(Dict.create().keys).to.deep.equal([]);
            });
            
            it("should preserve the insertion order", async () => {
                var d1 = Dict.create(["x", 10], ["y", 20]);
                var d2 = Dict.create(["y", 20], ["x", 10]);
                expect(d1.keys).to.deep.equal(['x', 'y']);
                expect(d2.keys).to.deep.equal(['y', 'x']);
            });
            
            it("should ignore empty entries", () => {
                const entries = [["x",1], [], ["z",3]];
                expect(Dict.create(...entries).keys).to.deep.equal(["x","z"]);
            });
        })

        describe("dict.values", () => {
            
            it("should contain the tuple of values of the dict", () => {
                var d = Dict.create(["x", 10], ["y", 20]);
                expect(d.values).to.deep.equal([10, 20])
                
                var d = Dict.create(["x", 10, 20], ["y"])
                expect(d.values[0]).to.be.instanceof(types.Tuple);
                expect(Array.from(d.values[0])).to.deep.equal([10,20]);
                expect(d.values[1]).to.be.null;
            });
            
            it("should preserve the insertion order", () => {
                var d1 = Dict.create(["x", 10], ["y", 20]);
                var d2 = Dict.create(["y", 20], ["x", 10]);
                expect(d1.values).to.deep.equal([10, 20]);
                expect(d2.values).to.deep.equal([20, 10]);
            });
            
            it("should ignore empty entries", () => {
                const entries = [["x",1], [], ["z",3]];
                expect(Dict.create(...entries).values).to.deep.equal([1,3]);
            });
        })

        describe("dict.has(key)", () => {
            
            it("should return true if a value is mapped to key", () => {
                var d = Dict.create(["x", 10], ["y", 20]);
                expect(d.has('x')).to.be.true;
                expect(d.has('z')).to.be.false;
            });
        })

        describe("d.get(key)", () => {
            
            it("should return the value mapped to key", () => {
                const d = Dict.create(["x", 10], ["y", 20, 30], ["z"]);
                
                expect(d.get('x')).to.equal(10);
                
                expect(d.get('y')).to.be.instanceof(types.Tuple);
                expect(Array.from(d.get('y'))).to.deep.equal([20,30]);
                
                expect(d.get("z")).to.be.null;
            });
            
            it("should return null if no value is mapped to key", () => {
                var d = Dict.create(["x", 10], ["y", 20]);
                expect(d.get('z')).to.equal(null);                
            });
        })
    });

    describe("dict = Dict.merge(d1, d2, d3, ...)", () => {
        
        it("should return the dict obtained by joining all the entries of the given dicts", () => {
            var d1 = Dict.create(["a", 10], ["b", 20]);
            var d2 = Dict.create(["c", 30], ["b", 40]);
            var d3 = Dict.create(["d", 50], ["e", 60]);
            var d4 = Dict.merge(d1, d2, d3);
            expect(d4.size).to.equal(5);
            expect(d4.keys).to.deep.equal(['a', 'b', 'c', 'd', 'e']);
            expect(d4.values).to.deep.equal([10, 40, 30, 50, 60]);
        });
    });
    
    describe("dict = Dict.from_JSON(json_str)", () => {
        
        it("should create a dictionary from a JSON string", () => {
            const dict = Dict.from_JSON(`{"x": 1, "y": 2}`);
            expect(dict.keys).to.deep.equal(["x", "y"]);
            expect(dict.values).to.deep.equal([1, 2]);
        });
        
        it("should recursively create sub-dicts from object items", () => {
            const dict = Dict.from_JSON(`{"x": {"y":2, "z":3}}`);
            expect(dict.keys).to.deep.equal(["x"]);
            expect(dict.get("x").keys).to.deep.equal(["y", "z"]);
            expect(dict.get("x").values).to.deep.equal([2, 3]);
        });
    });
    
    describe.skip("json_str = Dict.to_JSON(dict)", () => {});
});
