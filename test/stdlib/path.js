var expect = require("chai").expect;
var path = require("../../lib/stdlib/path");


describe("path module", () => {

    describe("path.dir(path)", () => {
        it("should return the path without the last portion", async () => {
            expect(await path.dir('/path/to/name.ext')).to.equal('/path/to');
        });
    });

    describe("path.fullName(path)", () => {
        it("should return the last portion of the path", async () => {
            expect(await path.fullName('/path/to/name.ext')).to.equal('name.ext');
        });
    });

    describe("path.name(path)", () => {
        it("should return the last portion of the path, without extension", async () => {
            expect(await path.name('/path/to/fname.ext')).to.equal('fname');
        });
    });

    describe("path.ext(path)", () => {
        it("should return the file extension", async () => {
            expect(await path.ext('/path/to/name.ext')).to.equal('.ext');
        });
    });

    describe("path.nomalize(path)", () => {
        it("should resolve `.`, `..` and multiple `/`", async () => {
            expect(await path.normalize('/foo/bar//baz/asdf/quux/..')).to.equal('/foo/bar/baz/asdf');
        });
    });

    describe("path.join(...paths)", () => {
        it("should join and normalize the passed paths", async () => {
            expect(await path.join('/foo/bar', './baz/asdf', '/quux/..')).to.equal('/foo/bar/baz/asdf');
        });
    });

    describe("path.resolve(...paths)", () => {
        it("should resolve and normalize the passed paths", async () => {
            expect(await path.resolve('/foo/bar', './baz/asdf', 'quux/..')).to.equal('/foo/bar/baz/asdf');
            expect(await path.resolve('foo/bar', './baz/asdf', 'quux/..')).to.equal('/foo/bar/baz/asdf');
            expect(await path.resolve('/foo/bar', '/baz/asdf', 'quux/..')).to.equal('/baz/asdf');
        });
    });
});
