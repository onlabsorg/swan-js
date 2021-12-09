



// describe("tuple mapping operation: X => Y", () => {
// 
//     it("should apply Y to each item of X and return the resulting tuple", async () => {
//         expect(await parse("(1,2,3) => x -> 2*x")).to.be.Tuple([2,4,6]);
//         var tuple = await parse("(1,2,3) => 'abcdef'");
//         expect(tuple).to.be.instanceof(Tuple);
//         expect(Array.from(tuple)[0]).to.be.Undefined('application', "abcdef");
//         expect(Array.from(tuple)[1]).to.be.Undefined('application', "abcdef");
//         expect(Array.from(tuple)[2]).to.be.Undefined('application', "abcdef");
//     });
// });








// describe("X ?> F", () => {
// 
//     it("should return X if it is not undefined", async () => {
//         for (let X of [true, false, 10, "abc", [], {}, x=>x]) {
//             expect(await parse("X ?> 20", {X})).to.equal(X);
//         }
//     });
// 
//     it("should execute the function F with X.args as parameters if X is Undefined", async () => {
//         var presets = {
//             f: (operation, ...operands) => ['f result', operation, ...operands],
//             u: new Undefined('op', 1, 2, 3)
//         };
//         expect(await parse(`u ?> f`, presets)).to.deep.equal(['f result', 'op', 1, 2, 3]);
//     });
// 
//     it("should return Undefined if F is not a function", async () => {
//         var presets = {u: new Undefined()};
//         expect(await parse('u ?> 10', presets)).to.be.Undefined("application", 10);
//     });
// 
//     it("should apply the operator to each item if X is a tuple", async () => {
//         var presets = {
//             f: (operation, ...operands) => ['f result', operation, ...operands],
//             u: new Undefined('op', 1, 2, 3)
//         };
//         expect(await parse(`(10, u, 20) ?> f`, presets)).to.be.Tuple([10, ['f result', 'op', 1, 2, 3], 20]);            
//     });
// });



















