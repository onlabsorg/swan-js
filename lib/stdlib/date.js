
module.exports = {

    __apply__: (year, month=1, day=1, hour=0, minute=0, second=0, millisecond=0) => Number(new Date(year, month-1, day, hour, minute, second, millisecond)),
    parse: str => Number(Date.parse(str)),
    stringify: date => D(date).toISOString(),
    now: () => Date.now(),
    year: date => D(date).getFullYear(),
    month: date => D(date).getMonth()+1,
    week: date => {
        date = new Date(Number(date));
        date.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year.
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        // January 4 is always in week 1.
        var week1 = new Date(date.getFullYear(), 0, 4);
        // Adjust to Thursday in week 1 and count number of weeks from date to week1.
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    },
    weekDay: date => D(date).getDay(),
    day: date => D(date).getDate(),
    hours: date => D(date).getHours(),
    minutes: date => D(date).getMinutes(),
    seconds: date => D(date).getSeconds(),
    milliseconds: date => D(date).getMilliseconds(),
    timezone: -(new Date()).getTimezoneOffset()/60,

    UTC: {
        __apply__: (year, month=1, day=1, hour=0, minute=0, second=0, millisecond=0) => Date.UTC(year, month-1, day, hour, minute, second, millisecond),
        year: date => D(date).getUTCFullYear(),
        month: date => D(date).getUTCMonth()+1,
        weekDay: date => D(date).getUTCDay(),
        day: date => D(date).getUTCDate(),
        hours: date => D(date).getUTCHours(),
        minutes: date => D(date).getUTCMinutes(),
        seconds: date => D(date).getUTCSeconds(),
        milliseconds: date => D(date).getUTCMilliseconds(),
    }
};

const D = date => new Date(date);
