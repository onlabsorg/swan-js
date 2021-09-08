var expect = require("chai").expect;
var loadlib = require("../../lib/modules").require;


describe("json module", () => {

    describe("json.parse(str)", () => {
        it("should convert the passed json string to a javascript object", async () => {
            var json = await loadlib("json");
            var dictObj = json.parse(`{"a":1, "b":true}`);
            expect(Array.from(dictObj.keys()).sort()).to.deep.equal(["a", "b"]);
            expect(dictObj.get("a")).to.equal(1);
            expect(dictObj.get("b")).to.equal(true);
        });
    });

    describe("json.stringify(n)", () => {
        it("should return a function that takes an object and returns its json representation with `n` indentation spaces", async () => {
            var json = await loadlib("json");
            var dict = await loadlib("dict");
            var d = dict.create(["a", 1]);
            expect(json.stringify(0)(d)).to.equal(`{"a":1}`);
            expect(json.stringify(2)(d)).to.equal(`{\n  "a": 1\n}`);
        });
    });
});
