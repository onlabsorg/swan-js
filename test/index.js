var expect = require("chai").expect;
var {parse, createContext, types} = require('../index');

describe("SWAN LANGUAGE", () => {
    require('./types');
    require('./interpreter');
    
    describe("modules", () => {
        require('./modules/bool');
        require('./modules/numb');
        require('./modules/text');
        require('./modules/list');        
        require('./modules/namespace');        
        require('./modules/time');
    });

    describe("Swan API", () => {

        describe("createContext(...namespaces)", () => {
            
            it("should extend the builtins", () => {
                const builtins = require("../lib/builtins");
                const context = createContext({});
                for (let key in builtins) {
                    expect(context[key]).to.equal(builtins[key]);
                }
            });
            
            it("should contain all the properties of the passed namespaces", () => {
                const context = createContext({x:10,y:20}, {x:11,z:31});
                expect(context.x).to.equal(11);
                expect(context.y).to.equal(20);
                expect(context.z).to.equal(31);
            });
        });
        
        describe("parse(expression)(context)", () => {
            
            it("should return an evaluate function that returns js values", async () => {
                const evaluate = parse("2+x");
                expect(evaluate).to.be.a("function");
                expect(await evaluate({x:10})).to.equal(12);
                
                expect(await parse("2+1")()).to.equal(3)
            });
        });
        
        describe("types", () => {
            
            it("should point to the types module", () => {
                expect(types).to.equal(require("../lib/types"));
            });
        });
    });
});