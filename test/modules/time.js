const expect = require("../expect");

const types = require("../../lib/types");
const parse = require("../../lib/interpreter");
const time = require("../../lib/modules/time")(types);

const evaluate = async (expression, presets={}) => {
    const context = Object.assign({time}, presets);
    return await parse(expression)(context);
}



describe("time module", () => {

    describe("time.now()", () => {
        
        it("should return the current time in seconds", async () => {
            const t1 = await evaluate("time.now()");
            const t2 = Date.now()/1000;
            expect(t1).to.be.instanceof(types.Numb);
            expect(Math.round(types.unwrap(t1),2)).to.equal(Math.round(t2,2));
        });
    });

    describe("time.timezone()", () => {
        
        it("should return the current time-zone offset in hours", async () => {
            expect(await evaluate("time.timezone()")).to.be.Numb(-(new Date()).getTimezoneOffset() / 60);
        });
    });

    describe("time.to_date(t)", () => {
        
        it("should convert the given och time (in seconds) to a local date namespace", async () => {
            expect(await evaluate("time.to_date 1642290213.284")).to.be.Namespace({
                year: 2022,
                month: 01,
                day: 16,
                hours: 0,
                minutes: 43,
                seconds: 33.284
            });
        });
        
        it("should return Undefined Date if the parameter is not a Number", async () => {
            expect(await evaluate("time.to_date 'abc'")).to.be.Undefined("Date");
        });
    });

    describe("time.to_UTC_date(t)", () => {
        
        it("should convert the given epoch time (in seconds) to a UTC date namespace", async () => {
            expect(await evaluate("time.to_UTC_date 1642290213.284")).to.be.Namespace({
                year: 2022,
                month: 01,
                day: 15,
                hours: 23,
                minutes: 43,
                seconds: 33.284
            });
        });
        
        it("should return Undefined Date if the parameter is not a Number", async () => {
            expect(await evaluate("time.to_UTC_date 'abc'")).to.be.Undefined("Date");
        });
    });

    describe("time.from_date(d)", () => {
        
        it("should convert the given local date namespace to the corresponding epoch time in seconds", async () => {
            expect(await evaluate(`time.from_date {
                year: 2022,
                month: 01,
                day: 16,
                hours: 0,
                minutes: 43,
                seconds: 33.284                
            }`)).to.be.Numb(1642290213.284);
        });
        
        it("should return Undefined Number if the parameter is not a Namespace", async () => {
            expect(await evaluate("time.from_date 'abc'")).to.be.Undefined("Number");
        });
    });

    describe("time.from_UTC_date(d)", () => {
        
        it("should convert the given UTC date namespace to the corresponding epoch time in seconds", async () => {
            expect(await evaluate(`time.from_UTC_date {
                year: 2022,
                month: 01,
                day: 15,
                hours: 23,
                minutes: 43,
                seconds: 33.284
            }`)).to.be.Numb(1642290213.284);
        });
        
        it("should return Undefined Number if the parameter is not a Namespace", async () => {
            expect(await evaluate("time.from_UTC_date 'abc'")).to.be.Undefined("Number");
        });
    });

    describe("time.to_ISO_string(t)", () => {
        
        it("should convert the give epoch time in seconds to its date string representation", async () => {
            expect(await evaluate(`time.to_ISO_string 1639513675.900`)).to.be.Text("2021-12-14T20:27:55.900Z")
        });
        
        it("should return Undefined Text if the parameter is not a Number", async () => {
            expect(await evaluate("time.to_ISO_string 'abc'")).to.be.Undefined("Text");
        });
    });

    describe("time.from_string(s)", () => {
        
        it("should convert the give date string to the corresponding epoch time in seconds", async () => {
            expect(await evaluate(`time.from_string "2021-12-14T20:27:55.900Z"`)).to.be.Numb(1639513675.900)
        });
        
        it("should return Undefined Number if the parameter is not a Text item", async () => {
            expect(await evaluate("time.from_string 10")).to.be.Undefined("Number");
        });
    });

    describe("time.week_day(t)", () => {
        
        it("should return the day of the week, given an epoch time in seconds", async () => {
            expect(await evaluate(`time.week_day 1639513675.900`)).to.be.Numb(2)
        });
        
        it("should return Undefined Number if the parameter is not a Numb item", async () => {
            expect(await evaluate("time.week_day 'abc'")).to.be.Undefined("Number");
        });
    });

    describe("time.week_number(t)", () => {
        
        it("should return the number of the week, given an epoch time in seconds", async () => {
            expect(await evaluate(`time.week_number 1639513675.900`)).to.be.Numb(50)
        });
        
        it("should return Undefined Number if the parameter is not a Numb item", async () => {
            expect(await evaluate("time.week_number 'abc'")).to.be.Undefined("Number");
        });
    });
});
