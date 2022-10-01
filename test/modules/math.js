const expect = require("../expect");

const types = require("../../lib/types");
const parse = require("../../lib/interpreter");
const math = require("../../lib/modules/math")(types);

const evaluate = async (expression, presets={}) => {
    const context = Object.assign({math}, presets);
    return await parse(expression)(context);
}



describe("math module", () => {

    describe("math.INFINITY - constant", () => {
        it("should return Infinity wrapped as a Numb", async () => {
            expect(await evaluate("math.INFINITY")).to.be.Numb(Infinity);
        });
    });

    describe("math.E - contant", () => {
        it("should return the Euler's math.r", async () => {
            expect(await evaluate("math.E")).to.be.Numb(Math.E);
        });
    });

    describe("math.PI - constant", () => {
        it("should return the Pi math.r", async () => {
            expect(await evaluate("math.PI")).to.be.Numb(Math.PI);
        });
    });
    
    describe("math.abs - function", () => {
        
        it("should return the absolute value of a math.r", async () => {
            expect(await evaluate("math.abs(-123.45)")).to.be.Numb(123.45);
            expect(await evaluate("math.abs 0")).to.be.Numb(0);
            expect(await evaluate("math.abs 123.45")).to.be.Numb(123.45);
        });
        
        it("should return Undefined Number if the argument is not a math.r", async () => {
            expect(await evaluate("math.abs 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("math.abs(-1, 0, 1)")).to.be.Numb(1);
        });            
    });

    describe("math.acos - function", () => {

        it("should return the arc-cosine of a math.r", async () => {
            expect(await evaluate("math.acos 0.5")).to.be.Numb(Math.acos(0.5));
        });
        
        it("should return Undefined Number if the argument is not a math.r", async () => {
            expect(await evaluate("math.acos 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("math.acos(0.5, 0.6, 1)")).to.be.Numb(Math.acos(0.5));
        });            
    });

    describe("math.acosh - function", () => {
        
        it("should return the hyperbolic arc-cosine of a math.r", async () => {
            expect(await evaluate("math.acosh 1.5")).to.be.Numb(Math.acosh(1.5));
        });
        
        it("should return Undefined Number if the argument is not a math.r", async () => {
            expect(await evaluate("math.acosh 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("math.acosh(1, 1.5, 2)")).to.be.Numb(Math.acosh(1));
        });            
    });

    describe("math.asin - function", () => {
        
        it("should return the arc-sine of a math.r", async () => {
            expect(await evaluate("math.asin 0.5")).to.be.Numb(Math.asin(0.5));
        });
        
        it("should return Undefined Number if the argument is not a math.r", async () => {
            expect(await evaluate("math.asin 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("math.asin(0.4, 0.5, 1)")).to.be.Numb(Math.asin(0.4));
        });            
    });

    describe("math.asinh - function", () => {
        
        it("should return the hyperbolic arc-sine of a math.r", async () => {
            expect(await evaluate("math.asinh 0.5")).to.be.Numb(Math.asinh(0.5));
        });
        
        it("should return Undefined Number if the argument is not a math.r", async () => {
            expect(await evaluate("math.asinh 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("math.asinh(0.4, 0.5, 1)")).to.be.Numb(Math.asinh(0.4));
        });            
    });

    describe("math.atan - function", () => {
        
        it("should return the arc-tangent of a math.r", async () => {
            expect(await evaluate("math.atan 0.5")).to.be.Numb(Math.atan(0.5));
        });
        
        it("should return Undefined Number if the argument is not a math.r", async () => {
            expect(await evaluate("math.atan 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("math.atan(0.4, 0.5, 1)")).to.be.Numb(Math.atan(0.4));
        });            
    });

    describe("math.atanh - function", () => {
        
        it("should return the hyperbolic arc-tangent of a math.r", async () => {
            expect(await evaluate("math.atanh 0.5")).to.be.Numb(Math.atanh(0.5));
        });
        
        it("should return Undefined Number if the argument is not a math.r", async () => {
            expect(await evaluate("math.atanh 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("math.atanh(0.4, 0.5, 1)")).to.be.Numb(Math.atanh(0.4));
        });            
    });

    describe("math.ceil - function", () => {
        
        it("should round up a math.r to the closest largest integer", async () => {
            expect(await evaluate("math.ceil 12.345  ")).to.be.Numb(13);
            expect(await evaluate("math.ceil(-12.345)")).to.be.Numb(-12);
        });
        
        it("should return Undefined Number if the argument is not a math.r", async () => {
            expect(await evaluate("math.ceil 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("math.ceil(12.3,1.4,2.1)")).to.be.Numb(13);
        });            
    });

    describe("math.cos - function", () => {
        
        it("should return the cosine of a math.r", async () => {
            expect(await evaluate("math.cos 0.5")).to.be.Numb(Math.cos(0.5));
        });
        
        it("should return Undefined Number if the argument is not a math.r", async () => {
            expect(await evaluate("math.cos 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("math.cos(0.4, 0.5, 1)")).to.be.Numb(Math.cos(0.4));
        });            
    });

    describe("math.cosh - function", () => {
        
        it("should return the hyperbolic cosine of a math.r", async () => {
            expect(await evaluate("math.cosh 0.5")).to.be.Numb(Math.cosh(0.5));
        });
        
        it("should return Undefined Number if the argument is not a math.r", async () => {
            expect(await evaluate("math.cosh 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("math.cosh(0.4, 0.5, 1)")).to.be.Numb(Math.cosh(0.4));
        });            
    });

    describe("math.exp - function", () => {
        
        it("should return the exponential of a math.r", async () => {
            expect(await evaluate("math.exp 0.5")).to.be.Numb(Math.exp(0.5));
        });
        
        it("should return Undefined Number if the argument is not a math.r", async () => {
            expect(await evaluate("math.exp 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("math.exp(0.4, 0.5, 1)")).to.be.Numb(Math.exp(0.4));
        });            
    });

    describe("math.floor - function", () => {
        
        it("should round up a math.r to the closest smallest integer", async () => {
            expect(await evaluate("math.floor 12.345  ")).to.be.Numb(12);
            expect(await evaluate("math.floor(-12.345)")).to.be.Numb(-13);
        });
        
        it("should return Undefined Number if the argument is not a math.r", async () => {
            expect(await evaluate("math.floor 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("math.floor(12.3,1.4,2.1)")).to.be.Numb(12);
        });            
    });

    describe("math.log - function", () => {

        it("should return the natural logarithm of a math.r", async () => {
            expect(await evaluate("math.log 0.5")).to.be.Numb(Math.log(0.5));
        });
        
        it("should return Undefined Number if the argument is not a math.r", async () => {
            expect(await evaluate("math.log 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("math.log(0.1, 0.5, 1)")).to.be.Numb(Math.log(0.1));
        });            
    });

    describe("math.log10 - function", () => {

        it("should return the base-10 logarithm of a math.r", async () => {
            expect(await evaluate("math.log10 0.5")).to.be.Numb(Math.log10(0.5));
        });
        
        it("should return Undefined Number if the argument is not a math.r", async () => {
            expect(await evaluate("math.log10 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("math.log10(0.1, 0.5, 1)")).to.be.Numb(Math.log10(0.1));
        });            
    });

    describe("math.max - function", () => {
        
        it("should return the maximum of a list of math.rs", async () => {
            expect(await evaluate("math.max(23,1,13,56,22,-108)")).to.be.Numb(56);
        });
        
        it("should return Undefined Number if any of the arguments is not a math.r", async () => {
            expect(await evaluate("math.max(23,1,'xxx',56,22,-108)")).to.be.Undefined("Number");
        });
    });

    describe("math.min - function", () => {
        
        it("should return the maximum of a list of math.rs", async () => {
            expect(await evaluate("math.min(23,1,13,56,22,-108)")).to.be.Numb(-108);
        });
        
        it("should return Undefined Number if any of the arguments is not a math.r", async () => {
            expect(await evaluate("math.min(23,1,'xxx',56,22,-108)")).to.be.Undefined("Number");
        });
    });

    describe("math.random - function", () => {
        it("should return a random math.r between 0 and x", async () => {
            
            const item1 = await evaluate("math.random 2");
            expect(item1).to.be.instanceof(types.Numb);
            const value1 = item1.unwrap();
            expect(0 <= value1 && value1 <= 2).to.be.true;
            
            const value2 = types.unwrap(await evaluate("math.random 2"));
            const value3 = types.unwrap(await evaluate("math.random 2"));
            expect(value1).to.not.equal(value2);
            expect(value1).to.not.equal(value3);
            expect(value2).to.not.equal(value3);
        });

        it("should return Undefined Number if the argument is not a math.r", async () => {
            expect(await evaluate("math.random 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            const item1 = await evaluate("math.random(2,5,7)");
            expect(item1).to.be.instanceof(types.Numb);
            const value1 = item1.unwrap();
            expect(0 <= value1 && value1 <= 2).to.be.true;
            
            const value2 = types.unwrap(await evaluate("math.random(2,5,7)"));
            const value3 = types.unwrap(await evaluate("math.random(2,5,7)"));
            expect(value1).to.not.equal(value2);
            expect(value1).to.not.equal(value3);
            expect(value2).to.not.equal(value3);
        });            
    });

    describe("math.round - function", () => {
        
        it("should round the given math.r to the closest integer", async () => {

            expect(await evaluate("math.round 12.345")).to.be.Numb(12);
            expect(await evaluate("math.round 6.789 ")).to.be.Numb(7);
            expect(await evaluate("math.round 10.5  ")).to.be.Numb(11);

            expect(await evaluate("math.round(-12.345)")).to.be.Numb(-12);
            expect(await evaluate("math.round(-6.789) ")).to.be.Numb(-7);
            expect(await evaluate("math.round(-10.5)  ")).to.be.Numb(-10);
        });
        
        it("should return Undefined Number if the argument is not a math.r", async () => {
            expect(await evaluate("math.round 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("math.round(12.3,1.6,2.5)")).to.be.Numb(12);
        });            
    });

    describe("math.sin - function", () => {
        
        it("should return the sine of a math.r", async () => {
            expect(await evaluate("math.sin 0.5")).to.be.Numb(Math.sin(0.5));
        });
        
        it("should return Undefined Number if the argument is not a math.r", async () => {
            expect(await evaluate("math.sin 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("math.sin(0.4, 0.5, 1)")).to.be.Numb(Math.sin(0.4));
        });            
    });

    describe("math.sinh - function", () => {
        
        it("should return the hyperbolic sine of a math.r", async () => {
            expect(await evaluate("math.sinh 0.5")).to.be.Numb(Math.sinh(0.5));
        });
        
        it("should return Undefined Number if the argument is not a math.r", async () => {
            expect(await evaluate("math.sinh 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("math.sinh(0.4, 0.5, 1)")).to.be.Numb(Math.sinh(0.4));
        });            
    });

    describe("math.sqrt - function", () => {
        
        it("should return the sine of a math.r", async () => {
            expect(await evaluate("math.sqrt 4   ")).to.be.Numb(2);
            expect(await evaluate("math.sqrt 34.5")).to.be.Numb(34.5**0.5);
        });
        
        it("should return Undefined Number if the argument is not a math.r", async () => {
            expect(await evaluate("math.sqrt 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("math.sqrt(4, 9, 160)")).to.be.Numb(2);
            expect(await evaluate("math.sqrt(4, 9, 'x')")).to.be.Numb(2);
        });                        
    });

    describe("math.tan - function", () => {
        
        it("should return the tangent of a math.r", async () => {
            expect(await evaluate("math.tan 0.5")).to.be.Numb(Math.tan(0.5));
        });
        
        it("should return Undefined Number if the argument is not a math.r", async () => {
            expect(await evaluate("math.tan 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("math.tan(0.4, 0.5, 1)")).to.be.Numb(Math.tan(0.4));
        });            
    });

    describe("math.tanh - function", () => {
        
        it("should return the hyperbolic tangent of a math.r", async () => {
            expect(await evaluate("math.tanh 0.5")).to.be.Numb(Math.tanh(0.5));
        });
        
        it("should return Undefined Number if the argument is not a math.r", async () => {
            expect(await evaluate("math.tanh 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("math.tanh(0.4, 0.5, 1)")).to.be.Numb(Math.tanh(0.4));
        });            
    });

    describe("math.trunc - function", () => {
        
        it("should return the integer part of a math.r", async () => {

            expect(await evaluate("math.trunc 12.345")).to.be.Numb(12);
            expect(await evaluate("math.trunc 6.789 ")).to.be.Numb(6);
            expect(await evaluate("math.trunc 10.5  ")).to.be.Numb(10);

            expect(await evaluate("math.trunc(-12.345)")).to.be.Numb(-12);
            expect(await evaluate("math.trunc(-6.789) ")).to.be.Numb(-6);
            expect(await evaluate("math.trunc(-10.5)  ")).to.be.Numb(-10);
        });
        
        it("should return Undefined Number if the argument is not a math.r", async () => {
            expect(await evaluate("math.trunc 'abc'")).to.be.Undefined("Number");
        });

        it("should apply the first item only, if the argument is a truple", async () => {
            expect(await evaluate("math.trunc(12.3,1.6,2.5)")).to.be.Numb(12);
        });            
    });
});
