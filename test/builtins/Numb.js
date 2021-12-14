const {expect} = require("chai");
const {Numb} = require("../../lib/builtins");



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

