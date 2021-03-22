var expect = require("chai").expect;
var {Tuple} = require('../lib/interpreter');

describe("SWAN TUPLE DATA TYPE: tuple = Tuple(...items)", () => {
    
    it("should return an instance of Tuple", () => {
        expect(Tuple()).to.be.instanceof(Tuple);
    });
    
    it("should eturn an iterator object", () => {
        var tuple = Tuple();
        expect(tuple).to.be.instanceof(Tuple);
    });
    
    it("should iterate over all the passed iterms", () => {
        var tuple = Tuple(10,20,30);
        expect(tuple).to.be.instanceof(Tuple);
        expect(Array.from(tuple)).to.deep.equal([10,20,30]);
    });
    
    it("should flatten nested tuples", () => {
        var tuple1 = Tuple(11,12);
        var tuple2 = Tuple(10, tuple1);
        var tuple3 = Tuple(tuple2, 13);
        expect(tuple3).to.be.instanceof(Tuple);
        expect(Array.from(tuple3)).to.deep.equal([10,11,12,13]);
    });
    
    it("should ignore empty tuples, null, NaN and undefined", () => {
        var tuple = Tuple(10,null,20,undefined,30,NaN,40,Tuple());
        expect(tuple).to.be.instanceof(Tuple);
        expect(Array.from(tuple)).to.deep.equal([10,20,30,40]);
    });
    
    it("should return the argument itself if it is a single tuple", () => {
        var tuple = Tuple(1,2,3);
        expect(Tuple(tuple)).to.equal(tuple);
    });
    
    describe("bool = tuple.isEmpty()", () => {
        
        it("should return true if the tuple contanis no items", () => {
            expect(Tuple().isEmpty()).to.be.true;
            expect(Tuple(null).isEmpty()).to.be.true;
            expect(Tuple(NaN).isEmpty()).to.be.true;
            expect(Tuple(null, NaN, Tuple(null)).isEmpty()).to.be.true;

            expect(Tuple(0).isEmpty()).to.be.false;
            expect(Tuple(null, NaN, Tuple(1)).isEmpty()).to.be.false;
        });
    });

    describe("image = await tuple.mapSync(asyncFunc)", () => {
        
        it("should resolve a tuple obtaining by applying f to each item of the mapped tuple", () => {
            var tuple = Tuple(1,2,3);
            var tmap = tuple.mapSync(item => 2*item);
            expect(tmap).to.be.instanceof(Tuple);
            expect(Array.from(tmap)).to.deep.equal([2,4,6]);
        });
        
        it("should treat single items as tuples made of one elements", () => {
            var tmap = Tuple(10).mapSync(item => 2*item);
            expect(tmap).to.be.instanceof(Tuple);
            expect(Array.from(tmap)).to.deep.equal([20]);            

            var tmap = Tuple("abc").mapSync(item => `_${item}_`);
            expect(tmap).to.be.instanceof(Tuple);
            expect(Array.from(tmap)).to.deep.equal(["_abc_"]);            
        });
        
        it("should resolve an empty tuple if the passed tuple is an empty tuple, null, undefined or NaN", () => {
            var tmap = Tuple().mapSync(item => 2*item);
            expect(tmap).to.be.instanceof(Tuple);
            expect(Array.from(tmap)).to.deep.equal([]);            

            var tmap = Tuple(null).mapSync(item => 2*item);
            expect(tmap).to.be.instanceof(Tuple);
            expect(Array.from(tmap)).to.deep.equal([]);            

            var tmap = Tuple(NaN).mapSync(item => 2*item);
            expect(tmap).to.be.instanceof(Tuple);
            expect(Array.from(tmap)).to.deep.equal([]);            
        });
    });
    
    describe("image = await tuple.mapAsync(asyncFunc)", () => {
        
        it("should resolve a tuple obtaining by applying f to each item of the mapped tuple", async () => {
            var tuple = Tuple(1,2,3);
            var tmap = await tuple.mapAsync(async item => 2*item);
            expect(tmap).to.be.instanceof(Tuple);
            expect(Array.from(tmap)).to.deep.equal([2,4,6]);
        });
        
        it("should treat single items as tuples made of one elements", async () => {
            var tmap = await Tuple(10).mapAsync(async item => 2*item);
            expect(tmap).to.be.instanceof(Tuple);
            expect(Array.from(tmap)).to.deep.equal([20]);            

            var tmap = await Tuple("abc").mapAsync(async item => `_${item}_`);
            expect(tmap).to.be.instanceof(Tuple);
            expect(Array.from(tmap)).to.deep.equal(["_abc_"]);            
        });
        
        it("should resolve an empty tuple if the passed tuple is an empty tuple, null, undefined or NaN", async () => {
            var tmap = await Tuple().mapAsync(async item => 2*item);
            expect(tmap).to.be.instanceof(Tuple);
            expect(Array.from(tmap)).to.deep.equal([]);            

            var tmap = await Tuple(null).mapAsync(async item => 2*item);
            expect(tmap).to.be.instanceof(Tuple);
            expect(Array.from(tmap)).to.deep.equal([]);            

            var tmap = await Tuple(NaN).mapAsync(async item => 2*item);
            expect(tmap).to.be.instanceof(Tuple);
            expect(Array.from(tmap)).to.deep.equal([]);            
        });
    });
    
    describe("value = tuple.normalize()", () => {
        
        it("should return null if the passed tuple is empty", () => {
            expect(Tuple().normalize()).to.be.null;
            expect(Tuple(null).normalize()).to.be.null;
            expect(Tuple(NaN).normalize()).to.be.null;
            expect(Tuple(null, NaN, Tuple(null)).normalize()).to.be.null;
        });

        it("should return the only tuple item if the tuple contains only one item", () => {
            expect(Tuple(10).normalize()).to.equal(10);
            expect(Tuple(null, 10, NaN, undefined).normalize()).to.equal(10);
            expect(Tuple('abc').normalize()).to.equal('abc');
            expect(Tuple([1,2,3]).normalize()).to.deep.equal([1,2,3]);
        });
        
        it("should return the tuple itself, if it contains more than one item", () => {
            var tuple = Tuple(10,20,30);
            expect(tuple.normalize()).to.equal(tuple);            
        });
    });
});
