const expect = require("../expect");

const types = require("../../lib/types");
const parse = require("../../lib/interpreter");
const debug = require("../../lib/modules/debug")(types);

const evaluate = async (expression, presets={}) => {
    const context = Object.assign({debug}, presets);
    return await parse(expression)(context);
}


describe("debug module", function () {
    
    describe("debug.log", () => {
        var jslog, logId, logged;
        
        before(() => {
            jslog = console.log;
            console.log = (id, value) => {
                logId = id;
                logged = value;
            }
        });
        
        it("should log the passed arguments to the console", async () => {
            await evaluate("debug.log(1,'abc',[1,2,3],{a:1})");            
            expect(logId).to.equal("Log 1:");
            expect(logged).to.be.Tuple([1,'abc',[1,2,3],{a:1}]);

            await evaluate("debug.log(11)");            
            expect(logId).to.equal("Log 2:");
            expect(logged).to.be.Numb(11);
        });
        
        it("should return the log number", async () => {
            expect(await evaluate("debug.log(1,'abc',[1,2,3],{a:1})")).to.be.Text("[[Log 3]]");
        });
        
        after(() => {
            console.log = jslog;
        });
    });
});

