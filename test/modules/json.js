const expect = require("../expect");

const types = require("../../lib/types");
const parse = require("../../lib/interpreter");
const json = require("../../lib/modules/json")(types);

const evaluate = async (expression, presets={}) => {
    const context = Object.assign({json}, presets);
    return await parse(expression)(context);
}



describe("json module", () => {

    describe("json.parse: Text t -> Namespace ns", () => {
        
        it("should return the the Namespace represented by the JSON string t", async () => {
            const ns = {n:10, s:"abc", ls:[1,2,3], ns:{y:20}};
            const t = JSON.stringify(ns)
            expect(await evaluate(`json.parse '`+t+`'`)).to.be.Namespace(ns);
        });        
    });    

    describe("json.parse: Text t -> Namespace ns", () => {
        
        it("should return the the JSON string representing the given term", async () => {
            const ns = {n:10, s:"abc", ns:{y:20}};
            const t = await evaluate(`json.serialize ns`, {ns});
            expect(JSON.parse(t)).to.deep.equal(ns);
            
            const tf = `{\n` +
                       `  "n": 10,\n` +
                       `  "s": "abc",\n` +
                       `  "ns": {\n` +
                       `    "y": 20\n` +
                       `  }\n` +
                       `}`;
            expect(await evaluate(`json.serialize ns`, {ns})).to.be.Text(tf);
        });        
        
        it("should return Undefined Text if t is a Func or an Undefined item", async () => {
            expect(await evaluate("json.serialize(x->x)")).to.be.Undefined('Text');
            expect(await evaluate("json.serialize(1/[])")).to.be.Undefined('Text');
        });
        
        it("should return a Tuple of strings if t is a tuple", async () => {
            expect(await evaluate("json.serialize(10,[],{})")).to.be.Tuple([
                "10", "[]", "{}"
            ]);
            expect(await evaluate("json.serialize()")).to.be.Tuple([]);            
        });
    });    
});
