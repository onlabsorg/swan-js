var expect = require("chai").expect;
var loadlib = require("../../lib/modules").require;
var swan = require("../..");


describe("text module", () => {

    describe("text.find(str, subStr)", () => {

        it("should return the first index of subStr in str", async () => {
            var text = await loadlib("text");
            expect(await text.find("__Abc__def__Abc", "Abc")).to.equal(2);
        });

        it("should return -1 if no match is found", async () => {
            var text = await loadlib("text");
            expect(await text.find("__Abc__def__Abc", "xxx")).to.equal(-1);
        });
    });

    describe("text.rfind(str, subStr)", () => {

        it("should return the last index of subStr in str", async () => {
            var text = await loadlib("text");
            expect(await text.rfind("__Abc__def__Abc", "Abc")).to.equal(12);
        });

        it("should return -1 if no match is found", async () => {
            var text = await loadlib("text");
            expect(await text.rfind("__Abc__def__Abc", "xxx")).to.equal(-1);
        });
    });

    describe("text.lower(str)", () => {

        it("should return the given string converted to lower case characters", async () => {
            var text = await loadlib("text");
            expect(await text.lower("AbcDef")).to.equal("abcdef");
        });
    });

    describe("text.upper(str)", () => {

        it("should return the given string converted to upper case characters", async () => {
            var text = await loadlib("text");
            expect(await text.upper("AbcDef")).to.equal("ABCDEF");
        });
    });

    describe("text.char(...charCodes)", () => {

        it("should return the string made of the given UTF char codes", async () => {
            var text = await loadlib("text");
            expect(await text.char(65, 98, 99)).to.equal("Abc");
        });
    });

    describe("text.code(str)", () => {

        it("should return the list of UTF char codes of the given string", async () => {
            var text = await loadlib("text");
            expect(await text.code("Abc")).to.deep.equal([65, 98, 99]);
        });
    });

    describe("text.slice(str, firstIndex, lastIndex)", () => {

        it("should return a slice of the given string from firstIndex to lastIndex", async () => {
            var text = await loadlib("text");
            expect(await text.slice("0123456789", 2, 5)).to.equal("234");
        });

        it("should allow negative indexing", async () => {
            var text = await loadlib("text");
            expect(await text.slice("0123456789", -8, -5)).to.equal("234");
        });

        it("should slice till the end of the string if lastIndex is omitted", async () => {
            var text = await loadlib("text");
            expect(await text.slice("0123456789", 4)).to.equal("456789");
        });
    });

    describe("text.split(str, divider)", () => {

        it("should return the list of `str` substrings between `divider` substrings", async () => {
            var text = await loadlib("text");
            expect(await text.split("Abc,def,hij", ",")).to.deep.equal(["Abc", "def", "hij"]);
        });
    });

    describe("text.replace(str, subStr, newSubStr)", () => {

        it("should replace all the occurencies of `subStr` with `newSubStr`", async () => {
            var text = await loadlib("text");
            expect(await text.replace("abcXYdefXYghi", "XY", "Z")).to.equal("abcZdefZghi");
        });
    });

    describe("text.trimStart(str)", () => {
        it("should remove the leading spaces", async () => {
            var text = await loadlib("text");
            expect(await text.trimStart("   abc   ")).to.equal("abc   ");
        });
    });

    describe("text.trimEnd(str)", () => {
        it("should remove the trailing spaces", async () => {
            var text = await loadlib("text");
            expect(await text.trimEnd("   abc   ")).to.equal("   abc");
        });
    });

    describe("text.trim(str)", () => {
        it("should remove both leading and trailing spaces", async () => {
            var text = await loadlib("text");
            expect(await text.trim("   abc   ")).to.equal("abc");
        });
    });
});
