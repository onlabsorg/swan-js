var expect = require("chai").expect;
var loadlib = require("../../lib/modules").require;
var swan = require("../..");


describe("json module", () => {

    describe("json.parse(str)", () => {
        it("should convert the passed json string to a javascript object", async () => {
            var json = await loadlib("json");
            expect(json.parse(`{"a":1, "b":true}`)).to.deep.equal({a:1, b:true});
        });
    });

    describe("json.stringify(n)", () => {
        it("should return a function that takes an object and returns its json representation with `n` indentation spaces", async () => {
            var json = await loadlib("json");
            expect(json.stringify(0)({a:1})).to.equal(`{"a":1}`);
            expect(json.stringify(2)({a:1})).to.equal(`{\n  "a": 1\n}`);
        });
    });
});
