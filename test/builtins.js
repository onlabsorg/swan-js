const expect = require("./expect");

const types = require("../lib/types");

const parse = require("../lib/interpreter");
const evaluate = (expression, presets={}) => parse(expression)(Object.assign(Object.create(builtins), presets));

const {Bool, Numb, Text, List, Namespace, Func, Time, Tuple, Undefined} = builtins = require("../lib/builtins");



describe("builtins", () => {
    
    describe.skip("List", () => {
    
        describe.skip("List.size(array)", () => {
    
            it("should return the array length", () => {
                expect(List.size([1,2,3])).to.equal(3);
                expect(List.size([])).to.equal(0);
            });
    
            it("shoudl throw a type error if the passed argument is not a string", () => {
                expect(() => List.size({})).to.throw(TypeError);
            });
        });
    
        describe("l2 = List.reverse l1", () => {
    
            it("should return l1 in reversed order", async () => {
                expect(await evaluate("List.reverse [1,2,3]")).to.be.List([3,2,1]);
            });
            
            it("should return Undefined List if the l1 is not a List", async () => {
                expect(await evaluate("List.reverse 123")).to.be.Undefined("List");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("List.reverse([1,2,3],[4,5,6])")).to.be.Tuple([[3,2,1],[6,5,4]]);
            });                        
        });
    
        describe("f = List.find x", () => {
            
            describe("when x is an item", () => {
                
                it("should return a function", async () => {
                    expect(await evaluate("List.find 10")).to.be.instanceof(types.Func);
                });

                describe("i = f L ", () => {
        
                    it("should return the first index of x in L", async () => {
                        expect(await evaluate("List.find 'Abc' ['Abc', 'def', 'Abc']")).to.be.Numb(0);
                        expect(await evaluate("List.find 'Abc' ['abc', 'def', 'Abc']")).to.be.Numb(2);
                    });
        
                    it("should return -1 if no match is found", async () => {
                        expect(await evaluate("List.find 'xxx' ['Abc', 'def', 'Abc']")).to.be.Numb(-1);
                    });
        
                    it.skip("should return Undefined Text if `s1` is not a string", async () => {
                        expect(await evaluate("Text.find 10")).to.be.instanceof(types.Func);
                        expect(await evaluate("Text.find 10 'abc'")).to.be.Undefined("Text");
                    });

                    it.skip("should return Undefined Text if `s2` is not a string", async () => {
                        expect(await evaluate("Text.find 'abc' 10")).to.be.Undefined("Text");
                    });

                    it.skip("should return a tuple of values if `s2` is a tuple", async () => {
                        expect(await evaluate("Text.find 'Abc' ('__Abc__def__Abc', '01234Abc__')")).to.be.Tuple([2,5]);
                    });
                });
            });

            describe("when the argument is a tuple", () => {
                
                it.skip("should return one `find` function for each item of the argument", async () => {
                    const F = await evaluate("Text.find('Abc','Def')");
                    expect(F).to.be.instanceof(types.Tuple);

                    const [f1,f2] = Array.from(F.items());
                    expect(f1).to.be.instanceof(types.Func)
                    expect(f2).to.be.instanceof(types.Func)
                    
                    expect(await evaluate("Text.find('Abc','Def') '__Abc__def__Def'")).to.be.Tuple([2,12]);
                    expect(await evaluate("Text.find('Abc','Def')('__Abc__Def__Abc', '01234Abc__')")).to.be.Tuple([2,5,7,-1]);                    
                });
            });    
        });    
    
        describe.skip("List.rfind: Item -> List -> Numb", () => {
    
            it("should return the first index of Item in List", () => {
                expect(List.rfind(20)).to.be.a("function");
                expect(List.rfind(20)([0,10,20,10,20])).to.equal(4);
            });
    
            it("should return -1 if no match is found", () => {
                expect(List.rfind(50)).to.be.a("function");
                expect(List.rfind(50)([0,10,20,10,20])).to.equal(-1);
            });
    
            it("should return throw an error is List is not a list", () => {
                const fn = List.rfind(50);
                expect(fn).to.be.a("function");
                expect(() => fn("abc")).to.throw(TypeError);
            });            
        });
    
        describe.skip("List.join: (sep:Text) -> (list:List of Text) -> Text", () => {
    
            it("should return a string obtaining by concatenating the list item with interposed separator", () => {
                const fn = List.join("-");
                expect(fn).to.be.a("function");
                expect(fn(["a","b","c"])).to.equal("a-b-c");
                expect(fn([])).to.equal("");
            });
    
            it("should throw an erro if the separator is not a string", () => {
                expect(() => List.join(1)).to.throw(TypeError);
            });
    
            it("should throw an error if list is not a List", () => {
                const fn = List.join("-");
                expect(fn).to.be.a("function");
                expect(() => fn("abc")).to.throw(TypeError);
            });
    
            it("should throw an error if any of the list items is not a string", () => {
                const fn = List.join("-");
                expect(fn).to.be.a("function");
                expect(() => fn(["abc", 1, "def"])).to.throw(TypeError);
            });
        });        
    
        describe.skip("List.head: (i:Numb) -> (l:List) -> List", () => {
    
            it("should return the sublist of the first i items of l", () => {
                const fn = List.head(3);
                expect(fn).to.be.a("function");
                expect(fn([1,2,3,4,5,6])).to.deep.equal([1,2,3]);
            });
    
            it("should consider relative inices as relative to the end of the list", () => {
                const fn = List.head(-3);
                expect(fn).to.be.a("function");
                expect(fn([1,2,3,4,5,6,7])).to.deep.equal([1,2,3,4]);
            });
    
            it("should throw an error if i is not a number", () => {
                expect(() => List.head("abc")).to.throw(TypeError);
            });
    
            it("should throw an error if l is not a list", () => {
                const fn = List.head(3);
                expect(fn).to.be.a("function");
                expect(() => fn("abc")).to.throw(TypeError);
            });
        });              
    
        describe.skip("List.tail: (i:Numb) -> (l:List) -> List", () => {
    
            it("should return the sublist of the items of l afther and included the i-th item", () => {
                const fn = List.tail(3);
                expect(fn).to.be.a("function");
                expect(fn([1,2,3,4,5,6,7])).to.deep.equal([4,5,6,7]);
            });
    
            it("should consider relative inices as relative to the end of the list", () => {
                const fn = List.tail(-3);
                expect(fn).to.be.a("function");
                expect(fn([1,2,3,4,5,6,7])).to.deep.equal([5,6,7]);
            });
    
            it("should throw an error if i is not a number", () => {
                expect(() => List.tail("abc")).to.throw(TypeError);
            });
    
            it("should throw an error if l is not a list", () => {
                const fn = List.tail(3);
                expect(fn).to.be.a("function");
                expect(() => fn("abc")).to.throw(TypeError);
            });
        });              
        
        describe.skip("List.map(fn)(items)", () => {
    
            it("should return an array containing the image of the items through fn", async () => {
                const fn = x => 2*x;
                expect(await List.map(fn)([1,2,3])).to.deep.equal([2,4,6]);
            });
    
            it("should throw an error if the passed parameter is not an array", async () => {
                try {
                    await List.map(x=>x)({});
                    throw new Error("It did not throw!");
                } catch (e) {
                    expect(e).to.be.instanceof(TypeError);
                    expect(e.message).to.equal("List type expected");
                }
            });
        });
    });
    
    // describe("Namespace", () => {
    // 
    //     describe("Namespace.size(object)", () => {
    // 
    //         it("should return the number of items in the namespace", () => {
    //             expect(Namespace.size({a:1,b:2,$c:3})).to.equal(2);
    //             expect(Namespace.size({})).to.equal(0);
    //         });
    // 
    //         it("shoudl throw a type error if the passed argument is not a string", () => {
    //             expect(() => Namespace.size([])).to.throw(TypeError);
    //         });
    //     });
    // 
    //     describe("Namespace.map(fn)(object)", () => {
    // 
    //         it("should return an object containing the image through fn of the entries of the passed parameter", async () => {
    //             const fn = x => 2*x;
    //             expect(await Namespace.map(fn)({x:1,y:2,z:3,$w:4})).to.deep.equal({x:2,y:4,z:6});
    //         });
    // 
    //         it("should throw an error if the passed parameter is not an object", async () => {
    //             try {
    //                 await Namespace.map(x=>x)([]);
    //                 throw new Error("It did not throw!");
    //             } catch (e) {
    //                 expect(e).to.be.instanceof(TypeError);
    //                 expect(e.message).to.equal("Namespace type expected");
    //             }
    //         });
    //     });        
    // });
    // 
    // describe("Func", () => {
    // 
    //     describe("Func.pipe(...funcs)", () => {
    // 
    //         it("should return a function that pipes all the passed functions", async () => {
    //             const fn = Func.pipe(x => 2*x, [10,20,30,40,50,60,70,80], x => [x]);
    //             expect(fn).to.be.a("function");
    //             expect(await fn(3)).to.deep.equal([70]);
    //         });
    //     });
    // 
    //     describe("Func.compose(...funcs)", () => {
    // 
    //         it("should return a function that composes all the passed functions", async () => {
    //             const fn = Func.compose(x => [x], [10,20,30,40,50,60,70,80], x => 2*x);
    //             expect(fn).to.be.a("function");
    //             expect(await fn(3)).to.deep.equal([70]);
    //         });
    //     });
    // });
    // 
    // describe("Time", () => {
    // 
    //     describe("time = Time.now()", () => {
    // 
    //         it("should return current date in seconds from epoch", async () => {
    //             expect(Math.round(Time.now(), 1)).to.equal(Math.round(Date.now()/1000, 1));
    //         });
    //     });
    // 
    //     describe("tz = Time.timezone()", () => {
    //         it("should return the UTC local timezone in hours", async () => {
    //             expect(-Time.timezone()*60).to.equal((new Date()).getTimezoneOffset());
    //         });
    //     });    
    // 
    //     describe("date = Time.to_date(time)", () => {
    // 
    //         it("should return a Namespace containing the date components", () => {
    //             const date = Time.to_date(1639513675.900);
    //             expect(date).to.be.an("object");
    //             expect(date.year).to.equal(2021);
    //             expect(date.month).to.equal(12);
    //             expect(date.day).to.equal(14);
    //             expect(date.hours).to.equal(21);
    //             expect(date.minutes).to.equal(27);
    //             expect(date.seconds).to.equal(55.900);
    //         });
    //     });
    // 
    //     describe("time = Time.from_date(date)", () => {
    // 
    //         it("should return the epoch time in second corresponding to a date namespace", () => {
    //             const date = {
    //                 year    : 2021,
    //                 month   : 12,
    //                 day     : 14,
    //                 hours   : 21,
    //                 minutes : 27,
    //                 seconds : 55.900
    //             };
    //             expect(Time.from_date(date)).to.equal(1639513675.900);
    //         });
    //     });
    // 
    //     describe("date = Time.to_UTC_date(time)", () => {
    // 
    //         it("should return a Namespace containing the UTC date components", () => {
    //             const date = {
    //                 year    : 2021,
    //                 month   : 12,
    //                 day     : 14,
    //                 hours   : 21,
    //                 minutes : 27,
    //                 seconds : 55.900
    //             };
    //             const time = Time.from_date(date);
    //             expect(Time.to_UTC_date(time)).to.deep.equal({
    //                 year    : 2021,
    //                 month   : 12,
    //                 day     : 14,
    //                 hours   : 21 - Time.timezone(),
    //                 minutes : 27,
    //                 seconds : 55.900                
    //             });
    //         });
    //     });
    // 
    //     describe("time = Time.from_UTC_date(date)", () => {
    // 
    //         it("should return the epoch time in second corresponding to a UTC date namespace", () => {
    //             const date = {
    //                 year    : 2021,
    //                 month   : 12,
    //                 day     : 14,
    //                 hours   : 21 - Time.timezone(),
    //                 minutes : 27,
    //                 seconds : 55.900
    //             };
    //             expect(Time.from_UTC_date(date)).to.equal(1639513675.900);
    //         });
    // 
    //         describe("time = Time.from_string(dstr)", () => {
    // 
    //             it("should convert the date string representation to the number of seconds from epoch", () => {
    //                 var d = new Date(1977,1,26,1,50,23,560);
    //                 var dstr = d.toISOString();
    //                 expect(Time.from_string(dstr)).to.equal(Number(d)/1000);
    //             });
    //         });
    // 
    //         describe("dstr = Time.to_ISO_string(time)", () => {
    // 
    //             it("should return the ISO representation of the given date", () => {
    //                 const time = Time.from_UTC_date({
    //                     year    : 2021,
    //                     month   : 12,
    //                     day     : 14,
    //                     hours   : 20,
    //                     minutes : 27,
    //                     seconds : 55.900
    //                 });
    //                 expect(Time.to_ISO_string(time)).to.equal("2021-12-14T20:27:55.900Z");
    //             });
    //         });
    // 
    //         describe("wday = Time.week_day(time)", () => {
    // 
    //             it("should return the day of the week corresponding to a given epoch time in seconds", () => {
    //                 const time = Time.from_UTC_date({
    //                     year    : 2021,
    //                     month   : 12,
    //                     day     : 14,
    //                     hours   : 20,
    //                     minutes : 27,
    //                     seconds : 55.900
    //                 });
    //                 expect(Time.week_day(time)).to.equal(2);
    //             });
    //         });
    // 
    //         describe("wnum = Time.week_number(time)", () => {
    // 
    //             it("should return the week of the year corresponding to a given epoch time in seconds", () => {
    //                 const time = Time.from_UTC_date({
    //                     year    : 2021,
    //                     month   : 12,
    //                     day     : 14,
    //                     hours   : 20,
    //                     minutes : 27,
    //                     seconds : 55.900
    //                 });
    //                 expect(Time.week_number(time)).to.equal(50);
    //             });
    //         });
    //     });
    // });
    // 
    // describe("Tuple", () => {
    // 
    //     describe("Tuple.from(value)", () => {
    // 
    //         it("should return the tuple of characters of value if it is a string", () => {
    // 
    //             expect(Tuple.from("abc")).to.be.instanceof(types.Tuple);
    //             expect(Array.from(Tuple.from("abc"))).to.be.deep.equal(['a','b','c']);
    // 
    //             expect(Tuple.from("a")).to.equal('a');
    //         });
    // 
    //         it("should return the tuple of items of value if it is an array", () => {
    // 
    //             expect(Tuple.from([1,2,3])).to.be.instanceof(types.Tuple);
    //             expect(Array.from(Tuple.from([1,2,3]))).to.be.deep.equal([1,2,3]);
    // 
    //             expect(Tuple.from([1])).to.equal(1);                
    //         });
    // 
    //         it("should return the tuple of keys of value if it is an object", () => {
    // 
    //             expect(Tuple.from({yy:20,xx:10,$z:30})).to.be.instanceof(types.Tuple);
    //             expect(Array.from(Tuple.from({yy:20,xx:10,$z:30}))).to.be.deep.equal(['xx','yy']);
    // 
    //             expect(Tuple.from({x:10, $y:10})).to.equal('x');
    //         });
    // 
    //         it("should return the null for all the other types", () => {
    //             expect(Tuple.from(null                 )).to.be.null;
    //             expect(Tuple.from(true                 )).to.be.null;
    //             expect(Tuple.from(false                )).to.be.null;
    //             expect(Tuple.from(10                   )).to.be.null;
    //             expect(Tuple.from(x=>x                 )).to.be.null;
    //             expect(Tuple.from(new types.Undefined())).to.be.null;
    //         });
    //     });
    // 
    //     describe("Tuple.map(fn)(...values)", () => {
    // 
    //         it("should return a tuple containing the image through fn of the passed items", async () => {
    //             const fn = x => 2*x;
    // 
    //             const tuple = await Tuple.map(fn)(1,2,3);
    //             expect(tuple).to.be.instanceof(types.Tuple);
    //             expect(Array.from(tuple)).to.deep.equal([2,4,6]);
    // 
    //             expect(await Tuple.map(fn)(4)).to.equal(8);
    //         });
    //     });
    // });
    // 
    // describe("Undefined", () => {
    // 
    //     describe("Undefined.create(type, ...args)", () => {
    // 
    //         it("should return a types.Undefined object", () => {
    //             const undef = Undefined.create("TestCase", 1, 2, 3);
    //             expect(undef).to.be.instanceof(types.Undefined);
    //             expect(undef.type).to.equal("TestCase");
    //             expect(undef.args).to.deep.equal([1,2,3]);
    //         });
    //     });
    // 
    //     describe("Undefined.type(undef)", () => {
    // 
    //         it("should return the type of the undefined argument", () => {
    //             const undef = Undefined.create("TestCase", 1, 2, 3);
    //             expect(Undefined.type(undef)).to.equal("TestCase");
    //         });
    // 
    //         it("should throw an error if the passed parameter is not Undefined", async () => {
    //             try {
    //                 Undefined.type([]);
    //                 throw new Error("It did not throw!");
    //             } catch (e) {
    //                 expect(e).to.be.instanceof(TypeError);
    //                 expect(e.message).to.equal("Undefined type expected");
    //             }
    //         });
    //     });
    // 
    //     describe("Undefined.args(undef)", () => {
    // 
    //         it("should return the args of the undefined argument", () => {
    //             const undef = Undefined.create("TestCase", 1, 2, 3);
    //             expect(Undefined.args(undef)).to.deep.equal([1,2,3]);
    //         });
    // 
    //         it("should throw an error if the passed parameter is not Undefined", async () => {
    //             try {
    //                 Undefined.args([]);
    //                 throw new Error("It did not throw!");
    //             } catch (e) {
    //                 expect(e).to.be.instanceof(TypeError);
    //                 expect(e.message).to.equal("Undefined type expected");
    //             }
    //         });
    //     });
    // });
});













