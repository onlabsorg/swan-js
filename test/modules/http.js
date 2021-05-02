var expect = require("chai").expect;
var loadlib = require("../../lib/modules").require;

describe("http module", function () {

    describe("http.get(url, options)", function () {

        it("should fetch the text at the given url", async function () {
            this.timeout(500);
            var http = await loadlib("http");
            var url = "https://raw.githubusercontent.com/onlabsorg/olojs/master/README.md";
            var response = await fetch(url);
            var content = await response.text();
            expect(await http.get(url)).to.equal(content);
        });

        it("should throw an error if the response status is not 2XX", async () => {
            var http = await loadlib("http");
            var url = "https://raw.githubusercontent.com/onlabsorg/olojs/master/NON_EXISTING_FILE";
            try {
                await http.get(url);
                throw new Error("it didn't throw");
            } catch (error) {
                expect(error.message).to.equal("404");
            }
        });
    });
});
