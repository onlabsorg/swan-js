const {expect} = require("chai");
const types = require("../lib/types");
const {Bool, Numb, Text, List, Namespace, Func, Time, Tuple, Undefined} = require("../lib/builtins");


describe("builtins", () => {
    
    describe("Bool", () => {
        
        describe("Bool.from(value)", () => {
            
            it("should convert the passed value to boolean", () => {
                
                expect(Bool.from()).to.be.false;
                expect(Bool.from(null)).to.be.false;

                expect(Bool.from(true)).to.be.true;
                expect(Bool.from(false)).to.be.false;

                expect(Bool.from(10)).to.be.true;
                expect(Bool.from(0)).to.be.false;

                expect(Bool.from("abc")).to.be.true;
                expect(Bool.from("")).to.be.false;

                expect(Bool.from([1,2,3])).to.be.true;
                expect(Bool.from([])).to.be.false;

                expect(Bool.from({a:1})).to.be.true;
                expect(Bool.from({})).to.be.false;

                expect(Bool.from(x => 2*x)).to.be.true;
                expect(Bool.from(new types.Undefined())).to.be.false;
            });
        });
        
        describe("Bool.not(value)", () => {
            
            it("should return the boolean not of the given value", () => {
                expect(Bool.not(true)).to.be.false;
                expect(Bool.not(false)).to.be.true;
            });
            
            it("should throw an error if value is not boolean", () => {
                try {
                    Bool.not("abc");
                    throw new Error("Id did not throw!");
                } catch (e) {
                    expect(e).to.be.instanceof(TypeError);
                    expect(e.message).to.equal("Bool type expected");
                }
            });
        });
        
        describe("Bool.TRUE", () => {
            
            it("should be true", () => {
                expect(Bool.TRUE).to.be.true;
            });
        });
        
        describe("Bool.FALSE", () => {
            
            it("should be false", () => {
                expect(Bool.FALSE).to.be.false;
            });
        });
    });

    describe("Numb", () => {
        
        // MATH FUNCTIONS
        
        describe("Numb.E", () => {
            it("should return the Euler's number", async () => {
                expect(Numb.E).to.equal(Math.E);
            });
        });

        describe("Numb.PI", () => {
            it("should return the Pi number", async () => {
                expect(Numb.PI).to.equal(Math.PI);
            });
        });

        describe("Numb.abs(x)", () => {
            it("should return the absolute value of a number", async () => {
                expect(await Numb.abs(-123.45)).to.equal(123.45);
                expect(await Numb.abs(0)).to.equal(0);
                expect(await Numb.abs(123.45)).to.equal(123.45);
            });
        });

        describe("Numb.acos(x)", () => {
            it("should return the arc-cosine of a number", async () => {
                expect(await Numb.acos(0.5)).to.equal(Math.acos(0.5));
            });
        });

        describe("Numb.acosh(x)", () => {
            it("should return the arc-hyperbolic-cosine of a number", async () => {
                expect(await Numb.acosh(2)).to.equal(Math.acosh(2));
            });
        });

        describe("Numb.asin(x)", () => {
            it("should return the arc-sine of a number", async () => {
                expect(await Numb.asin(0.5)).to.equal(Math.asin(0.5));
            });
        });

        describe("Numb.asinh(x)", () => {
            it("should return the arc-hyperbolic-sine of a number", async () => {
                expect(await Numb.asinh(2)).to.equal(Math.asinh(2));
            });
        });

        describe("Numb.atan(x)", () => {
            it("should return the arc-tangent of a number", async () => {
                expect(await Numb.atan(0.5)).to.equal(Math.atan(0.5));
            });
        });

        describe("Numb.atanh(x)", () => {
            it("should return the arc-hyperbolic-tangent of a number", async () => {
                expect(await Numb.atanh(0.5)).to.equal(Math.atanh(0.5));
            });
        });

        describe("Numb.ceil(x)", () => {
            it("should round up a number to the closest largest integer", async () => {
                expect(Numb.ceil(12.345)).to.equal(13);
                expect(Numb.ceil(-12.345)).to.equal(-12);
            });
        });

        describe("Numb.cos(x)", () => {
            it("should return the cosine of a number", async () => {
                expect(Numb.cos(0.5)).to.equal(Math.cos(0.5));
            });
        });

        describe("Numb.cosh(x)", () => {
            it("should return the hyperbolic cosine of a number", async () => {
                expect(Numb.cosh(0.5)).to.equal(Math.cosh(0.5));
            });
        });

        describe("Numb.exp(x)", () => {
            it("should return the exponential of x", async () => {
                expect(Numb.exp(0.5)).to.equal(Math.exp(0.5));
            });
        });

        describe("Numb.floor(x)", () => {
            it("should round up a number to the closest smallest integer", async () => {
                expect(Numb.floor(12.345)).to.equal(12);
                expect(Numb.floor(-12.345)).to.equal(-13);
            });
        });

        describe("Numb.log(x)", () => {
            it("should return the natural logaritm of a number", async () => {
                expect(await Numb.log(2)).to.equal(Math.log(2));
                expect(await Numb.log(Math.E**2)).to.equal(2);
            });
        });

        describe("Numb.log10(x)", () => {
            it("should return the logaritm with base 10 of a number", async () => {
                expect(await Numb.log10(2)).to.equal(Math.log10(2));
                expect(await Numb.log10(100)).to.equal(2);
            });
        });

        describe("Numb.max(x1, x2, x3, ...)", () => {
            it("should return the maximum of a list of numbers", async () => {
                expect(await Numb.max(23,1,13,56,22,-108)).to.equal(56);
            });
        });

        describe("Numb.min(x1, x2, x3, ...)", () => {
            it("should return the minimum of a list of numbers", async () => {
                expect(await Numb.min(23,1,13,56,22,-108)).to.equal(-108);
            });
        });
        
        describe("Numb.mod(y)(x)", () => {
            it("shoudl return x mod y", () => {
                expect(Numb.mod(3)(11)).to.equal(2);
            });
        });

        describe("Numb.random(x)", () => {
            it("should return a random number between 0 and x", async () => {

                var y1 = await Numb.random(2);
                expect(0 <= y1 && y1 <= 2).to.be.true;

                var y2 = await Numb.random(2);
                var y3 = await Numb.random(2);

                expect(y1).to.not.equal(y2);
                expect(y1).to.not.equal(y3);
                expect(y2).to.not.equal(y3);
            });
        });

        describe("Numb.round(x)", () => {
            it("should round the given number to the closest integer", async () => {

                expect(await Numb.round(12.345)).to.equal(12);
                expect(await Numb.round(6.789)).to.equal(7);
                expect(await Numb.round(10.5)).to.equal(11);

                expect(await Numb.round(-12.345)).to.equal(-12);
                expect(await Numb.round(-6.789)).to.equal(-7);
                expect(await Numb.round(-10.5)).to.equal(-10);
            });
        });

        describe("Numb.sin(x)", () => {
            it("should return the sine of a number", async () => {
                expect(Numb.sin(0.5)).to.equal(Math.sin(0.5));
            });
        });

        describe("Numb.sinh(x)", () => {
            it("should return the hyperbolic sine of a number", async () => {
                expect(Numb.sinh(0.5)).to.equal(Math.sinh(0.5));
            });
        });

        describe("Numb.sqrt(x)", () => {
            it("should return the square root of a number", async () => {
                expect(await Numb.sqrt(4)).to.equal(2);
                expect(await Numb.sqrt(34.5)).to.equal(34.5**0.5);
            });
        });

        describe("Numb.tan(x)", () => {
            it("should return the tangent of a number", async () => {
                expect(Numb.tan(0.5)).to.equal(Math.tan(0.5));
            });
        });

        describe("Numb.tanh(x)", () => {
            it("should return the hyperbolic tangent of a number", async () => {
                expect(Numb.tanh(0.5)).to.equal(Math.tanh(0.5));
            });
        });

        describe("Numb.trunc(x)", () => {
            it("should return the integer part of a number", async () => {

                expect(await Numb.trunc(12.345)).to.equal(12);
                expect(await Numb.trunc(6.789)).to.equal(6);
                expect(await Numb.trunc(10.5)).to.equal(10);

                expect(await Numb.trunc(-12.345)).to.equal(-12);
                expect(await Numb.trunc(-6.789)).to.equal(-6);
                expect(await Numb.trunc(-10.5)).to.equal(-10);
            });
        });

        describe("Numb.hex(s)", () => {
            it("should return a number given his hexadecimal string representation", async () => {
                expect(await Numb.hex('FF')).to.equal(255);
            });
        });

        describe("Numb.oct(s)", () => {
            it("should return a number given his octal string representation", async () => {
                expect(await Numb.oct('77')).to.equal(63);
            });
        });

        describe("Numb.bin(s)", () => {
            it("should return a number given his binary string representation", async () => {
                expect(await Numb.bin('11')).to.equal(3);
            });
        });
    });

    describe("Text", () => {
        
        describe("Text.from(...values)", () => {
            
            it("should return a tuple of stringified values", async () => {                
                expect(await Text.from()).to.equal("");
                expect(await Text.from(true)).to.equal("TRUE");
                expect(await Text.from(false)).to.equal("FALSE");
                expect(await Text.from(123)).to.equal("123");
                expect(await Text.from("abc")).to.equal("abc");
                expect(await Text.from([1,2,3])).to.equal("[[List of 3 items]]");
                expect(await Text.from({a:10, b:20})).to.equal("{a, b}");
                expect(await Text.from(new types.Undefined("Foo"))).to.equal("[[Undefined Foo]]");
                expect(await Text.from(123, 'abc')).to.equal(`123abc`);
            });
            
            it("shoudl return value.__text__ if it exists and it is not a function", async () => {
                expect(await Text.from({__text__: 10})).to.equal("10");
            });

            it("shoudl return value.__text__(value) if it exists and it is a function", async () => {
                expect(await Text.from({__text__: ns => ns.s, s:20})).to.equal("20");
            });
        });
        
        describe("Text.size(string)", () => {
            
            it("should return the string length", () => {
                expect(Text.size("abc")).to.equal(3);
                expect(Text.size("")).to.equal(0);
            });
            
            it("shoudl throw a type error if the passed argument is not a string", () => {
                expect(() => Text.size({})).to.throw(TypeError);
            });
        });
        
        describe("Text.from_char_codes(...charCodes)", () => {

            it("should return the string made of the given UTF char codes", async () => {
                expect(await Text.from_char_codes(65, 98, 99)).to.equal("Abc");
            });
        });        
        
        describe("Text.to_char_codes (str)", () => {
            
            it("should return an iterator yielding the char codes of the given string", async () => {
                const iter = Text.to_char_codes ("Abc");
                expect(iter[Symbol.iterator]).to.be.a("function");
                expect(Array.from(iter)).to.deep.equal([65, 98, 99]);
            });
            
            it("shoudl throw an error if str is not a string", () => {
                expect(() => Text.to_char_codes (10)).to.throw(TypeError);
            });
        });

        describe("Text.find(subStr)(str)", () => {
            
            it("should return a function", () => {
                expect(Text.find("Abc")).to.be.a("function");
            });
            
            it("should throw an error if the sub-string is not a string", () => {
                expect(() => Text.find(1)).to.throw(TypeError);
            });
            
            describe("fn = Text.find(subStr)", () => {
                
                it("should return the first index of subStr in str", async () => {
                    expect(await Text.find("Abc")("__Abc__def__Abc")).to.equal(2);
                });

                it("should return -1 if no match is found", async () => {
                    expect(await Text.find("xxx")("__Abc__def__Abc")).to.equal(-1);
                });

                it("should throw an error if the passed string is not a string", () => {
                    const fn = Text.find("abc");
                    expect(() => fn(1)).to.throw(TypeError);
                });
            });
        });    
        
        describe("Text.rfind(subStr)(str)", () => {
            
            it("should return a function", () => {
                expect(Text.rfind("Abc")).to.be.a("function");
            });
            
            it("should throw an error if the sub-string is not a string", () => {
                expect(() => Text.rfind(1)).to.throw(TypeError);
            });
            
            describe("fn = Text.rfind(subStr)", () => {
                
                it("should return the last index of subStr in str", async () => {
                    expect(await Text.rfind("Abc")("__Abc__def__Abc")).to.equal(12);
                });

                it("should return -1 if no match is found", async () => {
                    expect(await Text.rfind("xxx")("__Abc__def__Abc")).to.equal(-1);
                });

                it("should throw an error if the passed string is not a string", () => {
                    const fn = Text.rfind("abc");
                    expect(() => fn(1)).to.throw(TypeError);
                });
            });
        });    
        
        describe("Text.lower(str)", () => {

            it("should return the given string converted to lower case characters", async () => {
                expect(await Text.lower("AbcDef")).to.equal("abcdef");
            });
        });    
        
        describe("Text.upper(str)", () => {

            it("should return the given string converted to upper case characters", async () => {
                expect(await Text.upper("AbcDef")).to.equal("ABCDEF");
            });
        });   
        
        describe("Text.trim_head(str)", () => {
            it("should remove the leading spaces", async () => {
                expect(await Text.trim_head("   abc   ")).to.equal("abc   ");
            });
        });

        describe("Text.trim_tail(str)", () => {
            it("should remove the trailing spaces", async () => {
                expect(await Text.trim_tail("   abc   ")).to.equal("   abc");
            });
        });

        describe("Text.trim(str)", () => {
            it("should remove both leading and trailing spaces", async () => {
                expect(await Text.trim("   abc   ")).to.equal("abc");
            });
        });   
        
        describe("Text.head(index)(str)", () => {

            it("should return a function", () => {
                expect(Text.head(3)).to.be.a("function");
            });
            
            it("should throw an error if the index is not a number", () => {
                expect(() => Text.head('abc')).to.throw(TypeError);
            });
            
            describe("fn = Text.head(index)", () => {
                
                it("should return the first `index` characters of the passed string", async () => {
                    expect(Text.head(3)("Abcdefghi")).to.equal("Abc");
                });

                it("should interpret negative indices as relative to the end of the string", async () => {
                    expect(Text.head(-5)("Abcdefghi")).to.equal("Abcd");
                });

                it("should throw an error if the passed string is not a string", () => {
                    const fn = Text.head(3);
                    expect(() => fn(1)).to.throw(TypeError);
                });
            });
        });              

        describe("Text.tail(index)(str)", () => {

            it("should return a function", () => {
                expect(Text.tail(3)).to.be.a("function");
            });
            
            it("should throw an error if the index is not a number", () => {
                expect(() => Text.tail('abc')).to.throw(TypeError);
            });
            
            describe("fn = Text.tail(index)", () => {
                
                it("should return the substring made of all the character after `index`", async () => {
                    expect(Text.tail(3)("Abcdefghi")).to.equal("defghi");
                });

                it("should interpret negative indices as relative to the end of the string", async () => {
                    expect(Text.tail(-5)("Abcdefghi")).to.equal("efghi");
                });

                it("should throw an error if the passed string is not a string", () => {
                    const fn = Text.tail(3);
                    expect(() => fn(1)).to.throw(TypeError);
                });
            });
        });              

        describe("Text.split(divider)(str)", () => {

            it("should return a function", () => {
                expect(Text.split(",")).to.be.a("function");
            });
            
            it("should throw an error if the sub-string is not a string", () => {
                expect(() => Text.split(1)).to.throw(TypeError);
            });
            
            describe("fn = Text.split(divider)", () => {
                
                it("should return an iterator yielding the `str` substrings between the `divider`", async () => {
                    const iter = await Text.split(",")("Abc,def,hij");
                    expect(iter[Symbol.iterator]).to.be.a("function");
                    expect(Array.from(iter)).to.deep.equal(["Abc", "def", "hij"]);
                });

                it("should throw an error if the passed string is not a string", () => {
                    const fn = Text.split("abc");
                    expect(() => fn(1)).to.throw(TypeError);
                });
            });
        });              
    });

    describe("List", () => {
        
        describe("List.size(array)", () => {
            
            it("should return the array length", () => {
                expect(List.size([1,2,3])).to.equal(3);
                expect(List.size([])).to.equal(0);
            });
            
            it("shoudl throw a type error if the passed argument is not a string", () => {
                expect(() => List.size({})).to.throw(TypeError);
            });
        });
        
        describe("List.map(fn)(items)", () => {
            
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
        
        describe("List.find: Item -> List -> Numb", () => {

            it("should return the first index of Item in List", () => {
                expect(List.find(20)).to.be.a("function");
                expect(List.find(20)([0,10,20,10,20])).to.equal(2);
            });

            it("should return -1 if no match is found", () => {
                expect(List.find(50)).to.be.a("function");
                expect(List.find(50)([0,10,20,10,20])).to.equal(-1);
            });
            
            it("should return throw an error is List is not a list", () => {
                const fn = List.find(50);
                expect(fn).to.be.a("function");
                expect(() => fn("abc")).to.throw(TypeError);
            });            
        });

        describe("List.rfind: Item -> List -> Numb", () => {

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

        describe("List.join: (sep:Text) -> (list:List of Text) -> Text", () => {

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

        describe("List.reverse: List -> List", () => {

            it("should return a copy of the passed list, in reversed order", async () => {
                var l1 = [1,2,3,4,5];
                var l2 = List.reverse(l1);
                expect(l1).to.not.equal(l2);
                expect(l2).to.deep.equal([5,4,3,2,1]);
            });

            it("should throw an error if the passed item is not a List", () => {
                expect(() => List.reverse("abc")).to.throw(TypeError);
            });
        });

        describe("List.head: (i:Numb) -> (l:List) -> List", () => {

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

        describe("List.tail: (i:Numb) -> (l:List) -> List", () => {

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
    });

    describe("Namespace", () => {
        
        describe("Namespace.size(object)", () => {
            
            it("should return the number of items in the namespace", () => {
                expect(Namespace.size({a:1,b:2,$c:3})).to.equal(2);
                expect(Namespace.size({})).to.equal(0);
            });
            
            it("shoudl throw a type error if the passed argument is not a string", () => {
                expect(() => Namespace.size([])).to.throw(TypeError);
            });
        });
        
        describe("Namespace.map(fn)(object)", () => {
            
            it("should return an object containing the image through fn of the entries of the passed parameter", async () => {
                const fn = x => 2*x;
                expect(await Namespace.map(fn)({x:1,y:2,z:3,$w:4})).to.deep.equal({x:2,y:4,z:6});
            });
            
            it("should throw an error if the passed parameter is not an object", async () => {
                try {
                    await Namespace.map(x=>x)([]);
                    throw new Error("It did not throw!");
                } catch (e) {
                    expect(e).to.be.instanceof(TypeError);
                    expect(e.message).to.equal("Namespace type expected");
                }
            });
        });        
    });
    
    describe("Func", () => {
        
        describe("Func.pipe(...funcs)", () => {
            
            it("should return a function that pipes all the passed functions", async () => {
                const fn = Func.pipe(x => 2*x, [10,20,30,40,50,60,70,80], x => [x]);
                expect(fn).to.be.a("function");
                expect(await fn(3)).to.deep.equal([70]);
            });
        });

        describe("Func.compose(...funcs)", () => {
            
            it("should return a function that composes all the passed functions", async () => {
                const fn = Func.compose(x => [x], [10,20,30,40,50,60,70,80], x => 2*x);
                expect(fn).to.be.a("function");
                expect(await fn(3)).to.deep.equal([70]);
            });
        });
    });
        
    describe("Time", () => {
        
        describe("time = Time.now()", () => {
            
            it("should return current date in seconds from epoch", async () => {
                expect(Math.round(Time.now(), 1)).to.equal(Math.round(Date.now()/1000, 1));
            });
        });

        describe("tz = Time.timezone()", () => {
            it("should return the UTC local timezone in hours", async () => {
                expect(-Time.timezone()*60).to.equal((new Date()).getTimezoneOffset());
            });
        });    
        
        describe("date = Time.to_date(time)", () => {
            
            it("should return a Namespace containing the date components", () => {
                const date = Time.to_date(1639513675.900);
                expect(date).to.be.an("object");
                expect(date.year).to.equal(2021);
                expect(date.month).to.equal(12);
                expect(date.day).to.equal(14);
                expect(date.hours).to.equal(21);
                expect(date.minutes).to.equal(27);
                expect(date.seconds).to.equal(55.900);
            });
        });

        describe("time = Time.from_date(date)", () => {
            
            it("should return the epoch time in second corresponding to a date namespace", () => {
                const date = {
                    year    : 2021,
                    month   : 12,
                    day     : 14,
                    hours   : 21,
                    minutes : 27,
                    seconds : 55.900
                };
                expect(Time.from_date(date)).to.equal(1639513675.900);
            });
        });

        describe("date = Time.to_UTC_date(time)", () => {
            
            it("should return a Namespace containing the UTC date components", () => {
                const date = {
                    year    : 2021,
                    month   : 12,
                    day     : 14,
                    hours   : 21,
                    minutes : 27,
                    seconds : 55.900
                };
                const time = Time.from_date(date);
                expect(Time.to_UTC_date(time)).to.deep.equal({
                    year    : 2021,
                    month   : 12,
                    day     : 14,
                    hours   : 21 - Time.timezone(),
                    minutes : 27,
                    seconds : 55.900                
                });
            });
        });

        describe("time = Time.from_UTC_date(date)", () => {
            
            it("should return the epoch time in second corresponding to a UTC date namespace", () => {
                const date = {
                    year    : 2021,
                    month   : 12,
                    day     : 14,
                    hours   : 21 - Time.timezone(),
                    minutes : 27,
                    seconds : 55.900
                };
                expect(Time.from_UTC_date(date)).to.equal(1639513675.900);
            });

            describe("time = Time.from_string(dstr)", () => {
                
                it("should convert the date string representation to the number of seconds from epoch", () => {
                    var d = new Date(1977,1,26,1,50,23,560);
                    var dstr = d.toISOString();
                    expect(Time.from_string(dstr)).to.equal(Number(d)/1000);
                });
            });

            describe("dstr = Time.to_ISO_string(time)", () => {
                
                it("should return the ISO representation of the given date", () => {
                    const time = Time.from_UTC_date({
                        year    : 2021,
                        month   : 12,
                        day     : 14,
                        hours   : 20,
                        minutes : 27,
                        seconds : 55.900
                    });
                    expect(Time.to_ISO_string(time)).to.equal("2021-12-14T20:27:55.900Z");
                });
            });

            describe("wday = Time.week_day(time)", () => {
                
                it("should return the day of the week corresponding to a given epoch time in seconds", () => {
                    const time = Time.from_UTC_date({
                        year    : 2021,
                        month   : 12,
                        day     : 14,
                        hours   : 20,
                        minutes : 27,
                        seconds : 55.900
                    });
                    expect(Time.week_day(time)).to.equal(2);
                });
            });

            describe("wnum = Time.week_number(time)", () => {
                
                it("should return the week of the year corresponding to a given epoch time in seconds", () => {
                    const time = Time.from_UTC_date({
                        year    : 2021,
                        month   : 12,
                        day     : 14,
                        hours   : 20,
                        minutes : 27,
                        seconds : 55.900
                    });
                    expect(Time.week_number(time)).to.equal(50);
                });
            });
        });
    });
    
    describe("Tuple", () => {
        
        describe("Tuple.from(value)", () => {
            
            it("should return the tuple of characters of value if it is a string", () => {
                
                expect(Tuple.from("abc")).to.be.instanceof(types.Tuple);
                expect(Array.from(Tuple.from("abc"))).to.be.deep.equal(['a','b','c']);

                expect(Tuple.from("a")).to.equal('a');
            });
            
            it("should return the tuple of items of value if it is an array", () => {
                
                expect(Tuple.from([1,2,3])).to.be.instanceof(types.Tuple);
                expect(Array.from(Tuple.from([1,2,3]))).to.be.deep.equal([1,2,3]);

                expect(Tuple.from([1])).to.equal(1);                
            });
            
            it("should return the tuple of keys of value if it is an object", () => {
                
                expect(Tuple.from({yy:20,xx:10,$z:30})).to.be.instanceof(types.Tuple);
                expect(Array.from(Tuple.from({yy:20,xx:10,$z:30}))).to.be.deep.equal(['xx','yy']);

                expect(Tuple.from({x:10, $y:10})).to.equal('x');
            });
            
            it("should return the null for all the other types", () => {
                expect(Tuple.from(null                 )).to.be.null;
                expect(Tuple.from(true                 )).to.be.null;
                expect(Tuple.from(false                )).to.be.null;
                expect(Tuple.from(10                   )).to.be.null;
                expect(Tuple.from(x=>x                 )).to.be.null;
                expect(Tuple.from(new types.Undefined())).to.be.null;
            });
        });
        
        describe("Tuple.map(fn)(...values)", () => {
            
            it("should return a tuple containing the image through fn of the passed items", async () => {
                const fn = x => 2*x;
                
                const tuple = await Tuple.map(fn)(1,2,3);
                expect(tuple).to.be.instanceof(types.Tuple);
                expect(Array.from(tuple)).to.deep.equal([2,4,6]);
                
                expect(await Tuple.map(fn)(4)).to.equal(8);
            });
        });
    });
    
    describe("Undefined", () => {
        
        describe("Undefined.create(type, ...args)", () => {
            
            it("should return a types.Undefined object", () => {
                const undef = Undefined.create("TestCase", 1, 2, 3);
                expect(undef).to.be.instanceof(types.Undefined);
                expect(undef.type).to.equal("TestCase");
                expect(undef.args).to.deep.equal([1,2,3]);
            });
        });

        describe("Undefined.type(undef)", () => {
            
            it("should return the type of the undefined argument", () => {
                const undef = Undefined.create("TestCase", 1, 2, 3);
                expect(Undefined.type(undef)).to.equal("TestCase");
            });
            
            it("should throw an error if the passed parameter is not Undefined", async () => {
                try {
                    Undefined.type([]);
                    throw new Error("It did not throw!");
                } catch (e) {
                    expect(e).to.be.instanceof(TypeError);
                    expect(e.message).to.equal("Undefined type expected");
                }
            });
        });

        describe("Undefined.args(undef)", () => {
            
            it("should return the args of the undefined argument", () => {
                const undef = Undefined.create("TestCase", 1, 2, 3);
                expect(Undefined.args(undef)).to.deep.equal([1,2,3]);
            });
            
            it("should throw an error if the passed parameter is not Undefined", async () => {
                try {
                    Undefined.args([]);
                    throw new Error("It did not throw!");
                } catch (e) {
                    expect(e).to.be.instanceof(TypeError);
                    expect(e.message).to.equal("Undefined type expected");
                }
            });
        });
    });
});


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
