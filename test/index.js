var expect = require("chai").expect;
var {parse, createContext, defineModule} = require('../index');

describe("SWAN LANGUAGE", () => {
    require('./tuple');
    require('./interpreter');
    
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

    require('./modules');
});