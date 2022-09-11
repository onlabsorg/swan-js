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
            await evaluate("debug.log(1,'abc',[1,2,3])");            
            expect(logId).to.equal("Log 1:");
            expect(logged).to.be.Tuple([1,'abc',[1,2,3]]);

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
    
    describe("debug.inspect", () => {
        
        describe("when the argument is a Bool", () => {
            
            it("should return an object with type and value", async () => {
                expect(await evaluate("debug.inspect(1==1)")).to.be.Namespace({
                    type: "Bool",
                    value: true
                })
            });
        });
        
        describe("when the argument is a Numb", () => {
            
            it("should return an object with type and value", async () => {
                expect(await evaluate("debug.inspect 123")).to.be.Namespace({
                    type: "Numb",
                    value: 123
                })
            });            
        });
        
        describe("when the argument is a Text", () => {
            
            it("should return an object with type and value", async () => {
                expect(await evaluate("debug.inspect 'abc'")).to.be.Namespace({
                    type: "Text",
                    value: "abc"
                })
            });            
        });
        
        describe("when the argument is a List", () => {

            it("should return an object with type and an array of inspection info as value", async () => {
                expect(await evaluate("debug.inspect [1, 'abc', 2]")).to.be.Namespace({
                    type: "List",
                    value: [
                        {type:"Numb", value:1},
                        {type:"Text", value:"abc"},
                        {type:"Numb", value:2}
                    ]
                })
            });                        
        });
        
        describe("when the argument is a Namespace", () => {
            
            it("should return an object with type and an mapping of inspection info as value", async () => {
                expect(await evaluate("debug.inspect {a:1, b:2, c:3}")).to.be.Namespace({
                    type: "Namespace",
                    value: {
                        a: {type:"Numb", value:1},
                        b: {type:"Numb", value:2},
                        c: {type:"Numb", value:3}
                    }
                })
            });                                    
        });
        
        describe("when the argument is a Func", () => {
            
            it("should return an object with type='Func'", async () => {
                expect(await evaluate("debug.inspect(x->x)")).to.be.Namespace({
                    type: "Func",
                })
            });                                    
        });
        
        describe("when the argument is a Tuple", () => {
            
            it("should return an object with type and an array of inspection info as value", async () => {
                expect(await evaluate("debug.inspect(1, 2, 3)")).to.be.Namespace({
                    type: "Tuple",
                    value: [
                        {type:"Numb", value:1},
                        {type:"Numb", value:2},
                        {type:"Numb", value:3}
                    ]
                })
            });                        

            it("should return an the first item inspection info if it is made of one item only", async () => {
                expect(await evaluate("debug.inspect(10, ())")).to.be.Namespace({
                    type: "Numb",
                    value: 10
                })
            });                        

            it("should return the object {type:'Nothing'} if it is an empty tuple", async () => {
                expect(await evaluate("debug.inspect()")).to.be.Namespace({
                    type: "Nothing"
                })
            });                        
        });
        
        describe("when the argument is an Undefined term", () => {
            
            it("should return the info object {Text type, Text operation, List arguments}", async () => {
                const presets = {undefined: (type, ...args) => new types.Undefined(type, ...args)};
                expect(await evaluate("debug.inspect(undefined('DummyOp', 1, 2))", presets)).to.be.Namespace({
                    type: "Undefined",
                    operation: "DummyOp",
                    arguments: [
                        {type:"Numb", value:1},
                        {type:"Numb", value:2},
                    ]
                })
            });            

            it("should return the info object containing also {Text source, Numb position} if the Undefined item contains a position", async () => {
                expect(await evaluate(`debug.inspect(
                        unknown_func())
                        `)).to.be.Namespace({
                    type: "Undefined",
                    operation: "ApplyOperation",
                    arguments: [
                        {
                            type: "Undefined",
                            operation: "NameReference",
                            arguments: [
                                {type:'Text', value:"unknown_func"}
                            ],
                            source: "                        unknown_func())",
                            position: 36
                        },
                        {type:"Nothing"}
                    ],
                    source: "                        unknown_func())",
                    position: 36
                })
            });            
        });
    });
});
