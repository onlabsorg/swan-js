const {expect} = require("chai");
const {List} = require("../../lib/builtins");


describe("List", () => {
    
    describe("List.find: Item -> List -> Numb", () => {

        it("should return the first index of Item in List", () => {
            expect(List.find(20)).to.be.a("function");
            expect(List.find(20)([0,10,20,10,20])).to.equal(2);
        });

        it("should return -1 if no match is found", () => {
            expect(List.find(50)).to.be.a("function");
            expect(List.find(50)([0,10,20,10,20])).to.equal(-1);
        });
        
        it("should return throw an error is List is not a list", () => {
            const fn = List.find(50);
            expect(fn).to.be.a("function");
            expect(() => fn("abc")).to.throw(TypeError);
        });            
    });

    describe("List.rfind: Item -> List -> Numb", () => {

        it("should return the first index of Item in List", () => {
            expect(List.rfind(20)).to.be.a("function");
            expect(List.rfind(20)([0,10,20,10,20])).to.equal(4);
        });

        it("should return -1 if no match is found", () => {
            expect(List.rfind(50)).to.be.a("function");
            expect(List.rfind(50)([0,10,20,10,20])).to.equal(-1);
        });
        
        it("should return throw an error is List is not a list", () => {
            const fn = List.rfind(50);
            expect(fn).to.be.a("function");
            expect(() => fn("abc")).to.throw(TypeError);
        });            
    });

    describe("List.join: (sep:Text) -> (list:List of Text) -> Text", () => {

        it("should return a string obtaining by concatenating the list item with interposed separator", () => {
            const fn = List.join("-");
            expect(fn).to.be.a("function");
            expect(fn(["a","b","c"])).to.equal("a-b-c");
            expect(fn([])).to.equal("");
        });
        
        it("should throw an erro if the separator is not a string", () => {
            expect(() => List.join(1)).to.throw(TypeError);
        });

        it("should throw an error if list is not a List", () => {
            const fn = List.join("-");
            expect(fn).to.be.a("function");
            expect(() => fn("abc")).to.throw(TypeError);
        });

        it("should throw an error if any of the list items is not a string", () => {
            const fn = List.join("-");
            expect(fn).to.be.a("function");
            expect(() => fn(["abc", 1, "def"])).to.throw(TypeError);
        });
    });        

    describe("List.reverse: List -> List", () => {

        it("should return a copy of the passed list, in reversed order", async () => {
            var l1 = [1,2,3,4,5];
            var l2 = List.reverse(l1);
            expect(l1).to.not.equal(l2);
            expect(l2).to.deep.equal([5,4,3,2,1]);
        });

        it("should throw an error if the passed item is not a List", () => {
            expect(() => List.reverse("abc")).to.throw(TypeError);
        });
    });

    describe("List.head: (i:Numb) -> (l:List) -> List", () => {

        it("should return the sublist of the first i items of l", () => {
            const fn = List.head(3);
            expect(fn).to.be.a("function");
            expect(fn([1,2,3,4,5,6])).to.deep.equal([1,2,3]);
        });

        it("should consider relative inices as relative to the end of the list", () => {
            const fn = List.head(-3);
            expect(fn).to.be.a("function");
            expect(fn([1,2,3,4,5,6,7])).to.deep.equal([1,2,3,4]);
        });

        it("should throw an error if i is not a number", () => {
            expect(() => List.head("abc")).to.throw(TypeError);
        });

        it("should throw an error if l is not a list", () => {
            const fn = List.head(3);
            expect(fn).to.be.a("function");
            expect(() => fn("abc")).to.throw(TypeError);
        });
    });              

    describe("List.tail: (i:Numb) -> (l:List) -> List", () => {

        it("should return the sublist of the items of l afther and included the i-th item", () => {
            const fn = List.tail(3);
            expect(fn).to.be.a("function");
            expect(fn([1,2,3,4,5,6,7])).to.deep.equal([4,5,6,7]);
        });

        it("should consider relative inices as relative to the end of the list", () => {
            const fn = List.tail(-3);
            expect(fn).to.be.a("function");
            expect(fn([1,2,3,4,5,6,7])).to.deep.equal([5,6,7]);
        });

        it("should throw an error if i is not a number", () => {
            expect(() => List.tail("abc")).to.throw(TypeError);
        });

        it("should throw an error if l is not a list", () => {
            const fn = List.tail(3);
            expect(fn).to.be.a("function");
            expect(() => fn("abc")).to.throw(TypeError);
        });
    });              
});
