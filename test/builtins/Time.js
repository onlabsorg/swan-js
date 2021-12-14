const {expect} = require("chai");
const {Time} = require("../../lib/builtins");


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