// // CONSTANTS
// 
// describe("TRUE constant", () => {
//     it("should return true", async () => {
//         expect(await parse("TRUE")).to.equal(true);
//     });
// });
// 
// describe("FALSE constant", () => {
//     it("should return false", async () => {
//         expect(await parse("FALSE")).to.equal(false);
//     });
// });
// 
// describe("INFINITY constant", () => {
//     it("should return Infinity", async () => {
//         expect(await parse("INFINITY")).to.equal(Infinity);
//     });
// });
// 
// 
// // BUILT-IN FUNCTIONS
// 
// describe("undefined X", () => {
// 
//     it("should return Undefined", async () => {
//         var u = await parse("undefined('testing', 1)");
//         expect(u).to.be.Undefined("testing", 1);
// 
//         var u = await parse("undefined('testing', 1, [])");
//         expect(u).to.be.Undefined("testing", 1, []);
// 
//         var u = await parse("undefined('testing', 1, [], {})");
//         expect(u).to.be.Undefined("testing", 1, [], {});
// 
//         var u = await parse("undefined('testing', null)");
//         expect(u).to.be.Undefined("testing");
//     });
// });
// 
// describe("bool X", () => {
// 
//     it("should return X if it is a boolean", async () => {
//         expect(await parse("bool FALSE")).to.equal(false);
//         expect(await parse("bool TRUE")).to.equal(true);
//     });
// 
//     it("should return true if X is a non-zero number", async () => {
//         expect(await parse("bool 0")).to.equal(false);
//         expect(await parse("bool 10")).to.equal(true);
//         expect(await parse("bool (-1)")).to.equal(true);
//     });
// 
//     it("should return true if X is a non-empty string", async () => {
//         expect(await parse("bool ''")).to.equal(false);
//         expect(await parse("bool 'abc'")).to.equal(true);
//     });
// 
//     it("should return true if X is a non-empty list", async () => {
//         expect(await parse("bool []")).to.equal(false);
//         expect(await parse("bool [1,2,3]")).to.equal(true);
//     });
// 
//     it("should return true if X is a non-empty namespace", async () => {
//         expect(await parse("bool {}")).to.equal(false);
//         expect(await parse("bool {a=1,b=2,c=3}")).to.equal(true);
//     });
// 
//     it("should return true if X is a function", async () => {
//         expect(await parse("bool (x->x)")).to.equal(true);
//         expect(await parse("bool jsFn", {jsFn:x=>2*x})).to.equal(true);
//     });
// 
//     it("should return true if X is a tuple with at least one true item", async () => {
//         expect(await parse("bool (0,0,0)")).to.equal(false);
//         expect(await parse("bool (0,1,-1)")).to.equal(true);
//     });
// 
//     it("should return false if X is an empty tuple", async () => {
//         expect(await parse("bool ()")).to.equal(false);
//     });
// 
//     it("should return Undefined if any of the X items is Undefined", async () => {
//         var presets = {
//             un1: new Undefined('text1'),
//             un2: new Undefined('test2'),
//         };
//         expect(await parse("bool un1", presets)).to.be.Undefined('booleanization', presets.un1);
//         expect(await parse("bool (0,un1,un2)", presets)).to.be.Undefined('booleanization', presets.un1);
//     });
// });
// 
// describe("not X", () => {
// 
//     it("should return !X if it is a boolean", async () => {
//         expect(await parse("not FALSE")).to.equal(!false);
//         expect(await parse("not TRUE")).to.equal(!true);
//     });
// 
//     it("should return false if X is a non-zero number", async () => {
//         expect(await parse("not 0")).to.equal(!false);
//         expect(await parse("not 10")).to.equal(!true);
//         expect(await parse("not (-1)")).to.equal(!true);
//     });
// 
//     it("should return false if X is a non-empty string", async () => {
//         expect(await parse("not ''")).to.equal(!false);
//         expect(await parse("not 'abc'")).to.equal(!true);
//     });
// 
//     it("should return false if X is a non-empty list", async () => {
//         expect(await parse("not []")).to.equal(!false);
//         expect(await parse("not [1,2,3]")).to.equal(!true);
//     });
// 
//     it("should return false if X is a non-empty namespace", async () => {
//         expect(await parse("not {}")).to.equal(!false);
//         expect(await parse("not {a=1,b=2,c=3}")).to.equal(!true);
//     });
// 
//     it("should return false if X is a function", async () => {
//         expect(await parse("not (x->x)")).to.equal(!true);
//         expect(await parse("not jsFn", {jsFn:x=>2*x})).to.equal(!true);
//     });
// 
//     it("should return false if X is a tuple with at least one true item", async () => {
//         expect(await parse("not (0,0,0)")).to.equal(!false);
//         expect(await parse("not (0,1,-1)")).to.equal(!true);
//     });
// 
//     it("should return true if X is an empty tuple", async () => {
//         expect(await parse("not ()")).to.equal(!false);
//     });
// 
//     it("should return Undefined if any of the X items is undefined", async () => {
//         var presets = {
//             un1: new Undefined('text1'),
//             un2: new Undefined('test2'),
//         };
//         expect(await parse("not un1", presets)).to.be.Undefined('booleanization', presets.un1);
//         expect(await parse("not (0,un1,un2)", presets)).to.be.Undefined('booleanization', presets.un1);
//     });
// });
// 
// describe("str X", () => {
// 
//     it("should return an empty string if X is nothing", async () => {
//         expect(await parse("str ()")).to.equal("");
//     });
// 
//     it("should return 'TRUE' if X is true", async () => {
//         expect(await parse("str TRUE")).to.equal("TRUE");
//     });
// 
//     it("should return 'FALSE' if X is false", async () => {
//         expect(await parse("str FALSE")).to.equal("FALSE");
//     });
// 
//     it("should return String(X) if X is a number", async () => {
//         expect(await parse("str 123.4")).to.equal("123.4");
//     });
// 
//     it("should return X itself if it is a string", async () => {
//         expect(await parse("str 'abc'")).to.equal("abc");
//     });
// 
//     it("should return '[[Function]]' if X is a function", async () => {
//         expect(await parse("str jsFn", {jsFn: x => 2*x})).to.equal("[[Function]]");
//         expect(await parse("str (x->x)", {jsFn: x => 2*x})).to.equal("[[Function]]");
//     });
// 
//     it("should return '[[List of n items]]' when X is a list with n items", async () => {
//         expect(await parse("str[1,2,'abc']")).to.equal("[[List of 3 items]]")
//     });
// 
//     it("should return '[[Namespace of n items]]' when X is a namestpace with n items", async () => {
//         expect(await parse("str{a=1,b=2,c=3}")).to.equal("[[Namespace of 3 items]]");
//         expect(await parse("str ns", {ns:{a:1,b:2,c:3,$d:4}})).to.equal("[[Namespace of 3 items]]");
//     });
// 
//     it("shoulr return `X.__str__` if `X` is a namespace and `X.__str__` is a string", async () => {
//         expect(await parse("str{__str__:'custom string'}")).to.equal("custom string");
//         expect(await parse("str{a=1,b=2,__str__=3}")).to.equal("[[Namespace of 3 items]]");            
//     });
// 
//     it("Should return '[[Undefined: arg1, arg2, ...]]' if X is Undefined", async () => {
//         var presets = {un: new Undefined("test", 10, [1,2,3], new Position("\n1+2", 2))};
//         console.log(await parse("str un", presets));
//         expect(await parse("str un", presets)).to.equal("[[Undefined: test, 10, [[List of 3 items]], @2:1]]");
//     });
// 
//     it("should concatenate the serialized item if X is a tuple", async () => {
//         expect(await parse("str('it is ',TRUE,' that 1+2 is ',3)")).to.equal("it is TRUE that 1+2 is 3");
//     });
// });
// 
// describe("enum X", () => {
// 
//     it("shoule return the tuple of the first X integers if X is a number", async () => {
//         expect(await parse('enum 5')).to.be.Tuple([0,1,2,3,4]);
//         expect(await parse('enum 5.1')).to.be.Tuple([0,1,2,3,4,5]);
//         expect(await parse('enum (-3)')).to.be.Tuple([0,-1,-2]);
//         expect(await parse('enum (-3.1)')).to.be.Tuple([0,-1,-2,-3]);
//         expect(await parse("enum 1")).to.equal(0);
//         expect(await parse("enum 0")).to.equal(null);
//     });
// 
//     it("should return the tuple `(x1,x2,x3,...)` when X is the list `[x1,x2,x3,...]`", async () => {
//         expect(await parse("enum [10,20,30]")).to.be.Tuple([10,20,30]);
//         expect(await parse("enum ls", {ls:[10,20,30]})).to.be.Tuple([10,20,30]);
//         expect(await parse("enum [1]")).to.equal(1);
//         expect(await parse("enum []")).to.equal(null);
// 
//         // it doesn't complain if a list item is Undefined
//         var presets = {un: new Undefined('Test exception!')};
//         expect(await parse("enum [1,un,2]", presets)).to.be.Tuple([1,presets.un,2]);
//         expect(await parse("enum [un]", presets)).to.equal(presets.un);
//     });
// 
//     it("should return the tuple `('a','b','c')` when X is the string `'abc'`", async () => {
//         expect(await parse("enum 'abc'")).to.be.Tuple(['a','b','c']);
//         expect(await parse("enum s", {s:"abc"})).to.be.Tuple(['a','b','c']);
//         expect(await parse("enum 'a'")).to.equal("a");
//         expect(await parse("enum ''")).to.equal(null);
//     });
// 
//     it("should return the tuple `('name1','name2',...)` when X is the namespace `{name1:val1, name2:val2, ...}`", async () => {
//         expect(await parse("enum {a:1,b:2,c:3}")).to.be.Tuple(['a','b','c']);
//         expect(await parse("enum ns", {ns:{a:1,b:2,c:3,$d:4}})).to.be.Tuple(['a','b','c']);
//         expect(await parse("enum {a:1}")).to.equal("a");
//         expect(await parse("enum {}")).to.equal(null);
//     });
// 
//     it("should return Undefined when X is of any other type", async () => {
//         expect(await parse("enum TRUE")).to.be.Undefined("enumeration", true);
//         expect(await parse("enum FALSE")).to.be.Undefined("enumeration", false);
// 
//         var presets = {un: new Undefined(), fn: x=>2*x};
//         expect(await parse("enum fn", presets)).to.be.Undefined("enumeration", presets.fn);
//         expect(await parse("enum un", presets)).to.be.Undefined('enumeration', presets.un);
//     });
// 
//     it("should concatenate the enumeration of each item if X is a tuple", async () => {
//         expect(await parse("enum ('abc',[1,2,3])")).to.be.Tuple(['a','b','c',1,2,3]);
//     });
// });
// 
// describe("type X", () => {
// 
//     it("should return Nothing if `X` is an empty tuple", async () => {
//         expect(await parse("type()")).to.equal(null);
//     });
// 
//     it("should return 'Undefined' if `X` is an Undefined object", async () => {
//         var presets = {un: new Undefined()};
//         expect(await parse("type un", presets)).to.equal('Undefined');
//     });
// 
//     it("should return 'Boolean' if `X` is a boolean value", async () => {
//         expect(await parse("type TRUE")).to.equal("Boolean");
//         expect(await parse("type FALSE")).to.equal("Boolean");
//     });
// 
//     it("should return 'Number' if `X` is a number", async () => {
//         expect(await parse("type 1")).to.equal("Number");
//     });
// 
//     it("should return 'String' if `X` is a string", async () => {
//         expect(await parse("type 'abc'")).to.equal("String");
//     });
// 
//     it("should return 'List' if `X` is a list", async () => {
//         expect(await parse("type [1,2,3]")).to.equal("List");
//     });
// 
//     it("should return 'Namespace' if `X` is a namespace", async () => {
//         expect(await parse("type {x:1}")).to.equal("Namespace");
//     });
// 
//     it("should return 'Function' if `X` is a function", async () => {
//         expect(await parse("type(()->())")).to.equal("Function");
//     });
// 
//     it("should return a tuple of types if `X` is a tuple", async () => {
//         expect(await parse("type(TRUE,1,'abc')")).to.be.Tuple(['Boolean', 'Number', 'String']);
// 
//         // it should not complain fi a tuple item is Undefined
//         var presets = {un: new Undefined()}
//         expect(await parse("type(TRUE,un,'abc')", presets)).to.be.Tuple(['Boolean', 'Undefined', 'String']);
//     });
// });
// 
// describe("size X", () => {
// 
//     it("should return the length of X if X is a string", async () => {
//         var size = await parse("size 'abc'");
//         expect(size).to.equal(3);
//     });
// 
//     it("should return the length of X if X is a list", async () => {
//         var size = await parse("size [1,2,3]");
//         expect(size).to.equal(3);
//     });
// 
//     it("should return the number of own names if X is a namespace", async () => {
//         var size = await parse("size {a=1,b=2,c=3}");
//         expect(size).to.equal(3);
// 
//         var ctx = {o: Object.assign(Object.create({x:1,y:2,a:10}), {a:1,b:2,c:3,$d:4})};
//         var size = await parse("size o", ctx);
//         expect(size).to.equal(5);
//     });
// 
//     it("should return Undefined if X is of any other type", async () => {
//         expect(await parse("size TRUE")).to.be.Undefined('size', true);
//         expect(await parse("size 1")).to.be.Undefined('size', 1);
// 
//         var presets = {un: new Undefined(), fn: x=>2*x};
//         expect(await parse("size fn", presets)).to.be.Undefined('size', presets.fn);
//         expect(await parse("size un", presets)).to.be.Undefined('size', presets.un);
//     });
// 
//     it("should return a tuple containing the size of each item if X is a tuple", async () => {
//         expect(await parse("size('abc', [1,2,3,4], {a:1})")).to.be.Tuple([3,4,1]);
//         expect(await parse("size()")).to.be.null;
// 
//         // it should not complain fi a tuple item is Undefined
//         var presets = {un: new Undefined};
//         var size = await parse("size('abc', un, 10)", presets);
//         expect(size).to.be.instanceof(Tuple);
//         expect(Array.from(size)[0]).to.equal(3);
//         expect(Array.from(size)[1]).to.be.Undefined('size', presets.un);
//         expect(Array.from(size)[2]).to.be.Undefined('size', 10);
//     });
// });
// 


