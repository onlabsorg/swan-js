var expect = require("chai").expect;
var loadlib = require("../../lib/modules").require;
var swan = require("../..");


describe("path module", () => {

    describe("path.getDirName(path)", () => {
        it("should return the path without the last portion", async () => {
            var path = await loadlib("path");
            expect(await path.getDirName('/path/to/name.ext')).to.equal('/path/to');
        });
    });

    describe("path.getBaseName(path)", () => {
        it("should return the last portion of the path", async () => {
            var path = await loadlib("path");
            expect(await path.getBaseName('/path/to/name.ext')).to.equal('name.ext');
        });
    });

    describe("path.getExtName(path)", () => {
        it("should return the file extension", async () => {
            var path = await loadlib("path");
            expect(await path.getExtName('/path/to/name.ext')).to.equal('.ext');
        });
    });

    describe("path.nomalize(path)", () => {
        it("should resolve `.`, `..` and multiple `/`", async () => {
            var path = await loadlib("path");
            expect(await path.normalize('/foo/bar//baz/asdf/quux/..')).to.equal('/foo/bar/baz/asdf');
        });
    });

    describe("path.join(...paths)", () => {
        it("should join and normalize the passed paths", async () => {
            var path = await loadlib("path");
            expect(await path.join('/foo/bar', './baz/asdf', '/quux/..')).to.equal('/foo/bar/baz/asdf');
        });
    });

    describe("path.resolve(...paths)", () => {
        it("should resolve and normalize the passed paths", async () => {
            var path = await loadlib("path");
            expect(await path.resolve('/foo/bar', './baz/asdf', 'quux/..')).to.equal('/foo/bar/baz/asdf');
            expect(await path.resolve('foo/bar', './baz/asdf', 'quux/..')).to.equal('/foo/bar/baz/asdf');
            expect(await path.resolve('/foo/bar', '/baz/asdf', 'quux/..')).to.equal('/baz/asdf');
        });
    });
});
