var expect = require("chai").expect;
var date = require('../../lib/stdlib/date');

describe("date module", function () {

    describe("date(y, m, d, h, min, sec, ms)", function () {
        it("should return the number of milliseconds from epoch in UTC", async function () {
            var d = new Date(1977,1,26,1,50,23,560);
            expect(await date.__apply__(1977,2,26,1,50,23,560)).to.equal(Number(d));
        });
    });

    describe("date.parse(str)", function () {
        it("should convert the date string representation to the number of milliseconds from epoch", async function () {
            var d = new Date(1977,1,26,1,50,23,560);
            var dstr = d.toISOString();
            expect(await date.parse(dstr)).to.equal(Number(d));
        });
    });

    describe("date.now()", function () {
        it("should convert current date in milliseconds from epoch", async function () {
            var d = new Date(1977,1,26,1,50,23,560);
            var dstr = d.toISOString();
            expect(await date.now() - Date.now() > -1000).to.be.true;
        });
    });

    describe("date.stringify(d)", function () {
        it("should return the ISO representation of the given date", async function () {
            var d = await date.__apply__(1977,2,26,1,50,23,560);
            expect(await date.stringify(d)).to.equal("1977-02-26T00:50:23.560Z");
        });
    });

    describe("date.year(d)", () => {
        it("should return the year of the given date", async function () {
            var d = await date.__apply__(1977,2,26,1,50,23,560);
            expect(date.year(d)).to.equal(1977);
        });
    });

    describe("date.month(d)", () => {
        it("should return the month of the given date", async function () {
            var d = await date.__apply__(1977,2,26,1,50,23,560);
            expect(date.month(d)).to.equal(2);
        });
    });

    describe("date.week(d)", () => {
        it("should return the ISO year week number of the given date interpreted as local date", async function () {
            var d = await date.__apply__(2021,2,1,1,0,0,0);
            expect(await date.week(d)).to.equal(5);
        });
    });

    describe("date.day(d)", () => {
        it("should return the day of the given date", async function () {
            var d = await date.__apply__(1977,2,26,1,50,23,560);
            expect(date.day(d)).to.equal(26);
        });
    });

    describe("date.hours(d)", () => {
        it("should return the hours of the given date", async function () {
            var d = await date.__apply__(1977,2,26,1,50,23,560);
            expect(date.hours(d)).to.equal(1);
        });
    });

    describe("date.minutes(d)", () => {
        it("should return the minutes of the given date", async function () {
            var d = await date.__apply__(1977,2,26,1,50,23,560);
            expect(date.minutes(d)).to.equal(50);
        });
    });

    describe("date.seconds(d)", () => {
        it("should return the seconds of the given date", async function () {
            var d = await date.__apply__(1977,2,26,1,50,23,560);
            expect(date.seconds(d)).to.equal(23);
        });
    });

    describe("date.milliseconds(d)", () => {
        it("should return the milliseconds of the given date", async function () {
            var d = await date.__apply__(1977,2,26,1,50,23,560);
            expect(date.milliseconds(d)).to.equal(560);
        });
    });

    describe("date.timezone", () => {
        it("should return the local timezone in hours", async function () {
            expect(-date.timezone*60).to.equal((new Date()).getTimezoneOffset());
        });
    });

    describe("date.UTC(y, m, d, h, min, sec, ms)", function () {
        it("should return the number of milliseconds from epoch in UTC", async function () {
            var d = Date.UTC(1977,1,26,1,50,23,560);
            expect(await date.UTC.__apply__(1977,2,26,1,50,23,560)).to.equal(Number(d));
        });
    });

    describe("date.UTC.year(d)", () => {
        it("should return the UTC year of the given date", async function () {
            var d = await date.UTC.__apply__(1977,2,26,1,50,23,560);
            expect(date.UTC.year(d)).to.equal(1977);
        });
    });

    describe("date.UTC.month(d)", () => {
        it("should return the month of the given date", async function () {
            var d = await date.UTC.__apply__(1977,2,26,1,50,23,560);
            expect(date.UTC.month(d)).to.equal(2);
        });
    });

    describe("date.UTC.day(d)", () => {
        it("should return the day of the given date", async function () {
            var d = await date.UTC.__apply__(1977,2,26,1,50,23,560);
            expect(date.UTC.day(d)).to.equal(26);
        });
    });

    describe("date.UTC.hours(d)", () => {
        it("should return the UTC hours of the given date", async function () {
            var d = await date.UTC.__apply__(1977,2,26,1,50,23,560);
            expect(date.UTC.hours(d)).to.equal(1);
        });
    });

    describe("date.UTC.minutes(d)", () => {
        it("should return the UTC minutes of the given date", async function () {
            var d = await date.UTC.__apply__(1977,2,26,1,50,23,560);
            expect(date.UTC.minutes(d)).to.equal(50);
        });
    });

    describe("date.UTC.seconds(d)", () => {
        it("should return the UTC seconds of the given date", async function () {
            var d = await date.UTC.__apply__(1977,2,26,1,50,23,560);
            expect(date.UTC.seconds(d)).to.equal(23);
        });
    });

    describe("date.UTC.milliseconds(d)", () => {
        it("should return the UTC milliseconds of the given date", async function () {
            var d = await date.UTC.__apply__(1977,2,26,1,50,23,560);
            expect(date.UTC.milliseconds(d)).to.equal(560);
        });
    });
});
