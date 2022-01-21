const expect = require("./expect");

const types = require("../lib/types");
const swan = require("..");


describe("swan test script", () => {
    var context;
    
    before(async () => {
        const fs = require('fs');
        const scriptSource = fs.readFileSync(`${__dirname}/test-script.swan`, "utf8");
        context = swan.createContext();
        const scriptNamespace = await swan.parse(scriptSource)(context);
    });
    
    describe("count: Tuple t -> Numb n", () => {
        
        it("should return the number of items of the passed tuple", async () => {
            expect(await swan.parse("count (10,20,30)")(context)).to.equal(3);
        });
    });

    describe("map: Func f -> Tuple t -> Tuple ft", () => {
        
        it("should return the tuple of mapped items", async () => {
            expect(await swan.parse("map (x -> 2*x)")(context)).to.be.a("function");
            expect(await swan.parse("map (x -> 2*x) (10,20,30)")(context)).to.be.Tuple([20,40,60]);
        });
    });

    describe("factorial: Numb n -> Numb f", () => {
        
        it("should return the factorial of the given number", async () => {
            expect(await swan.parse("factorial 4")(context)).to.equal(4*3*2*1);
        });
    });
});
