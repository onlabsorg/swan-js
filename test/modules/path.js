const expect = require("../expect");

const types = require("../../lib/types");
const parse = require("../../lib/interpreter");
const path = require("../../lib/modules/path")(types);

const evaluate = async (expression, presets={}) => {
    const context = Object.assign({path}, presets);
    return await parse(expression)(context);
}



describe("path module", () => {

    describe("path.join: Tuple chunks -> Text path", () => {
        
        it("should join and normalized the passed path chunks", async () => {            
            expect(await evaluate("path.join('/path/to', 'my', 'dir/subdir/../doc')")).to.be.Text('/path/to/my/dir/doc');
        });

        it("should not add leading /", async () => {            
            expect(await evaluate("path.join('path/to', 'my/doc')")).to.be.Text('path/to/my/doc');
        });

        it("should not remove trailing /", async () => {            
            expect(await evaluate("path.join('path/to', 'my/dir/')")).to.be.Text('path/to/my/dir/');
        });

        it("should add a trailing / if the last chunk is an empty string", async () => {
            expect(await evaluate("path.join('path/to', 'my/dir', '')")).to.be.Text('path/to/my/dir/');
        });
    });

    describe("path.join: Tuple c -> Tuple s", () => {
        
        it("should return the tuple of segments of the given path", async () => {
            expect(await evaluate("path.split '/path/to/my/doc'")).to.be.Tuple(['path','to','my','doc']);
            expect(await evaluate("path.split '/path/to/my/dir/'")).to.be.Tuple(['path','to','my','dir', '']);
        });

        it("should first join the chunks if a tuple of chunks is passed", async () => {
            expect(await evaluate("path.split('/path/to','/my/doc')")).to.be.Tuple(['path','to','my','doc']);
        });
    });
});
