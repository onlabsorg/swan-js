var expect = require("chai").expect;
var {parse, createContext, defineModule} = require('../index');

describe("SWAN LANGUAGE", () => {
    require('./tuple');
    require('./interpreter');
    
    describe("ERRORS STACK", () => {

        it("should add the functions stack and the expression source to the runtime errors", async () => {
            class DidNotThrow extends Error {};
            var ctx = createContext();

            await parse("x+1,\nf1 = x -> 2/x")(ctx);
            await parse("`aaa ${f2 = x -> f1 x + 1} bbb`")(ctx)
            try {
                await parse("f2 [1,2,3]")(ctx);
                throw DidNotThrow();
            } catch (error) {
                expect(error).to.be.not.instanceof(DidNotThrow);
                expect(error.failureStack).to.equal(`@ f2 [1,2,3]\n    ^\n@ f2 = x -> f1 x + 1\n              ^\n@ f1 = x -> 2/x\n             ^\n`);
            }
        });
    });

    describe("MODULES", () => {

        it("should delegate to the loader, defined with define, mathching the modlePath", async () => {
            var context = createContext();
            var mod1={}, mod2={};
            defineModule('path/to/mod1', () => mod1);
            defineModule('/path/to/mod2', () => mod2);
            expect(await context.require('path/to/mod1')).to.equal(mod1);
            expect(await context.require('/path/to/mod1')).to.equal(mod1);
            expect(await context.require('path/to/mod2')).to.equal(mod2);
            expect(await context.require('/path/to/mod2')).to.equal(mod2);
        });
    });

    //require('./stdlib');
});