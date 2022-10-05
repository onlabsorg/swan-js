/**
 *  time module
 *  ============================================================================
 *  
 *  This module contains functions and constants that operate on time and
 *  dates.
 *  
 *  Unless specified otherwise, all the functions of this library assume that
 *  their parameter is an item (1-d tuple). If more that one item is passed
 *  to a function, only the first item will be used and the others will be
 *  ignored.
 */

module.exports = types => {
    const time = {};
    
    const isNumb = x => types.wrap(x) instanceof types.Numb;
    const isText = x => types.wrap(x) instanceof types.Text;
    const isNamespace = x => types.wrap(x) instanceof types.Namespace;
    
    const undefined_text = new types.Undefined("Text");
    const undefined_date = new types.Undefined("Date");


    /**
     *  `time.now: () => Numb t`
     *  ------------------------------------------------------------------------
     *  It returns the current epoch time in seconds.
     */
    time.now = () => Date.now() / 1000;


    /**
     *  `time.timezone: () -> Numb n`
     *  ------------------------------------------------------------------------
     *  It returns the current UTC time-zone offset in hours. For example in 
     *  UTC+1 it will return +1.
     */
    time.timezone = () => -(new Date()).getTimezoneOffset() / 60;
    
    
    /**
     *  `time.to_date: Numb t -> Namespace d`
     *  ------------------------------------------------------------------------
     *  Given an epoch time expressed in seconds, it returns a `date` Namespace 
     *  containg the following local date information:
     *  
     *  - `date.year` : Numb
     *  - `date.month` : Numb between 1 (January) and 12 (December)
     *  - `date.day` : Numb between 1 and 31
     *  - `date.hours` : Numb between 0 and 23
     *  - `date.minutes` : Numb between 0 and 59
     *  - `date.seconds` : Numb between 0.000 and 59.999
     */
    time.to_date = t => {
        if (!isNumb(t)) return undefined_date;
        const date = new Date(t*1000);
        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            hours: date.getHours(),
            minutes: date.getMinutes(),
            seconds: date.getSeconds() + date.getMilliseconds() / 1000,
        }
    }

    
    /**
     *  `time.to_UTC_date: Numb t -> Namespace d`
     *  ------------------------------------------------------------------------
     *  Given an epoch time expressed in seconds, it returns a `date` Namespace 
     *  containg the following UTC date information:
     *  
     *  - `date.year` : Numb
     *  - `date.month` : Numb between 1 (January) and 12 (December)
     *  - `date.day` : Numb between 1 and 31
     *  - `date.hours` : Numb between 0 and 23
     *  - `date.minutes` : Numb between 0 and 59
     *  - `date.seconds` : Numb between 0.000 and 59.999
     */
    time.to_UTC_date = t => {
        if (!isNumb(t)) return undefined_date;
        const date = new Date(t*1000);
        return {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1,
            day: date.getUTCDate(),
            hours: date.getUTCHours(),
            minutes: date.getUTCMinutes(),
            seconds: date.getUTCSeconds() + date.getUTCMilliseconds() / 1000,
        }
    },
    

    /**
     *  `time.from_date: Namespace d -> Numb t`
     *  ------------------------------------------------------------------------
     *  Given a local date namespace, it returns the correspondign epoch time 
     *  expressed in seconds.
     */
    time.from_date = date => {
        if (!isNamespace(date)) return NaN;
        const seconds = date.seconds ? Math.trunc(date.seconds) : 0;
        const milliseconds = Math.round((date.seconds - seconds) * 1000);
        return Number(new Date(
            date.year || 0,
            (date.month || 1) - 1,
            date.day || 1,
            date.hours || 0,
            date.minutes || 0,
            seconds,
            milliseconds
        )) / 1000;
    },

    
    /**
     *  `time.from_UTC_date: Namespace d -> Numb t`
     *  ------------------------------------------------------------------------
     *  Given an UTC date namespace, it returns the correspondign epoch time 
     *  expressed in seconds.
     */
    time.from_UTC_date = date => {
        if (!isNamespace(date)) return NaN;
        const seconds = date.seconds ? Math.trunc(date.seconds) : 0;
        const milliseconds = Math.round((date.seconds - seconds) * 1000);
        return Number(Date.UTC(
            date.year || 0,
            (date.month || 1) - 1,
            date.day || 1,
            date.hours || 0,
            date.minutes || 0,
            seconds,
            milliseconds
        )) / 1000;
    },


    /**
     *  `time.to_ISO_string: Numb t -> Text d`
     *  ------------------------------------------------------------------------
     *  Given an epoch time in seconds, it returns its ISO string representation.
     *  For example:
     *  
     *  ```
     *  time = time.to_ISO_string(1639513675.900)
     *  // returns "2021-12-14T20:27:55.900Z"
     *  ```
     */
    time.to_ISO_string = t => isNumb(t) ? new Date(t*1000).toISOString() : undefined_text;
    

    /**
     *  `time.from_string: Text d -> Numb t`
     *  ------------------------------------------------------------------------
     *  Returns an epoch time in seconds given a date string representation.
     *  For example:
     *  
     *  ```
     *  time = time.from_string("2021-12-14T20:27:55.900Z")   
     *  // returns 1639513675.900 s
     *  ```
     */
    time.from_string = s => isText(s) ? Number( Date.parse(s) ) / 1000 : NaN;
    

    /**
     *  `time.week_day: Numb t -> Numb wd`
     *  ------------------------------------------------------------------------
     *  Given an epoch time, it returns the day of the week of the corresponding, 
     *  date in the loacal timezone. Sunday is 0, monday is 1, tuesday is 2, etc.
     *  For example:
     *  
     *  ```
     *  time.week_day(1639513675.900)   // returns 2 for Tuesday
     *  ```
     */
    time.week_day = t => isNumb(t) ? new Date(t*1000).getDay() : NaN;
    

    /**
     *  `time.week_number: Numb t -> Numb w`
     *  ------------------------------------------------------------------------
     *  Given an epoch time, it returns the week number of the corresponding, 
     *  date in the loacal timezone. For example:
     *  
     *  ```
     *  time.week_number(1639513675.900)   // returns 50
     *  ```
     */
    time.week_number = t => {
        if (!isNumb(t)) return NaN;
        const date = new Date(t*1000);
        date.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year.
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        // January 4 is always in week 1.
        var week1 = new Date(date.getFullYear(), 0, 4);
        // Adjust to Thursday in week 1 and count number of weeks from date to week1.
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);        
    };
    
    
    return time;  
}
