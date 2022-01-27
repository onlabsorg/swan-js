time module
============================================================================

This module contains functions and constants that operate on time and
dates.

Unless specified otherwise, all the functions of this library assume that
their parameter is an item (1-d tuple). If more that one item is passed
to a function, only the first item will be used and the others will be
ignored.
  
time.now: () => Numb t
------------------------------------------------------------------------
It returns the current epoch time in seconds.
  
time.timezone: () -> Numb n
------------------------------------------------------------------------
It returns the current UTC time-zone offset in hours. For example in 
UTC+1 it will return +1.
  
time.to_date: Numb t -> Namespace d
------------------------------------------------------------------------
Given an epoch time expressed in seconds, it returns a `date` Namespace 
containg the following local date information:

- `date.year` : Numb
- `date.month` : Numb between 1 (January) and 12 (December)
- `date.day` : Numb between 1 and 31
- `date.hours` : Numb between 0 and 23
- `date.minutes` : Numb between 0 and 59
- `date.seconds` : Numb between 0.000 and 59.999
  
time.to_UTC_date: Numb t -> Namespace d
------------------------------------------------------------------------
Given an epoch time expressed in seconds, it returns a `date` Namespace 
containg the following UTC date information:

- `date.year` : Numb
- `date.month` : Numb between 1 (January) and 12 (December)
- `date.day` : Numb between 1 and 31
- `date.hours` : Numb between 0 and 23
- `date.minutes` : Numb between 0 and 59
- `date.seconds` : Numb between 0.000 and 59.999
  
time.from_date: Namespace d -> Numb t
------------------------------------------------------------------------
Given a local date namespace, it returns the correspondign epoch time 
expressed in seconds.
  
time.from_UTC_date: Namespace d -> Numb t
------------------------------------------------------------------------
Given an UTC date namespace, it returns the correspondign epoch time 
expressed in seconds.
  
time.to_ISO_string: Numb t -> Text d
------------------------------------------------------------------------
Given an epoch time in seconds, it returns its ISO string representation.
For example:

```
time = time.to_ISO_string(1639513675.900)
// returns "2021-12-14T20:27:55.900Z"
```
  
time.from_string: Text d -> Numb t
------------------------------------------------------------------------
Returns an epoch time in seconds given a date string representation.
For example:

```
time = time.from_string("2021-12-14T20:27:55.900Z")   
// returns 1639513675.900 s
```
  
time.week_day: Numb t -> Numb wd
------------------------------------------------------------------------
Given an epoch time, it returns the day of the week of the corresponding, 
date in the loacal timezone. Sunday is 0, monday is 1, tuesday is 2, etc.
For example:

```
time.week_day(1639513675.900)   // returns 2 for Tuesday
```
  
time.week_number: Numb t -> Numb w
------------------------------------------------------------------------
Given an epoch time, it returns the week number of the corresponding, 
date in the loacal timezone. For example:

```
time.week_number(1639513675.900)   // returns 50
```
  

