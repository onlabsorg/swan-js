date - swan stdlib module
============================================================================
Contains functions to handle date and time.
  
date.\_\_apply\_\_ - function
------------------------------------------------------------------------
Creates a date given all the date components expressed in the local
timezone.
```
dt = date(y, m, d, h, min, s, ms)
```
- `y` is the year in the local timezone
- `m` is the month in the local timezone (1:January, ..., 12:December)
- `d` is the day in the local timezone
- `h` is the hour in the local timezone
- `min` is the minute in the local timezone
- `s` is the number of seconds
- `ms` is the number of milliseconds
- `dt` is the number of milliseconds from the epoch (Jan 1, 1970)
  
date.timezone - number
------------------------------------------------------------------------
It contains the current time zone in hours. For example in UTC+1 it
will hold the value +1.
  
date.parse - function
------------------------------------------------------------------------
Creates a date given its string representation.
```
dt = date.parse(dstr)
```
- `dstr` is a string rapresentation of the date to be created (e.g. `'2021-02-27T10:30:45.327'`)
- `dt` is the number of milliseconds from the epoch (Jan 1, 1970)
  
date.stringify - function
------------------------------------------------------------------------
Given a date in ms, it returns its ISO string representation
```
dstr = date.stringify(dt)
```
  
date.now - function
------------------------------------------------------------------------
It returns the current date in ms from the epoch.
```
dt = date.now()
```
  
date.year - function
------------------------------------------------------------------------
It returns the year of a given date, in the loacal timezone.
```
y = date.year(dt)
```
  
date.month - function
------------------------------------------------------------------------
It returns the month of a given date, in the loacal timezone. January is 1,
Febrary is 2, etc.
```
m = date.month(dt)
```
  
date.weekDay - function
------------------------------------------------------------------------
It returns the day of the week of a given date, in the loacal timezone.
Sunday is 0, monday is 1, tuesday is 2, etc.
```
wd = date.weekDay(dt)
```
  
date.day - function
------------------------------------------------------------------------
It returns the month day of a given date, in the loacal timezone.
```
d = date.day(dt)
```
  
date.hours - function
------------------------------------------------------------------------
It returns the hour a given date, in the loacal timezone.
```
h = date.day(dt)
```
  
date.minutes - function
------------------------------------------------------------------------
It returns the minutes of a given date, in the loacal timezone.
```
min = date.minutes(dt)
```
  
date.seconds - function
------------------------------------------------------------------------
It returns the seconds of a given date, in the loacal timezone.
```
s = date.seconds(dt)
```
  
date.milliseconds - function
------------------------------------------------------------------------
It returns the milliseconds of a given date, in the loacal timezone.
```
ms = date.milliseconds(dt)
```
  
date.UTC.\_\_apply\_\_ - function
------------------------------------------------------------------------
Creates a date given all the date components expressed in the UTC-0
timezone.
```
dt = date.UTC(y, m, d, h, min, s, ms)
```
- `y` is the year in the local timezone
- `m` is the month in the local timezone (1:January, ..., 12:December)
- `d` is the day in the local timezone
- `h` is the hour in the local timezone
- `min` is the minute in the local timezone
- `s` is the number of seconds
- `ms` is the number of milliseconds
- `dt` is the number of milliseconds from the epoch (Jan 1, 1970)
  
date.UTC.year - function
------------------------------------------------------------------------
It returns the year of a given date, in the UTC-0 timezone.
```
y = date.UTC.year(dt)
```
  
date.UTC.month - function
------------------------------------------------------------------------
It returns the month of a given date, in the UTC-0 timezone. January is 1,
Febrary is 2, etc.
```
m = date.UTC.month(dt)
```
  
date.UTC.weekDay - function
------------------------------------------------------------------------
It returns the day of the week of a given date, in the UTC-0 timezone.
Sunday is 0, monday is 1, tuesday is 2, etc.
```
wd = date.UTC.weekDay(dt)
```
  
date.UTC.day - function
------------------------------------------------------------------------
It returns the month day of a given date, in the UTC-0 timezone.
```
d = date.day(dt)
```
  
date.UTC.hours - function
------------------------------------------------------------------------
It returns the hour a given date, in the UTC-0 timezone.
```
h = date.UTC.day(dt)
```
  
date.UTC.minutes - function
------------------------------------------------------------------------
It returns the minutes of a given date, in the UTC-0 timezone.
```
min = date.UTC.minutes(dt)
```
  
date.UTC.seconds - function
------------------------------------------------------------------------
It returns the seconds of a given date, in the UTC-0 timezone.
```
s = date.UTC.seconds(dt)
```
  
date.UTC.milliseconds - function
------------------------------------------------------------------------
It returns the milliseconds of a given date, in the UTC-0 timezone.
```
ms = date.UTC.milliseconds(dt)
```
  

