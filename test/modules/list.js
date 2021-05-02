var expect = require("chai").expect;
var loadlib = require("../../lib/modules").require;
var swan = require("../..");


describe("list module", () => {

    describe("list.find(list, item)", () => {

        it("should return the first index of subStr in str", async () => {
            var list = await loadlib("list");
            expect(await list.find([0,10,20,10,20], 20)).to.equal(2);
        });

        it("should return -1 if no match is found", async () => {
            var list = await loadlib("list");
            expect(await list.find([0,10,20,10,20], 50)).to.equal(-1);
        });
    });

    describe("text.rfind(str, subStr)", () => {

        it("should return the first index of subStr in str", async () => {
            var list = await loadlib("list");
            expect(await list.rfind([0,10,20,10,20], 20)).to.equal(4);
        });

        it("should return -1 if no match is found", async () => {
            var list = await loadlib("list");
            expect(await list.rfind([0,10,20,10,20], 50)).to.equal(-1);
        });
    });

    describe("text.slice(list, firstIndex, lastIndex)", () => {

        it("should return a slice of the given string from firstIndex to lastIndex", async () => {
            var list = await loadlib("list");
            expect(await list.slice([0,10,20,30,40,50,60], 2, 5)).to.deep.equal([20,30,40]);
        });

        it("should allow negative indexing", async () => {
            var list = await loadlib("list");
            expect(await list.slice([0,10,20,30,40,50,60], -5, -2)).to.deep.equal([20,30,40]);
        });

        it("should slice till the end of the string if lastIndex is omitted", async () => {
            var list = await loadlib("list");
            expect(await list.slice([0,10,20,30,40,50,60], 3)).to.deep.equal([30,40,50,60]);
        });
    });

    describe("text.reverse(list)", () => {

        it("should return a copy of the passed list, in reversed order", async () => {
            var list = await loadlib("list");
            var l1 = [1,2,3,4,5];
            var l2 = await list.reverse(l1);
            expect(l1).to.not.equal(l2);
            expect(l2).to.deep.equal([5,4,3,2,1]);
        });
    });

    describe("text.join(list, separator)", () => {

        it("should return a string obtaining by concatenating the list item with interposed separator", async () => {
            var list = await loadlib("list");
            expect(await list.join(["a","b","c"],",")).to.equal("a,b,c");
        });
    });
});
