const expect = require("../expect");

const types = require("../../lib/types");
const parse = require("../../lib/interpreter");
const numb = require("../../lib/modules/numb")(types);

const evaluate = async (expression, presets={}) => {
    const context = Object.assign({numb}, presets);
    return await parse(expression)(context);
}



describe("numb module", () => {

    describe("numb.INFINITY - constant", () => {
        it("should return Infinity wrapped as a Numb", async () => {
            expect(await evaluate("numb.INFINITY")).to.be.Numb(Infinity);
        });
    });

    describe("numb.E - contant", () => {
        it("should return the Euler's number", async () => {
            expect(await evaluate("numb.E")).to.be.Numb(Math.E);
        });
    });

    describe("numb.PI - constant", () => {
        it("should return the Pi number", async () => {
            expect(await evaluate("numb.PI")).to.be.Numb(Math.PI);
        });
    });
    
    describe("numb.parse - function", () => {
        
        it("should convert a string representation of a number to a number", async () => {
            expect(await evaluate("numb.parse '12'")).to.be.Numb(12);
            expect(await evaluate("numb.parse '-12e1'")).to.be.Numb(-120);
            expect(await evaluate("numb.parse '0b11'")).to.be.Numb(3);
            expect(await evaluate("numb.parse '0o33'")).to.be.Numb(27);
            expect(await evaluate("numb.parse '0xA2'")).to.be.Numb(162);
        });
        
        it("should return Undefined Number if the argument is not a valid string", async () => {
            expect(await evaluate("numb.parse 'abc'")).to.be.Undefined("Number");
            expect(await evaluate("numb.parse 10")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("numb.parse('10', '0b11', '0o33')")).to.be.Numb(10);
        });            
    });

    describe("numb.abs - function", () => {
        
        it("should return the absolute value of a number", async () => {
            expect(await evaluate("numb.abs(-123.45)")).to.be.Numb(123.45);
            expect(await evaluate("numb.abs 0")).to.be.Numb(0);
            expect(await evaluate("numb.abs 123.45")).to.be.Numb(123.45);
        });
        
        it("should return Undefined Number if the argument is not a number", async () => {
            expect(await evaluate("numb.abs 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("numb.abs(-1, 0, 1)")).to.be.Numb(1);
        });            
    });

    describe("numb.acos - function", () => {

        it("should return the arc-cosine of a number", async () => {
            expect(await evaluate("numb.acos 0.5")).to.be.Numb(Math.acos(0.5));
        });
        
        it("should return Undefined Number if the argument is not a number", async () => {
            expect(await evaluate("numb.acos 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("numb.acos(0.5, 0.6, 1)")).to.be.Numb(Math.acos(0.5));
        });            
    });

    describe("numb.acosh - function", () => {
        
        it("should return the hyperbolic arc-cosine of a number", async () => {
            expect(await evaluate("numb.acosh 1.5")).to.be.Numb(Math.acosh(1.5));
        });
        
        it("should return Undefined Number if the argument is not a number", async () => {
            expect(await evaluate("numb.acosh 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("numb.acosh(1, 1.5, 2)")).to.be.Numb(Math.acosh(1));
        });            
    });

    describe("numb.asin - function", () => {
        
        it("should return the arc-sine of a number", async () => {
            expect(await evaluate("numb.asin 0.5")).to.be.Numb(Math.asin(0.5));
        });
        
        it("should return Undefined Number if the argument is not a number", async () => {
            expect(await evaluate("numb.asin 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("numb.asin(0.4, 0.5, 1)")).to.be.Numb(Math.asin(0.4));
        });            
    });

    describe("numb.asinh - function", () => {
        
        it("should return the hyperbolic arc-sine of a number", async () => {
            expect(await evaluate("numb.asinh 0.5")).to.be.Numb(Math.asinh(0.5));
        });
        
        it("should return Undefined Number if the argument is not a number", async () => {
            expect(await evaluate("numb.asinh 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("numb.asinh(0.4, 0.5, 1)")).to.be.Numb(Math.asinh(0.4));
        });            
    });

    describe("numb.atan - function", () => {
        
        it("should return the arc-tangent of a number", async () => {
            expect(await evaluate("numb.atan 0.5")).to.be.Numb(Math.atan(0.5));
        });
        
        it("should return Undefined Number if the argument is not a number", async () => {
            expect(await evaluate("numb.atan 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("numb.atan(0.4, 0.5, 1)")).to.be.Numb(Math.atan(0.4));
        });            
    });

    describe("numb.atanh - function", () => {
        
        it("should return the hyperbolic arc-tangent of a number", async () => {
            expect(await evaluate("numb.atanh 0.5")).to.be.Numb(Math.atanh(0.5));
        });
        
        it("should return Undefined Number if the argument is not a number", async () => {
            expect(await evaluate("numb.atanh 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("numb.atanh(0.4, 0.5, 1)")).to.be.Numb(Math.atanh(0.4));
        });            
    });

    describe("numb.ceil - function", () => {
        
        it("should round up a number to the closest largest integer", async () => {
            expect(await evaluate("numb.ceil 12.345  ")).to.be.Numb(13);
            expect(await evaluate("numb.ceil(-12.345)")).to.be.Numb(-12);
        });
        
        it("should return Undefined Number if the argument is not a number", async () => {
            expect(await evaluate("numb.ceil 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("numb.ceil(12.3,1.4,2.1)")).to.be.Numb(13);
        });            
    });

    describe("numb.cos - function", () => {
        
        it("should return the cosine of a number", async () => {
            expect(await evaluate("numb.cos 0.5")).to.be.Numb(Math.cos(0.5));
        });
        
        it("should return Undefined Number if the argument is not a number", async () => {
            expect(await evaluate("numb.cos 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("numb.cos(0.4, 0.5, 1)")).to.be.Numb(Math.cos(0.4));
        });            
    });

    describe("numb.cosh - function", () => {
        
        it("should return the hyperbolic cosine of a number", async () => {
            expect(await evaluate("numb.cosh 0.5")).to.be.Numb(Math.cosh(0.5));
        });
        
        it("should return Undefined Number if the argument is not a number", async () => {
            expect(await evaluate("numb.cosh 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("numb.cosh(0.4, 0.5, 1)")).to.be.Numb(Math.cosh(0.4));
        });            
    });

    describe("numb.exp - function", () => {
        
        it("should return the exponential of a number", async () => {
            expect(await evaluate("numb.exp 0.5")).to.be.Numb(Math.exp(0.5));
        });
        
        it("should return Undefined Number if the argument is not a number", async () => {
            expect(await evaluate("numb.exp 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("numb.exp(0.4, 0.5, 1)")).to.be.Numb(Math.exp(0.4));
        });            
    });

    describe("numb.floor - function", () => {
        
        it("should round up a number to the closest smallest integer", async () => {
            expect(await evaluate("numb.floor 12.345  ")).to.be.Numb(12);
            expect(await evaluate("numb.floor(-12.345)")).to.be.Numb(-13);
        });
        
        it("should return Undefined Number if the argument is not a number", async () => {
            expect(await evaluate("numb.floor 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("numb.floor(12.3,1.4,2.1)")).to.be.Numb(12);
        });            
    });

    describe("numb.log - function", () => {

        it("should return the natural logarithm of a number", async () => {
            expect(await evaluate("numb.log 0.5")).to.be.Numb(Math.log(0.5));
        });
        
        it("should return Undefined Number if the argument is not a number", async () => {
            expect(await evaluate("numb.log 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("numb.log(0.1, 0.5, 1)")).to.be.Numb(Math.log(0.1));
        });            
    });

    describe("numb.log10 - function", () => {

        it("should return the base-10 logarithm of a number", async () => {
            expect(await evaluate("numb.log10 0.5")).to.be.Numb(Math.log10(0.5));
        });
        
        it("should return Undefined Number if the argument is not a number", async () => {
            expect(await evaluate("numb.log10 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("numb.log10(0.1, 0.5, 1)")).to.be.Numb(Math.log10(0.1));
        });            
    });

    describe("numb.max - function", () => {
        
        it("should return the maximum of a list of numbers", async () => {
            expect(await evaluate("numb.max(23,1,13,56,22,-108)")).to.be.Numb(56);
        });
        
        it("should return Undefined Number if any of the arguments is not a number", async () => {
            expect(await evaluate("numb.max(23,1,'xxx',56,22,-108)")).to.be.Undefined("Number");
        });
    });

    describe("numb.min - function", () => {
        
        it("should return the maximum of a list of numbers", async () => {
            expect(await evaluate("numb.min(23,1,13,56,22,-108)")).to.be.Numb(-108);
        });
        
        it("should return Undefined Number if any of the arguments is not a number", async () => {
            expect(await evaluate("numb.min(23,1,'xxx',56,22,-108)")).to.be.Undefined("Number");
        });
    });

    describe("numb.random - function", () => {
        it("should return a random number between 0 and x", async () => {
            
            const item1 = await evaluate("numb.random 2");
            expect(item1).to.be.instanceof(types.Numb);
            const value1 = item1.unwrap();
            expect(0 <= value1 && value1 <= 2).to.be.true;
            
            const value2 = types.unwrap(await evaluate("numb.random 2"));
            const value3 = types.unwrap(await evaluate("numb.random 2"));
            expect(value1).to.not.equal(value2);
            expect(value1).to.not.equal(value3);
            expect(value2).to.not.equal(value3);
        });

        it("should return Undefined Number if the argument is not a number", async () => {
            expect(await evaluate("numb.random 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            const item1 = await evaluate("numb.random(2,5,7)");
            expect(item1).to.be.instanceof(types.Numb);
            const value1 = item1.unwrap();
            expect(0 <= value1 && value1 <= 2).to.be.true;
            
            const value2 = types.unwrap(await evaluate("numb.random(2,5,7)"));
            const value3 = types.unwrap(await evaluate("numb.random(2,5,7)"));
            expect(value1).to.not.equal(value2);
            expect(value1).to.not.equal(value3);
            expect(value2).to.not.equal(value3);
        });            
    });

    describe("numb.round - function", () => {
        
        it("should round the given number to the closest integer", async () => {

            expect(await evaluate("numb.round 12.345")).to.be.Numb(12);
            expect(await evaluate("numb.round 6.789 ")).to.be.Numb(7);
            expect(await evaluate("numb.round 10.5  ")).to.be.Numb(11);

            expect(await evaluate("numb.round(-12.345)")).to.be.Numb(-12);
            expect(await evaluate("numb.round(-6.789) ")).to.be.Numb(-7);
            expect(await evaluate("numb.round(-10.5)  ")).to.be.Numb(-10);
        });
        
        it("should return Undefined Number if the argument is not a number", async () => {
            expect(await evaluate("numb.round 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("numb.round(12.3,1.6,2.5)")).to.be.Numb(12);
        });            
    });

    describe("numb.sin - function", () => {
        
        it("should return the sine of a number", async () => {
            expect(await evaluate("numb.sin 0.5")).to.be.Numb(Math.sin(0.5));
        });
        
        it("should return Undefined Number if the argument is not a number", async () => {
            expect(await evaluate("numb.sin 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("numb.sin(0.4, 0.5, 1)")).to.be.Numb(Math.sin(0.4));
        });            
    });

    describe("numb.sinh - function", () => {
        
        it("should return the hyperbolic sine of a number", async () => {
            expect(await evaluate("numb.sinh 0.5")).to.be.Numb(Math.sinh(0.5));
        });
        
        it("should return Undefined Number if the argument is not a number", async () => {
            expect(await evaluate("numb.sinh 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("numb.sinh(0.4, 0.5, 1)")).to.be.Numb(Math.sinh(0.4));
        });            
    });

    describe("numb.sqrt - function", () => {
        
        it("should return the sine of a number", async () => {
            expect(await evaluate("numb.sqrt 4   ")).to.be.Numb(2);
            expect(await evaluate("numb.sqrt 34.5")).to.be.Numb(34.5**0.5);
        });
        
        it("should return Undefined Number if the argument is not a number", async () => {
            expect(await evaluate("numb.sqrt 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("numb.sqrt(4, 9, 160)")).to.be.Numb(2);
            expect(await evaluate("numb.sqrt(4, 9, 'x')")).to.be.Numb(2);
        });                        
    });

    describe("numb.tan - function", () => {
        
        it("should return the tangent of a number", async () => {
            expect(await evaluate("numb.tan 0.5")).to.be.Numb(Math.tan(0.5));
        });
        
        it("should return Undefined Number if the argument is not a number", async () => {
            expect(await evaluate("numb.tan 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("numb.tan(0.4, 0.5, 1)")).to.be.Numb(Math.tan(0.4));
        });            
    });

    describe("numb.tanh - function", () => {
        
        it("should return the hyperbolic tangent of a number", async () => {
            expect(await evaluate("numb.tanh 0.5")).to.be.Numb(Math.tanh(0.5));
        });
        
        it("should return Undefined Number if the argument is not a number", async () => {
            expect(await evaluate("numb.tanh 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("numb.tanh(0.4, 0.5, 1)")).to.be.Numb(Math.tanh(0.4));
        });            
    });

    describe("numb.trunc - function", () => {
        
        it("should return the integer part of a number", async () => {

            expect(await evaluate("numb.trunc 12.345")).to.be.Numb(12);
            expect(await evaluate("numb.trunc 6.789 ")).to.be.Numb(6);
            expect(await evaluate("numb.trunc 10.5  ")).to.be.Numb(10);

            expect(await evaluate("numb.trunc(-12.345)")).to.be.Numb(-12);
            expect(await evaluate("numb.trunc(-6.789) ")).to.be.Numb(-6);
            expect(await evaluate("numb.trunc(-10.5)  ")).to.be.Numb(-10);
        });
        
        it("should return Undefined Number if the argument is not a number", async () => {
            expect(await evaluate("numb.trunc 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("numb.trunc(12.3,1.6,2.5)")).to.be.Numb(12);
        });            
    });
});
