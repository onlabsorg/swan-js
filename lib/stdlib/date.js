/**
 *  date - swan stdlib module
 *  ============================================================================
 *  Contains functions to handle date and time.
 */


module.exports = {

    /**
     *  date - function
     *  ------------------------------------------------------------------------
     *  Creates a date given all the date components expressed in the local
     *  timezone.
     *  ```
     *  dt = date(y, m, d, h, min, s, ms)
     *  ```
     *  - `y` is the year in the local timezone
     *  - `m` is the month in the local timezone (1:January, ..., 12:December)
     *  - `d` is the day in the local timezone
     *  - `h` is the hour in the local timezone
     *  - `min` is the minute in the local timezone
     *  - `s` is the number of seconds
     *  - `ms` is the number of milliseconds
     *  - `dt` is the number of milliseconds from the epoch (Jan 1, 1970)
     */
    __apply__: (y, m=1, d=1, h=0, min=0, s=0, ms=0) => Number(new Date(y, m-1, d, h, min, s, ms)),


    /**
     *  date.timezone - number
     *  ------------------------------------------------------------------------
     *  It contains the current time zone in hours. For example in UTC+1 it
     *  will hold the value +1.
     */
    timezone: -(new Date()).getTimezoneOffset()/60,


    /**
     *  date.parse - function
     *  ------------------------------------------------------------------------
     *  Creates a date given its string representation.
     *  ```
     *  dt = date.parse(dstr)
     *  ```
     *  - `dstr` is a string rapresentation of the date to be created (e.g. `'2021-02-27T10:30:45.327'`)
     *  - `dt` is the number of milliseconds from the epoch (Jan 1, 1970)
     */
    parse: str => Number(Date.parse(str)),


    /**
     *  date.stringify - function
     *  ------------------------------------------------------------------------
     *  Given a date in ms, it returns its ISO string representation
     *  ```
     *  dstr = date.stringify(dt)
     *  ```
     */
    stringify: date => D(date).toISOString(),


    /**
     *  date.now - function
     *  ------------------------------------------------------------------------
     *  It returns the current date in ms from the epoch.
     *  ```
     *  dt = date.now()
     *  ```
     */
    now: () => Date.now(),


    /**
     *  date.year - function
     *  ------------------------------------------------------------------------
     *  It returns the year of a given date, in the loacal timezone.
     *  ```
     *  y = date.year(dt)
     *  ```
     */
    year: date => D(date).getFullYear(),


    /**
     *  date.month - function
     *  ------------------------------------------------------------------------
     *  It returns the month of a given date, in the loacal timezone. January is 1,
     *  Febrary is 2, etc.
     *  ```
     *  m = date.month(dt)
     *  ```
     */
    month: date => D(date).getMonth()+1,


    // Return the year week number of a give date
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


    /**
     *  date.weekDay - function
     *  ------------------------------------------------------------------------
     *  It returns the day of the week of a given date, in the loacal timezone.
     *  Sunday is 0, monday is 1, tuesday is 2, etc.
     *  ```
     *  wd = date.weekDay(dt)
     *  ```
     */
    weekDay: date => D(date).getDay(),


    /**
     *  date.day - function
     *  ------------------------------------------------------------------------
     *  It returns the month day of a given date, in the loacal timezone.
     *  ```
     *  d = date.day(dt)
     *  ```
     */
    day: date => D(date).getDate(),


    /**
     *  date.hours - function
     *  ------------------------------------------------------------------------
     *  It returns the hour a given date, in the loacal timezone.
     *  ```
     *  h = date.day(dt)
     *  ```
     */
    hours: date => D(date).getHours(),


    /**
     *  date.minutes - function
     *  ------------------------------------------------------------------------
     *  It returns the minutes of a given date, in the loacal timezone.
     *  ```
     *  min = date.minutes(dt)
     *  ```
     */
    minutes: date => D(date).getMinutes(),


    /**
     *  date.seconds - function
     *  ------------------------------------------------------------------------
     *  It returns the seconds of a given date, in the loacal timezone.
     *  ```
     *  s = date.seconds(dt)
     *  ```
     */
    seconds: date => D(date).getSeconds(),


    /**
     *  date.milliseconds - function
     *  ------------------------------------------------------------------------
     *  It returns the milliseconds of a given date, in the loacal timezone.
     *  ```
     *  ms = date.milliseconds(dt)
     *  ```
     */
    milliseconds: date => D(date).getMilliseconds(),


    UTC: {

        /**
         *  date.UTC - function
         *  ------------------------------------------------------------------------
         *  Creates a date given all the date components expressed in the UTC-0
         *  timezone.
         *  ```
         *  dt = date.UTC(y, m, d, h, min, s, ms)
         *  ```
         *  - `y` is the year in the local timezone
         *  - `m` is the month in the local timezone (1:January, ..., 12:December)
         *  - `d` is the day in the local timezone
         *  - `h` is the hour in the local timezone
         *  - `min` is the minute in the local timezone
         *  - `s` is the number of seconds
         *  - `ms` is the number of milliseconds
         *  - `dt` is the number of milliseconds from the epoch (Jan 1, 1970)
         */
        __apply__: (y, m=1, d=1, h=0, min=0, s=0, ms=0) => Date.UTC(y, m-1, d, h, min, s, ms),


        /**
         *  date.UTC.year - function
         *  ------------------------------------------------------------------------
         *  It returns the year of a given date, in the UTC-0 timezone.
         *  ```
         *  y = date.UTC.year(dt)
         *  ```
         */
        year: date => D(date).getUTCFullYear(),


        /**
         *  date.UTC.month - function
         *  ------------------------------------------------------------------------
         *  It returns the month of a given date, in the UTC-0 timezone. January is 1,
         *  Febrary is 2, etc.
         *  ```
         *  m = date.UTC.month(dt)
         *  ```
         */
        month: date => D(date).getUTCMonth()+1,


        /**
         *  date.UTC.weekDay - function
         *  ------------------------------------------------------------------------
         *  It returns the day of the week of a given date, in the UTC-0 timezone.
         *  Sunday is 0, monday is 1, tuesday is 2, etc.
         *  ```
         *  wd = date.UTC.weekDay(dt)
         *  ```
         */
        weekDay: date => D(date).getUTCDay(),


        /**
         *  date.UTC.day - function
         *  ------------------------------------------------------------------------
         *  It returns the month day of a given date, in the UTC-0 timezone.
         *  ```
         *  d = date.day(dt)
         *  ```
         */
        day: date => D(date).getUTCDate(),


        /**
         *  date.UTC.hours - function
         *  ------------------------------------------------------------------------
         *  It returns the hour a given date, in the UTC-0 timezone.
         *  ```
         *  h = date.UTC.day(dt)
         *  ```
         */
        hours: date => D(date).getUTCHours(),


        /**
         *  date.UTC.minutes - function
         *  ------------------------------------------------------------------------
         *  It returns the minutes of a given date, in the UTC-0 timezone.
         *  ```
         *  min = date.UTC.minutes(dt)
         *  ```
         */
        minutes: date => D(date).getUTCMinutes(),


        /**
         *  date.UTC.seconds - function
         *  ------------------------------------------------------------------------
         *  It returns the seconds of a given date, in the UTC-0 timezone.
         *  ```
         *  s = date.UTC.seconds(dt)
         *  ```
         */
        seconds: date => D(date).getUTCSeconds(),


        /**
         *  date.UTC.milliseconds - function
         *  ------------------------------------------------------------------------
         *  It returns the milliseconds of a given date, in the UTC-0 timezone.
         *  ```
         *  ms = date.UTC.milliseconds(dt)
         *  ```
         */
        milliseconds: date => D(date).getUTCMilliseconds(),
    }
};

const D = date => new Date(date);
