const expect = require("./expect");

const types = require("../lib/types");

const parse = require("../lib/interpreter");
const evaluate = (expression, presets={}) => parse(expression)(Object.assign(Object.create(builtins), presets));

const {Bool, Numb, Text, List, Namespace, Func, Time, Tuple, Undefined} = builtins = require("../lib/builtins");



describe("builtins", () => {
    
    describe("Bool", () => {
        
        describe("Bool.TRUE", () => {
            
            it("should be true", async () => {
                expect(await evaluate("Bool.TRUE")).to.be.Bool(true);
            });
        });
        
        describe("Bool.FALSE", () => {
            
            it("should be true", async () => {
                expect(await evaluate("Bool.FALSE")).to.be.Bool(false);
            });
        });

        describe("Bool.from - function", () => {
            
            it("should return FALSE if the argument is a falsy term", async () => {
                expect(await evaluate("Bool.from ()       ")).to.be.Bool(false);
                expect(await evaluate("Bool.from (1 == 2) ")).to.be.Bool(false);
                expect(await evaluate("Bool.from 0        ")).to.be.Bool(false);
                expect(await evaluate("Bool.from ''       ")).to.be.Bool(false);
                expect(await evaluate("Bool.from []       ")).to.be.Bool(false);
                expect(await evaluate("Bool.from {}       ")).to.be.Bool(false);
                expect(await evaluate("Bool.from ('a'/'b')")).to.be.Bool(false);
                expect(await evaluate("Bool.from (0,'',[])")).to.be.Bool(false);
            });

            it("should return TRUE if the argument is a truty term", async () => {
                expect(await evaluate("Bool.from (x->x)   ")).to.be.Bool(true);
                expect(await evaluate("Bool.from (1 == 1) ")).to.be.Bool(true);
                expect(await evaluate("Bool.from 10       ")).to.be.Bool(true);
                expect(await evaluate("Bool.from 'abc'    ")).to.be.Bool(true);
                expect(await evaluate("Bool.from [1,2,3]  ")).to.be.Bool(true);
                expect(await evaluate("Bool.from {a:1}    ")).to.be.Bool(true);
                expect(await evaluate("Bool.from (1,'',[])")).to.be.Bool(true);
            });
        });
        
        describe("Bool.not - function", () => {
            
            it("should return TRUE if the argument is a falsy term", async () => {
                expect(await evaluate("Bool.not ()       ")).to.be.Bool(true);
                expect(await evaluate("Bool.not (1 == 2) ")).to.be.Bool(true);
                expect(await evaluate("Bool.not 0        ")).to.be.Bool(true);
                expect(await evaluate("Bool.not ''       ")).to.be.Bool(true);
                expect(await evaluate("Bool.not []       ")).to.be.Bool(true);
                expect(await evaluate("Bool.not {}       ")).to.be.Bool(true);
                expect(await evaluate("Bool.not ('a'/'b')")).to.be.Bool(true);
                expect(await evaluate("Bool.not (0,'',[])")).to.be.Bool(true);
            });

            it("should return FALSE if the argument is a truty term", async () => {
                expect(await evaluate("Bool.not (x->x)   ")).to.be.Bool(false);
                expect(await evaluate("Bool.not (1 == 1) ")).to.be.Bool(false);
                expect(await evaluate("Bool.not 10       ")).to.be.Bool(false);
                expect(await evaluate("Bool.not 'abc'    ")).to.be.Bool(false);
                expect(await evaluate("Bool.not [1,2,3]  ")).to.be.Bool(false);
                expect(await evaluate("Bool.not {a:1}    ")).to.be.Bool(false);
                expect(await evaluate("Bool.not (1,'',[])")).to.be.Bool(false);
            });
        });        
    });

    describe("Numb", () => {
    
        describe("Numb.INFINITY - constant", () => {
            it("should return Infinity wrapped as a Numb", async () => {
                expect(await evaluate("Numb.INFINITY")).to.be.Numb(Infinity);
            });
        });

        describe("Numb.E - contant", () => {
            it("should return the Euler's number", async () => {
                expect(await evaluate("Numb.E")).to.be.Numb(Math.E);
            });
        });
    
        describe("Numb.PI - constant", () => {
            it("should return the Pi number", async () => {
                expect(await evaluate("Numb.PI")).to.be.Numb(Math.PI);
            });
        });
        
        describe("Numb.from - function", () => {
            
            it("should convert a string representation of a number to a number", async () => {
                expect(await evaluate("Numb.from '12'")).to.be.Numb(12);
                expect(await evaluate("Numb.from '-12e1'")).to.be.Numb(-120);
                expect(await evaluate("Numb.from '0b11'")).to.be.Numb(3);
                expect(await evaluate("Numb.from '0o33'")).to.be.Numb(27);
                expect(await evaluate("Numb.from '0xA2'")).to.be.Numb(162);
            });
            
            it("should return Undefined Number if the argument is not a valid string", async () => {
                expect(await evaluate("Numb.from 'abc'")).to.be.Undefined("Number");
                expect(await evaluate("Numb.from 10")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Numb.from('10', '0b11', '0o33')")).to.be.Tuple([10,3,27]);
            });            
        });
    
        describe("Numb.abs - function", () => {
            
            it("should return the arc-sine of a number", async () => {
                expect(await evaluate("Numb.abs(-123.45)")).to.be.Numb(123.45);
                expect(await evaluate("Numb.abs 0")).to.be.Numb(0);
                expect(await evaluate("Numb.abs 123.45")).to.be.Numb(123.45);
            });
            
            it("should return Undefined Number if the argument is not a number", async () => {
                expect(await evaluate("Numb.abs 'abc'")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Numb.abs(-1, 0, 1)")).to.be.Tuple([1,0,1]);
            });            
        });
    
        describe("Numb.acos - function", () => {

            it("should return the arc-cosine of a number", async () => {
                expect(await evaluate("Numb.acos 0.5")).to.be.Numb(Math.acos(0.5));
            });
            
            it("should return Undefined Number if the argument is not a number", async () => {
                expect(await evaluate("Numb.acos 'abc'")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Numb.acos(0, 0.5, 1)")).to.be.Tuple([Math.acos(0), Math.acos(0.5), Math.acos(1)]);
            });            
        });
    
        describe("Numb.acosh - function", () => {
            
            it("should return the hyperbolic arc-cosine of a number", async () => {
                expect(await evaluate("Numb.acosh 1.5")).to.be.Numb(Math.acosh(1.5));
            });
            
            it("should return Undefined Number if the argument is not a number", async () => {
                expect(await evaluate("Numb.acosh 'abc'")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Numb.acosh(1, 1.5, 2)")).to.be.Tuple([Math.acosh(1), Math.acosh(1.5), Math.acosh(2)]);
            });            
        });
    
        describe("Numb.asin - function", () => {
            
            it("should return the arc-sine of a number", async () => {
                expect(await evaluate("Numb.asin 0.5")).to.be.Numb(Math.asin(0.5));
            });
            
            it("should return Undefined Number if the argument is not a number", async () => {
                expect(await evaluate("Numb.asin 'abc'")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Numb.asin(0, 0.5, 1)")).to.be.Tuple([Math.asin(0), Math.asin(0.5), Math.asin(1)]);
            });            
        });
    
        describe("Numb.asinh - function", () => {
            
            it("should return the hyperbolic arc-sine of a number", async () => {
                expect(await evaluate("Numb.asinh 0.5")).to.be.Numb(Math.asinh(0.5));
            });
            
            it("should return Undefined Number if the argument is not a number", async () => {
                expect(await evaluate("Numb.asinh 'abc'")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Numb.asinh(0, 0.5, 1)")).to.be.Tuple([Math.asinh(0), Math.asinh(0.5), Math.asinh(1)]);
            });            
        });
    
        describe("Numb.atan - function", () => {
            
            it("should return the arc-tangent of a number", async () => {
                expect(await evaluate("Numb.atan 0.5")).to.be.Numb(Math.atan(0.5));
            });
            
            it("should return Undefined Number if the argument is not a number", async () => {
                expect(await evaluate("Numb.atan 'abc'")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Numb.atan(0, 0.5, 1)")).to.be.Tuple([Math.atan(0), Math.atan(0.5), Math.atan(1)]);
            });            
        });
    
        describe("Numb.atanh - function", () => {
            
            it("should return the hyperbolic arc-tangent of a number", async () => {
                expect(await evaluate("Numb.atanh 0.5")).to.be.Numb(Math.atanh(0.5));
            });
            
            it("should return Undefined Number if the argument is not a number", async () => {
                expect(await evaluate("Numb.atanh 'abc'")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Numb.atanh(0, 0.5, 1)")).to.be.Tuple([Math.atanh(0), Math.atanh(0.5), Math.atanh(1)]);
            });            
        });
    
        describe("Numb.ceil - function", () => {
            
            it("should round up a number to the closest largest integer", async () => {
                expect(await evaluate("Numb.ceil 12.345  ")).to.be.Numb(13);
                expect(await evaluate("Numb.ceil(-12.345)")).to.be.Numb(-12);
            });
            
            it("should return Undefined Number if the argument is not a number", async () => {
                expect(await evaluate("Numb.ceil 'abc'")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Numb.ceil(12.3,1.4,2.1)")).to.be.Tuple([13,2,3]);
            });            
        });
    
        describe("Numb.cos - function", () => {
            
            it("should return the cosine of a number", async () => {
                expect(await evaluate("Numb.cos 0.5")).to.be.Numb(Math.cos(0.5));
            });
            
            it("should return Undefined Number if the argument is not a number", async () => {
                expect(await evaluate("Numb.cos 'abc'")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Numb.cos(0, 0.5, 1)")).to.be.Tuple([Math.cos(0), Math.cos(0.5), Math.cos(1)]);
            });            
        });
    
        describe("Numb.cosh - function", () => {
            
            it("should return the hyperbolic cosine of a number", async () => {
                expect(await evaluate("Numb.cosh 0.5")).to.be.Numb(Math.cosh(0.5));
            });
            
            it("should return Undefined Number if the argument is not a number", async () => {
                expect(await evaluate("Numb.cosh 'abc'")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Numb.cosh(0, 0.5, 1)")).to.be.Tuple([Math.cosh(0), Math.cosh(0.5), Math.cosh(1)]);
            });            
        });
    
        describe("Numb.exp(x)", () => {
            
            it("should return the exponential of a number", async () => {
                expect(await evaluate("Numb.exp 0.5")).to.be.Numb(Math.exp(0.5));
            });
            
            it("should return Undefined Number if the argument is not a number", async () => {
                expect(await evaluate("Numb.exp 'abc'")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Numb.exp(0, 0.5, 1)")).to.be.Tuple([Math.exp(0), Math.exp(0.5), Math.exp(1)]);
            });            
        });
    
        describe("Numb.floor - function", () => {
            
            it("should round up a number to the closest smallest integer", async () => {
                expect(await evaluate("Numb.floor 12.345  ")).to.be.Numb(12);
                expect(await evaluate("Numb.floor(-12.345)")).to.be.Numb(-13);
            });
            
            it("should return Undefined Number if the argument is not a number", async () => {
                expect(await evaluate("Numb.floor 'abc'")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Numb.floor(12.3,1.4,2.1)")).to.be.Tuple([12,1,2]);
            });            
        });
    
        describe("Numb.log(x)", () => {

            it("should return the natural logarithm of a number", async () => {
                expect(await evaluate("Numb.log 0.5")).to.be.Numb(Math.log(0.5));
            });
            
            it("should return Undefined Number if the argument is not a number", async () => {
                expect(await evaluate("Numb.log 'abc'")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Numb.log(0.1, 0.5, 1)")).to.be.Tuple([Math.log(0.1), Math.log(0.5), Math.log(1)]);
            });            
        });
    
        describe("Numb.log10(x)", () => {

            it("should return the base-10 logarithm of a number", async () => {
                expect(await evaluate("Numb.log10 0.5")).to.be.Numb(Math.log10(0.5));
            });
            
            it("should return Undefined Number if the argument is not a number", async () => {
                expect(await evaluate("Numb.log10 'abc'")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Numb.log10(0.1, 0.5, 1)")).to.be.Tuple([Math.log10(0.1), Math.log10(0.5), Math.log10(1)]);
            });            
        });
    
        describe("Numb.max - function", () => {
            
            it("should return the maximum of a list of numbers", async () => {
                expect(await evaluate("Numb.max(23,1,13,56,22,-108)")).to.be.Numb(56);
            });
            
            it("should return Undefined Number if any of the arguments is not a number", async () => {
                expect(await evaluate("Numb.max(23,1,'xxx',56,22,-108)")).to.be.Undefined("Number");
            });
        });
    
        describe("Numb.min - function", () => {
            
            it("should return the maximum of a list of numbers", async () => {
                expect(await evaluate("Numb.min(23,1,13,56,22,-108)")).to.be.Numb(-108);
            });
            
            it("should return Undefined Number if any of the arguments is not a number", async () => {
                expect(await evaluate("Numb.min(23,1,'xxx',56,22,-108)")).to.be.Undefined("Number");
            });
        });
    
        describe("Numb.random(x)", () => {
            it("should return a random number between 0 and x", async () => {
                
                const item1 = await evaluate("Numb.random 2");
                expect(item1).to.be.instanceof(types.Numb);
                const value1 = item1.unwrap();
                expect(0 <= value1 && value1 <= 2).to.be.true;
                
                const value2 = types.unwrap(await evaluate("Numb.random 2"));
                const value3 = types.unwrap(await evaluate("Numb.random 2"));
                expect(value1).to.not.equal(value2);
                expect(value1).to.not.equal(value3);
                expect(value2).to.not.equal(value3);
            });

            it("should return Undefined Number if the argument is not a number", async () => {
                expect(await evaluate("Numb.random 'abc'")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                const tuple = await evaluate("Numb.random(2, 2, 2)");
                expect(tuple).to.be.instanceof(types.Tuple);
                const [value1, value2, value3] = Array.from(tuple);
                expect(0 <= value1 && value1 <= 2).to.be.true;
                expect(value1).to.not.equal(value2);
                expect(value1).to.not.equal(value3);
                expect(value2).to.not.equal(value3);
            });            
        });
    
        describe("Numb.round - function", () => {
            
            it("should round the given number to the closest integer", async () => {
    
                expect(await evaluate("Numb.round 12.345")).to.be.Numb(12);
                expect(await evaluate("Numb.round 6.789 ")).to.be.Numb(7);
                expect(await evaluate("Numb.round 10.5  ")).to.be.Numb(11);

                expect(await evaluate("Numb.round(-12.345)")).to.be.Numb(-12);
                expect(await evaluate("Numb.round(-6.789) ")).to.be.Numb(-7);
                expect(await evaluate("Numb.round(-10.5)  ")).to.be.Numb(-10);
            });
            
            it("should return Undefined Number if the argument is not a number", async () => {
                expect(await evaluate("Numb.round 'abc'")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Numb.round(12.3,1.6,2.5)")).to.be.Tuple([12,2,3]);
            });            
        });
    
        describe("Numb.sin - function", () => {
            
            it("should return the sine of a number", async () => {
                expect(await evaluate("Numb.sin 0.5")).to.be.Numb(Math.sin(0.5));
            });
            
            it("should return Undefined Number if the argument is not a number", async () => {
                expect(await evaluate("Numb.sin 'abc'")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Numb.sin(0, 0.5, 1)")).to.be.Tuple([Math.sin(0), Math.sin(0.5), Math.sin(1)]);
            });            
        });
    
        describe("Numb.sinh - function", () => {
            
            it("should return the hyperbolic sine of a number", async () => {
                expect(await evaluate("Numb.sinh 0.5")).to.be.Numb(Math.sinh(0.5));
            });
            
            it("should return Undefined Number if the argument is not a number", async () => {
                expect(await evaluate("Numb.sinh 'abc'")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Numb.sinh(0, 0.5, 1)")).to.be.Tuple([Math.sinh(0), Math.sinh(0.5), Math.sinh(1)]);
            });            
        });
    
        describe("Numb.sqrt - function", () => {
            
            it("should return the sine of a number", async () => {
                expect(await evaluate("Numb.sqrt 4   ")).to.be.Numb(2);
                expect(await evaluate("Numb.sqrt 34.5")).to.be.Numb(34.5**0.5);
            });
            
            it("should return Undefined Number if the argument is not a number", async () => {
                expect(await evaluate("Numb.sqrt 'abc'")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Numb.sqrt(4, 9, 16)")).to.be.Tuple([2,3,4]);

                const tuple = await evaluate("Numb.sqrt(4, 9, 'xxx')");
                expect(Array.from(tuple)[0]).to.equal(2);
                expect(Array.from(tuple)[1]).to.equal(3);
                expect(Array.from(tuple)[2]).to.be.Undefined("Number");
            });                        
        });
    
        describe("Numb.tan - function", () => {
            
            it("should return the tangent of a number", async () => {
                expect(await evaluate("Numb.tan 0.5")).to.be.Numb(Math.tan(0.5));
            });
            
            it("should return Undefined Number if the argument is not a number", async () => {
                expect(await evaluate("Numb.tan 'abc'")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Numb.tan(0, 0.5, 1)")).to.be.Tuple([Math.tan(0), Math.tan(0.5), Math.tan(1)]);
            });            
        });
    
        describe("Numb.tanh - function", () => {
            
            it("should return the hyperbolic tangent of a number", async () => {
                expect(await evaluate("Numb.tanh 0.5")).to.be.Numb(Math.tanh(0.5));
            });
            
            it("should return Undefined Number if the argument is not a number", async () => {
                expect(await evaluate("Numb.tanh 'abc'")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Numb.tanh(0, 0.5, 1)")).to.be.Tuple([Math.tanh(0), Math.tanh(0.5), Math.tanh(1)]);
            });            
        });
    
        describe("Numb.trunc - function", () => {
            
            it("should return the integer part of a number", async () => {
    
                expect(await evaluate("Numb.trunc 12.345")).to.be.Numb(12);
                expect(await evaluate("Numb.trunc 6.789 ")).to.be.Numb(6);
                expect(await evaluate("Numb.trunc 10.5  ")).to.be.Numb(10);

                expect(await evaluate("Numb.trunc(-12.345)")).to.be.Numb(-12);
                expect(await evaluate("Numb.trunc(-6.789) ")).to.be.Numb(-6);
                expect(await evaluate("Numb.trunc(-10.5)  ")).to.be.Numb(-10);
            });
            
            it("should return Undefined Number if the argument is not a number", async () => {
                expect(await evaluate("Numb.trunc 'abc'")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Numb.trunc(12.3,1.6,2.5)")).to.be.Tuple([12,1,2]);
            });            
        });
    });
    
    describe("Text", () => {
    
        describe("Text.from - function", () => {
            
            it("should return either 'TRUE' or 'FALSE' if the argument is a Bool item", async () => {
                expect(await evaluate("Text.from(Bool.TRUE)")).to.be.Text("TRUE");
                expect(await evaluate("Text.from(1==1)")).to.be.Text("TRUE");
                expect(await evaluate("Text.from(Bool.FALSE)")).to.be.Text("FALSE");
                expect(await evaluate("Text.from(1!=1)")).to.be.Text("FALSE");
            });
            
            it("should return the stringified decimal if the argument is a Numb item", async () => {
                expect(await evaluate("Text.from 123.45")).to.be.Text("123.45");
            });
    
            it("should return the argument itself if is a Text item", async () => {
                expect(await evaluate("Text.from 'abc'")).to.be.Text("abc");
            });

            it("should return '[[List of <n> items]]' if the argument is a List item", async () => {
                expect(await evaluate("Text.from [10,20,30]")).to.be.Text("[[List of 3 items]]");
                expect(await evaluate("Text.from [10]      ")).to.be.Text("[[List of 1 item]]");
                expect(await evaluate("Text.from []        ")).to.be.Text("[[List of 0 items]]");
            });
            
            it("should return '[[Func]]' if the argument is a Func item", async () => {
                expect(await evaluate("Text.from(x->x)")).to.be.Text("[[Func]]");
            });
            
            it("should return '[[Undefined <type>]]' if the argument is an Undefined item", async () => {
                const u = new types.Undefined("TestOp")
                expect(await evaluate("Text.from(u)", {u})).to.be.Text("[[Undefined TestOp]]");
            });
            
            it("should concatenate the stringified items if the argument is a tuple", async () => {
                expect(await evaluate("Text.from(12,'+',10)")).to.be.Text("12+10");
                expect(await evaluate("Text.from()         ")).to.be.Text("");
            });
            
            describe("when the argument is a Namespace item NS", () => {
                
                it("should return its comma-separated list of keys, enclosed between curly braces", async () => {
                    expect(await evaluate("Text.from{k1:1,k2:2,k3:3}")).to.be.Text("{k1, k2, k3}")
                });
                
                it("should return `Text.from(NS.__text__)` if `NS.__text__` exists and is not a Func item", async () => {
                    expect(await evaluate("Text.from{__text__:123}")).to.be.Text("123")
                });
                
                it("should return `Text.from(NS.__text__(NS))` if `NS.__text__` is a Func item", async () => {
                    expect(await evaluate("Text.from{t:456, __text__: self -> self.t}")).to.be.Text("456");
                });
            });
        });
    
        describe("Text.size(string)", () => {
    
            it("should return the string length", async () => {
                expect(await evaluate("Text.size 'abc'")).to.be.Numb(3);
            });
            
            it("should return Undefined Number if the argument is not a string", async () => {
                expect(await evaluate("Text.size 123")).to.be.Undefined("Number");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Text.size('ABC','Defg')")).to.be.Tuple([3,4]);
            });                        
        });
    
        describe("f = Text.find s1", () => {
            
            describe("when s1 is an item", () => {
                
                it("should return a function", async () => {
                    expect(await evaluate("Text.find 'Abc'")).to.be.instanceof(types.Func);
                });

                describe("i = f s2 ", () => {
        
                    it("should return the first index of s1 in s2", async () => {
                        expect(await evaluate("Text.find 'Abc' '__Abc__def__Abc'")).to.be.Numb(2);
                    });
        
                    it("should return -1 if no match is found", async () => {
                        expect(await evaluate("Text.find 'xxx' '__Abc__def__Abc'")).to.be.Numb(-1);
                    });
        
                    it("should return Undefined Text if `s1` is not a string", async () => {
                        expect(await evaluate("Text.find 10")).to.be.instanceof(types.Func);
                        expect(await evaluate("Text.find 10 'abc'")).to.be.Undefined("Text");
                    });

                    it("should return Undefined Text if `s2` is not a string", async () => {
                        expect(await evaluate("Text.find 'abc' 10")).to.be.Undefined("Text");
                    });

                    it("should return a tuple of values if `s2` is a tuple", async () => {
                        expect(await evaluate("Text.find 'Abc' ('__Abc__def__Abc', '01234Abc__')")).to.be.Tuple([2,5]);
                    });
                });
            });

            describe("when the argument is a tuple", () => {
                
                it("should return one `find` function for each item of the argument", async () => {
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
    
        describe("f = Text.rfind s1", () => {
            
            describe("when s1 is an item", () => {
                
                it("should return a function", async () => {
                    expect(await evaluate("Text.rfind 'Abc'")).to.be.instanceof(types.Func);
                });

                describe("i = f s2 ", () => {
        
                    it("should return the last index of s1 in s2", async () => {
                        expect(await evaluate("Text.rfind 'Abc' '__Abc__def__Abc'")).to.be.Numb(12);
                    });
        
                    it("should return -1 if no match is found", async () => {
                        expect(await evaluate("Text.rfind 'xxx' '__Abc__def__Abc'")).to.be.Numb(-1);
                    });
        
                    it("should return Undefined Text if `s1` is not a string", async () => {
                        expect(await evaluate("Text.rfind 10")).to.be.instanceof(types.Func);
                        expect(await evaluate("Text.rfind 10 'abc'")).to.be.Undefined("Text");
                    });

                    it("should return Undefined Text if `s2` is not a string", async () => {
                        expect(await evaluate("Text.rfind 'abc' 10")).to.be.Undefined("Text");
                    });

                    it("should return a tuple of values if `s2` is a tuple", async () => {
                        expect(await evaluate("Text.rfind 'Abc' ('__Abc__def__Abc', '01234Abc__')")).to.be.Tuple([12,5]);
                    });
                });
            });

            describe("when the argument is a tuple", () => {
                
                it("should return one `rfind` function for each item of the argument", async () => {
                    const F = await evaluate("Text.rfind('Abc','Def')");
                    expect(F).to.be.instanceof(types.Tuple);

                    const [f1,f2] = Array.from(F.items());
                    expect(f1).to.be.instanceof(types.Func)
                    expect(f2).to.be.instanceof(types.Func)
                    
                    expect(await evaluate("Text.rfind('Abc','Def') '__Abc__Def__Abc'")).to.be.Tuple([12,7]);
                    expect(await evaluate("Text.rfind('Abc','Def')('__Abc__Def__Abc', '01234Abc__')")).to.be.Tuple([12,5,7,-1]);                    
                });
            });    
        });    
    
        describe("Text.lower - function", () => {
    
            it("should return the given string converted to lower case characters", async () => {
                expect(await evaluate("Text.lower 'AbcDef'")).to.be.Text("abcdef");
            });
            
            it("should return Undefined Text if the argument is not a string", async () => {
                expect(await evaluate("Text.lower 123")).to.be.Undefined("Text");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Text.lower('ABC','Def')")).to.be.Tuple(["abc","def"]);
            });                        
        });    
    
        describe("Text.upper - function", () => {
    
            it("should return the given string converted to lower case characters", async () => {
                expect(await evaluate("Text.upper 'AbcDef'")).to.be.Text("ABCDEF");
            });
            
            it("should return Undefined Text if the argument is not a string", async () => {
                expect(await evaluate("Text.upper 123")).to.be.Undefined("Text");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Text.upper('abc','Def')")).to.be.Tuple(["ABC","DEF"]);
            });                        
        });    
    
        describe("s2 = Text.trim_head s1", () => {
            
            it("should return `s1` without leading spaces", async () => {
                expect(await evaluate("Text.trim_head '   abc   '")).to.be.Text("abc   ");
            });
            
            it("should return Undefined Text if the argument is not a string", async () => {
                expect(await evaluate("Text.trim_head 123")).to.be.Undefined("Text");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Text.trim_head(' abc ',' Def ')")).to.be.Tuple(["abc ","Def "]);
            });                        
        });   
    
        describe("s2 = Text.trim_tail s1", () => {
            
            it("should return `s1` without trailing spaces", async () => {
                expect(await evaluate("Text.trim_tail '   abc   '")).to.be.Text("   abc");
            });
            
            it("should return Undefined Text if the argument is not a string", async () => {
                expect(await evaluate("Text.trim_tail 123")).to.be.Undefined("Text");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Text.trim_tail(' abc ',' Def ')")).to.be.Tuple([" abc"," Def"]);
            });                        
        });   
    
        describe("s2 = Text.trim s1", () => {
            
            it("should return `s1` without leading and trailing spaces", async () => {
                expect(await evaluate("Text.trim '   abc   '")).to.be.Text("abc");
            });
            
            it("should return Undefined Text if the argument is not a string", async () => {
                expect(await evaluate("Text.trim 123")).to.be.Undefined("Text");
            });

            it("should apply to all the items and return a tuple if the argument is a truple", async () => {
                expect(await evaluate("Text.trim(' abc ',' Def ')")).to.be.Tuple(["abc","Def"]);
            });                        
        });   
    
        describe("f = Text.head n", () => {
    
            describe("when n is an item", () => {
                
                it("should return a function", async () => {
                    expect(await evaluate("Text.head 3")).to.be.instanceof(types.Func);
                });

                describe("s2 = f s1 ", () => {
        
                    it("should return the first n characters of s1", async () => {
                        expect(await evaluate("Text.head 3 'abcdef'")).to.be.Text('abc');
                    });
        
                    it("should consider n relative to the end of the string if it is negative", async () => {
                        expect(await evaluate("Text.head (-2) 'abcdef'")).to.be.Text('abcd');
                    });

                    it("should return Undefined Text if `n` is not a number", async () => {
                        expect(await evaluate("Text.head 'abc'")).to.be.instanceof(types.Func);
                        expect(await evaluate("Text.head 'abc' 'def'")).to.be.Undefined("Text");
                    });

                    it("should return Undefined Text if `s1` is not a string", async () => {
                        expect(await evaluate("Text.head 3 10")).to.be.Undefined("Text");
                    });

                    it("should return a tuple of values if `s1` is a tuple", async () => {
                        expect(await evaluate("Text.head 2 ('abc', 'def', 'ghi')")).to.be.Tuple(['ab','de','gh']);
                    });
                });
            });

            describe("when the argument is a tuple", () => {
                
                it("should return one `f` function for each item of the argument", async () => {
                    const F = await evaluate("Text.head(2,3)");
                    expect(F).to.be.instanceof(types.Tuple);

                    const [f1,f2] = Array.from(F.items());
                    expect(f1).to.be.instanceof(types.Func)
                    expect(f2).to.be.instanceof(types.Func)
                    
                    expect(await evaluate("Text.head(2,3) 'abcdef'")).to.be.Tuple(['ab','abc']);
                    expect(await evaluate("Text.head(2,3)('abcdef', 'ghijkl')")).to.be.Tuple(['ab','gh','abc','ghi']);                    
                });
            });    
        });              
    
        describe("f = Text.tail n", () => {
    
            describe("when n is an item", () => {
                
                it("should return a function", async () => {
                    expect(await evaluate("Text.tail 3")).to.be.instanceof(types.Func);
                });

                describe("s2 = f s1 ", () => {
        
                    it("should return the last characters of s1, starting with the n-th", async () => {
                        expect(await evaluate("Text.tail 2 'abcdef'")).to.be.Text('cdef');
                    });
        
                    it("should consider n relative to the end of the string if it is negative", async () => {
                        expect(await evaluate("Text.tail (-2) 'abcdef'")).to.be.Text('ef');
                    });

                    it("should return Undefined Text if `n` is not a number", async () => {
                        expect(await evaluate("Text.tail 'abc'")).to.be.instanceof(types.Func);
                        expect(await evaluate("Text.tail 'abc' 'def'")).to.be.Undefined("Text");
                    });

                    it("should return Undefined Text if `s1` is not a string", async () => {
                        expect(await evaluate("Text.tail 3 10")).to.be.Undefined("Text");
                    });

                    it("should return a tuple of values if `s1` is a tuple", async () => {
                        expect(await evaluate("Text.tail (-2) ('abc', 'def', 'ghi')")).to.be.Tuple(['bc','ef','hi']);
                    });
                });
            });

            describe("when the argument is a tuple", () => {
                
                it("should return one `f` function for each item of the argument", async () => {
                    const F = await evaluate("Text.tail(2,3)");
                    expect(F).to.be.instanceof(types.Tuple);

                    const [f1,f2] = Array.from(F.items());
                    expect(f1).to.be.instanceof(types.Func)
                    expect(f2).to.be.instanceof(types.Func)
                    
                    expect(await evaluate("Text.tail(-2,-3) 'abcdef'")).to.be.Tuple(['ef','def']);
                    expect(await evaluate("Text.tail(-2,-3)('abcdef', 'ghijkl')")).to.be.Tuple(['ef','kl','def','jkl']);                    
                });
            });    
        });              
    
        describe("f = Text.split s1", () => {
    
            describe("when s1 is an item", () => {
                
                it("should return a function", async () => {
                    expect(await evaluate("Text.split '::'")).to.be.instanceof(types.Func);
                });

                describe("l = f s2 ", () => {
        
                    it("should return the list of the s2 substrings separated by s1", async () => {
                        expect(await evaluate("Text.split '::' 'ab::cd::ef'")).to.be.List(["ab","cd","ef"]);
                        expect(await evaluate("Text.split '::' 'abcdef'")).to.be.List(["abcdef"]);
                    });

                    it("should return Undefined Text if `s1` is not a string", async () => {
                        expect(await evaluate("Text.split 10")).to.be.instanceof(types.Func);
                        expect(await evaluate("Text.split 10 'def'")).to.be.Undefined("Text");
                    });

                    it("should return Undefined Text if `s2` is not a string", async () => {
                        expect(await evaluate("Text.split '::' 10")).to.be.Undefined("Text");
                    });

                    it("should return a tuple of values if `s2` is a tuple", async () => {
                        expect(await evaluate("Text.split '::' ('ab::cd', 'de::fg')")).to.be.Tuple([["ab","cd"], ["de","fg"]]);
                    });
                });
            });

            describe("when s1 is a tuple", () => {
                
                it("should return one `f` function for each item of the argument", async () => {
                    const F = await evaluate("Text.split('::','!!')");
                    expect(F).to.be.instanceof(types.Tuple);

                    const [f1,f2] = Array.from(F.items());
                    expect(f1).to.be.instanceof(types.Func)
                    expect(f2).to.be.instanceof(types.Func)
                    
                    expect(await evaluate("Text.split('::','!!') 'a!!b::c!!d'")).to.be.Tuple([["a!!b","c!!d"],["a","b::c","d"]]);
                    expect(await evaluate("Text.split('::','!!')('ab::cd!!ef', 'gh::ij!!kl')")).to.be.Tuple([["ab","cd!!ef"], ["gh","ij!!kl"], ["ab::cd","ef"], ["gh::ij","kl"]]);
                });
            });    
        });              
    });
    
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