// 
// 
// // FUNCTION composition
// 
// describe("G << F", () => {
// 
//     it("should return the function X -> G(F(X))", async () => {
//         var presets = {f: x=>2*x, g: x=>[x]};
//         var cf = await parse("g << f", presets);
//         expect(cf).to.be.a("function");
//         expect(await cf(2)).to.deep.equal([4]);
//     });
// 
//     it("should work with tuples of functions", async () => {
//         var presets = {f2: x=>2*x, f3: x=>3*x, f4: x=>4*x, g: (...x)=>[...Tuple(...x)]};
//         var cf = await parse("g << (f2,f3,f4)", presets);
//         expect(cf).to.be.a("function");
//         expect(await cf(2)).to.deep.equal([4, 6, 8]);
//     });
// 
//     it("should be righ-to-left associative", async () => {
//         var presets = {f: x=>2*x, g: x=>x**2, h: x=>[x]};
// 
//         var cf = await parse("h << g << f", presets);
//         expect(cf).to.be.a("function");
//         expect(await cf(2)).to.deep.equal([16]);            
// 
//         var cf = await parse("h << f << g", presets);
//         expect(cf).to.be.a("function");
//         expect(await cf(2)).to.deep.equal([8]);            
//     });
// });
// 
// describe("F >> G", () => {
// 
//     it("should return the function X -> G(F(X))", async () => {
//         var presets = {f: x=>2*x, g: x=>[x]};
//         var cf = await parse("f >> g", presets);
//         expect(cf).to.be.a("function");
//         expect(await cf(2)).to.deep.equal([4]);            
//     });
// 
//     it("should work with tuples of functions", async () => {
//         var presets = {f2: x=>2*x, f3: x=>3*x, f4: x=>4*x, g: (...x)=>[...Tuple(...x)]};
//         var cf = await parse("(f2,f3,f4) >> g", presets);
//         expect(cf).to.be.a("function");
//         expect(await cf(2)).to.deep.equal([4, 6, 8]);            
//     });
// });
// 
// 
