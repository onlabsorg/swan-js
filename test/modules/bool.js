const expect = require("../expect");

const types = require("../../lib/types");
const parse = require("../../lib/interpreter");
const bool = require("../../lib/modules/bool")(types);

const evaluate = async (expression, presets={}) => {
    const context = Object.assign({bool}, presets);
    return await parse(expression)(context);
}



describe("bool", () => {
    
    describe("bool.TRUE", () => {
        
        it("should be true", async () => {
            expect(await evaluate("bool.TRUE")).to.be.Bool(true);
        });
    });
    
    describe("bool.FALSE", () => {
        
        it("should be true", async () => {
            expect(await evaluate("bool.FALSE")).to.be.Bool(false);
        });
    });

    describe("bool.from - function", () => {
        
        it("should return FALSE if the argument is a falsy term", async () => {
            expect(await evaluate("bool.from ()       ")).to.be.Bool(false);
            expect(await evaluate("bool.from (1 == 2) ")).to.be.Bool(false);
            expect(await evaluate("bool.from 0        ")).to.be.Bool(false);
            expect(await evaluate("bool.from ''       ")).to.be.Bool(false);
            expect(await evaluate("bool.from []       ")).to.be.Bool(false);
            expect(await evaluate("bool.from {}       ")).to.be.Bool(false);
            expect(await evaluate("bool.from ('a'/'b')")).to.be.Bool(false);
            expect(await evaluate("bool.from (0,'',[])")).to.be.Bool(false);
        });

        it("should return TRUE if the argument is a truty term", async () => {
            expect(await evaluate("bool.from (x->x)   ")).to.be.Bool(true);
            expect(await evaluate("bool.from (1 == 1) ")).to.be.Bool(true);
            expect(await evaluate("bool.from 10       ")).to.be.Bool(true);
            expect(await evaluate("bool.from 'abc'    ")).to.be.Bool(true);
            expect(await evaluate("bool.from [1,2,3]  ")).to.be.Bool(true);
            expect(await evaluate("bool.from {a:1}    ")).to.be.Bool(true);
            expect(await evaluate("bool.from (1,'',[])")).to.be.Bool(true);
        });
    });
    
    describe("bool.not - function", () => {
        
        it("should return TRUE if the argument is a falsy term", async () => {
            expect(await evaluate("bool.not ()       ")).to.be.Bool(true);
            expect(await evaluate("bool.not (1 == 2) ")).to.be.Bool(true);
            expect(await evaluate("bool.not 0        ")).to.be.Bool(true);
            expect(await evaluate("bool.not ''       ")).to.be.Bool(true);
            expect(await evaluate("bool.not []       ")).to.be.Bool(true);
            expect(await evaluate("bool.not {}       ")).to.be.Bool(true);
            expect(await evaluate("bool.not ('a'/'b')")).to.be.Bool(true);
            expect(await evaluate("bool.not (0,'',[])")).to.be.Bool(true);
        });

        it("should return FALSE if the argument is a truty term", async () => {
            expect(await evaluate("bool.not (x->x)   ")).to.be.Bool(false);
            expect(await evaluate("bool.not (1 == 1) ")).to.be.Bool(false);
            expect(await evaluate("bool.not 10       ")).to.be.Bool(false);
            expect(await evaluate("bool.not 'abc'    ")).to.be.Bool(false);
            expect(await evaluate("bool.not [1,2,3]  ")).to.be.Bool(false);
            expect(await evaluate("bool.not {a:1}    ")).to.be.Bool(false);
            expect(await evaluate("bool.not (1,'',[])")).to.be.Bool(false);
        });
    });        
});
