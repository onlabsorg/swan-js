var expect = require("chai").expect;
var loadlib = require("../../lib/modules").require;
var swan = require("../../index");


describe("json module", () => {

    describe("d = dict.create(...entries)", () => {
        ``
        it("return a dict object", async () => {
            var dict = await loadlib("dict");
            var d = dict.create(["x", 10], ["y", 20]);
            expect(d.has).to.be.a("function");
            expect(d.get).to.be.a("function");
            expect(d.keys).to.be.a("function");
            expect(d.values).to.be.a("function");
            expect(d.entries).to.be.a("function");
            expect(d.size).to.be.a("number");
        });
        
        describe("d.size", () => {
            it("should return the number of entries in d", async () => {
                var dict = await loadlib("dict");
                var d = dict.create(["x", 10], ["y", 20]);
                expect(d.size).to.equal(2);
            });
        });        
        
        describe("d.has(key)", () => {
            it("should return true if a value is mapped to key", async () => {
                var dict = await loadlib("dict");
                var d = dict.create(["x", 10], ["y", 20]);
                expect(d.has('x')).to.be.true;
                expect(d.has('z')).to.be.false;
            });
        })

        describe("d.get(key)", () => {
            
            it("should return the value mapped to key", async () => {
                var dict = await loadlib("dict");
                var d = dict.create(["x", 10], ["y", 20, 30]);
                expect(d.get('x')).to.equal(10);
                expect(d.get('y')).to.equal(20);
            });
            
            it("should return null if no value is mapped to key", async () => {
                var dict = await loadlib("dict");
                var d = dict.create(["x", 10], ["y", 20]);
                expect(d.get('z')).to.equal(null);                
            });
        })

        describe("d.keys()", () => {
            
            it("should return the tuple of keys of the dict", async () => {
                var dict = await loadlib("dict");
                var d = dict.create(["x", 10], ["y", 20]);
                var keys = d.keys();
                expect(keys).to.be.instanceof(swan.Tuple);
                expect(Array.from(keys)).to.deep.equal(['x', 'y'])
            });
            
            it("should preserve the insertion order", async () => {
                var dict = await loadlib("dict");
                var d1 = dict.create(["x", 10], ["y", 20]);
                var d2 = dict.create(["y", 20], ["x", 10]);
                expect(Array.from(d1.keys())).to.deep.equal(['x', 'y']);
                expect(Array.from(d2.keys())).to.deep.equal(['y', 'x']);
            });
        })

        describe("d.values()", () => {
            
            it("should return the tuple of values of the dict", async () => {
                var dict = await loadlib("dict");
                var d = dict.create(["x", 10], ["y", 20]);
                var values = d.values();
                expect(values).to.be.instanceof(swan.Tuple);
                expect(Array.from(values)).to.deep.equal([10, 20])
            });
            
            it("should preserve the insertion order", async () => {
                var dict = await loadlib("dict");
                var d1 = dict.create(["x", 10], ["y", 20]);
                var d2 = dict.create(["y", 20], ["x", 10]);
                expect(Array.from(d1.values())).to.deep.equal([10, 20]);
                expect(Array.from(d2.values())).to.deep.equal([20, 10]);
            });
        })

        describe("d.entries()", () => {
            
            it("should return the tuple of entries of the dict", async () => {
                var dict = await loadlib("dict");
                var d = dict.create(["x", 10], ["y", 20]);
                var entries = d.entries();
                expect(entries).to.be.instanceof(swan.Tuple);
                expect(Array.from(entries)).to.deep.equal([['x',10], ['y',20]])
            });
            
            it("should preserve the insertion order", async () => {
                var dict = await loadlib("dict");
                var d1 = dict.create(["x", 10], ["y", 20]);
                var d2 = dict.create(["y", 20], ["x", 10]);
                expect(Array.from(d1.entries())).to.deep.equal([['x',10], ['y',20]]);
                expect(Array.from(d2.entries())).to.deep.equal([['y',20], ['x',10]]);
            });
        })
    });

    describe("dict.merge(d1, d2, d3, ...)", () => {
        
        it("should return the dict obtained by joining all the entries of the given dicts", async () => {
            var dict = await loadlib("dict");
            var d1 = dict.create(["a", 10], ["b", 20]);
            var d2 = dict.create(["c", 30], ["b", 40]);
            var d3 = dict.create(["d", 50], ["e", 60]);
            var d4 = dict.merge.call(context, d1, d2, d3);
            var entries = d4.entries();
            expect(entries).to.be.instanceof(swan.Tuple);
            expect(Array.from(entries)).to.deep.equal([
                ['a',10], ['b',40], ['c',30], ['d',50], ['e',60]
            ])
        });
    });
});
