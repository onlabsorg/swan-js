var expect = require("chai").expect;
var loadlib = require("../../lib/modules").require;
var {context, Tuple, Undefined} = require("../../lib/interpreter");


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
            const debug = await loadlib('debug');
            
            await debug.log.call(context, 10,'abc',{x:1});
            expect(logId).to.equal("Log 1:");
            expect(logged).to.be.instanceof(Tuple);
            expect(Array.from(logged)).to.deep.equal([10,'abc',{x:1}]);

            await debug.log.call(context, 11);
            expect(logId).to.equal("Log 2:");
            expect(logged).to.equal(11);
        });
        
        it("should return the log number", async () => {
            const debug = await loadlib('debug');
            expect(await debug.log.call(context, 10,'abc',{x:1})).to.equal("[[Log 3]]");
        });
        
        after(() => {
            console.log = jslog;
        });
    });
    
    describe("debug.inspect", () => {
        it("should return a descriptor of the passed argument", async () => {
            const debug = await loadlib('debug');

            var descriptor = await debug.inspect.call(context, true);
            expect(descriptor).to.deep.equal({type:"Boolean", data:true});

            var descriptor = await debug.inspect.call(context, 10);
            expect(descriptor).to.deep.equal({type:"Number", data:10});

            var descriptor = await debug.inspect.call(context, 'abc');
            expect(descriptor).to.deep.equal({type:"String", data:'abc'});

            var f = x => x;
            var descriptor = await debug.inspect.call(context, f);
            expect(descriptor).to.deep.equal({type:"Function", data:f});

            var descriptor = await debug.inspect.call(context, [1,'abc']);
            expect(descriptor).to.deep.equal({
                type: "List", 
                data: [
                    {type:"Number", data:1},
                    {type:"String", data:'abc'}
                ]
            });

            var descriptor = await debug.inspect.call(context, {x:10, s:'abc'});
            expect(descriptor).to.deep.equal({
                type: "Namespace", 
                data: {
                    x: {type:"Number", data:10},
                    s: {type:"String", data:'abc'}
                }
            });

            var e = new Error();
            var descriptor = await debug.inspect.call(context, e);
            expect(descriptor).to.deep.equal({
                type: "Error", 
                data: e
            });
            
            var descriptor = await debug.inspect.call(context, 10, 'abc');
            expect(descriptor).to.deep.equal({
                type: "Tuple", 
                data: [
                    {type:"Number", data:10},
                    {type:"String", data:'abc'}
                ]
            });
            
            var u = new Undefined(10, 'abc');
            var descriptor = await debug.inspect.call(context, u);
            expect(descriptor).to.deep.equal({
                type: "Undefined", 
                data: [
                    {type:"Number", data:10},
                    {type:"String", data:'abc'}
                ],
                location: {}
            });            
        });
    });
});

