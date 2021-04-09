var expect = require("chai").expect;
var loadlib = require("../../lib/modules").require;

describe("math module", () => {

    describe("math.E", () => {
        it("should return the Euler's number", async () => {
            var math = await loadlib("math");
            expect(math.PI).to.equal(Math.PI);
        });
    });

    describe("math.PI", () => {
        it("should return the Pi number", async () => {
            var math = await loadlib("math");
            expect(math.PI).to.equal(Math.PI);
        });
    });

    describe("math.abs(x)", () => {
        it("should return the absolute value of a number", async () => {
            var math = await loadlib("math");
            expect(await math.abs(-123.45)).to.equal(123.45);
            expect(await math.abs(0)).to.equal(0);
            expect(await math.abs(123.45)).to.equal(123.45);
        });
    });

    describe("math.acos(x)", () => {
        it("should return the arc-cosine of a number", async () => {
            var math = await loadlib("math");
            expect(await math.acos(0.5)).to.equal(Math.acos(0.5));
        });
    });

    describe("math.acosh(x)", () => {
        it("should return the arc-hyperbolic-cosine of a number", async () => {
            var math = await loadlib("math");
            expect(await math.acosh(2)).to.equal(Math.acosh(2));
        });
    });

    describe("math.asin(x)", () => {
        it("should return the arc-sine of a number", async () => {
            var math = await loadlib("math");
            expect(await math.asin(0.5)).to.equal(Math.asin(0.5));
        });
    });

    describe("math.asinh(x)", () => {
        it("should return the arc-hyperbolic-sine of a number", async () => {
            var math = await loadlib("math");
            expect(await math.asinh(2)).to.equal(Math.asinh(2));
        });
    });

    describe("math.atan(x)", () => {
        it("should return the arc-tangent of a number", async () => {
            var math = await loadlib("math");
            expect(await math.atan(0.5)).to.equal(Math.atan(0.5));
        });
    });

    describe("math.atanh(x)", () => {
        it("should return the arc-hyperbolic-tangent of a number", async () => {
            var math = await loadlib("math");
            expect(await math.atanh(0.5)).to.equal(Math.atanh(0.5));
        });
    });

    describe("math.ceil(x)", () => {
        it("should round up a number to the closest largest integer", async () => {
            var math = await loadlib("math");
            expect(math.ceil(12.345)).to.equal(13);
            expect(math.ceil(-12.345)).to.equal(-12);
        });
    });

    describe("math.cos(x)", () => {
        it("should return the cosine of a number", async () => {
            var math = await loadlib("math");
            expect(math.cos(0.5)).to.equal(Math.cos(0.5));
        });
    });

    describe("math.cosh(x)", () => {
        it("should return the hyperbolic cosine of a number", async () => {
            var math = await loadlib("math");
            expect(math.cosh(0.5)).to.equal(Math.cosh(0.5));
        });
    });

    describe("math.exp(x)", () => {
        it("should return E to the power of a number", async () => {
            var math = await loadlib("math");
            expect(math.exp(0.5)).to.equal(math.E**0.5);
        });
    });

    describe("math.floor(x)", () => {
        it("should round up a number to the closest smallest integer", async () => {
            var math = await loadlib("math");
            expect(math.floor(12.345)).to.equal(12);
            expect(math.floor(-12.345)).to.equal(-13);
        });
    });

    describe("math.log(x)", () => {
        it("should return the natural logaritm of a number", async () => {
            var math = await loadlib("math");
            expect(await math.log(2)).to.equal(Math.log(2));
            expect(await math.log(Math.E**2)).to.equal(2);
        });
    });

    describe("math.log10(x)", () => {
        it("should return the logaritm with base 10 of a number", async () => {
            var math = await loadlib("math");
            expect(await math.log10(2)).to.equal(Math.log10(2));
            expect(await math.log10(100)).to.equal(2);
        });
    });

    describe("math.max(x1, x2, x3, ...)", () => {
        it("should return the maximum of a list of numbers", async () => {
            var math = await loadlib("math");
            expect(await math.max(23,1,13,56,22,-108)).to.equal(56);
        });
    });

    describe("math.min(x1, x2, x3, ...)", () => {
        it("should return the minimum of a list of numbers", async () => {
            var math = await loadlib("math");
            expect(await math.min(23,1,13,56,22,-108)).to.equal(-108);
        });
    });

    describe("math.random(x)", () => {
        it("should return a random number between 0 and x", async () => {
            var math = await loadlib("math");

            var y1 = await math.random(2);
            expect(0 <= y1 && y1 <= 2).to.be.true;

            var y2 = await math.random(2);
            var y3 = await math.random(2);

            expect(y1).to.not.equal(y2);
            expect(y1).to.not.equal(y3);
            expect(y2).to.not.equal(y3);
        });
    });

    describe("math.round(x)", () => {
        it("should round the given number to the closest integer", async () => {
            var math = await loadlib("math");

            expect(await math.round(12.345)).to.equal(12);
            expect(await math.round(6.789)).to.equal(7);
            expect(await math.round(10.5)).to.equal(11);

            expect(await math.round(-12.345)).to.equal(-12);
            expect(await math.round(-6.789)).to.equal(-7);
            expect(await math.round(-10.5)).to.equal(-10);
        });
    });

    describe("math.sin(x)", () => {
        it("should return the sine of a number", async () => {
            var math = await loadlib("math");
            expect(math.sin(0.5)).to.equal(Math.sin(0.5));
        });
    });

    describe("math.sinh(x)", () => {
        it("should return the hyperbolic sine of a number", async () => {
            var math = await loadlib("math");
            expect(math.sinh(0.5)).to.equal(Math.sinh(0.5));
        });
    });

    describe("math.sqrt(x)", () => {
        it("should return the square root of a number", async () => {
            var math = await loadlib("math");
            expect(await math.sqrt(4)).to.equal(2);
            expect(await math.sqrt(34.5)).to.equal(34.5**0.5);
        });
    });

    describe("math.tan(x)", () => {
        it("should return the tangent of a number", async () => {
            var math = await loadlib("math");
            expect(math.tan(0.5)).to.equal(Math.tan(0.5));
        });
    });

    describe("math.tanh(x)", () => {
        it("should return the hyperbolic tangent of a number", async () => {
            var math = await loadlib("math");
            expect(math.tanh(0.5)).to.equal(Math.tanh(0.5));
        });
    });

    describe("math.trunc(x)", () => {
        it("should return the integer part of a number", async () => {
            var math = await loadlib("math");

            expect(await math.trunc(12.345)).to.equal(12);
            expect(await math.trunc(6.789)).to.equal(6);
            expect(await math.trunc(10.5)).to.equal(10);

            expect(await math.trunc(-12.345)).to.equal(-12);
            expect(await math.trunc(-6.789)).to.equal(-6);
            expect(await math.trunc(-10.5)).to.equal(-10);
        });
    });

    describe("math.hex(s)", () => {
        it("should return a number given his hexadecimal string representation", async () => {
            var math = await loadlib("math");
            expect(await math.hex('FF')).to.equal(255);
        });
    });

    describe("math.oct(s)", () => {
        it("should return a number given his octal string representation", async () => {
            var math = await loadlib("math");
            expect(await math.oct('77')).to.equal(63);
        });
    });

    describe("math.bin(s)", () => {
        it("should return a number given his binary string representation", async () => {
            var math = await loadlib("math");
            expect(await math.bin('11')).to.equal(3);
        });
    });
});
