SetlistJS
==========

[![Build Status](https://travis-ci.org/withmandala/setlist.svg?branch=master)](https://travis-ci.org/withmandala/setlist)

Setlist will sequential-ish your asynchronous code with ES6 Generator Function
and Promise - Say goodbye to indentation hell.

## TOC

- [Setup](#setup)
- [Getting Started](#getting-started)
- [Setlist Chain](#setlist-chain)
- [Setlist Timeout](#setlist-timeout)
- [Testing](#testing)
- [Bugs](#bugs)
- [License](#license)

## Setup

Install it with `npm`.

```
npm install --save setlist
```

Then use them in your project by requiring `setlist`.

```javascript
const List = require('setlist');
```

Now, you are good to go!

## Getting Started

This topics requires you to understand the basics of **Promise**
<https://www.promisejs.org>

> **RULE OF THUMB**  
> There is always a `yield` keyword before calling
> **asynchronous function** and **generator function**.  
> **Do not** use `yield` when working with synchronous function.

This is an example of function using Promises to handle some asynchronous
operation.

```javascript
// Suppose that getDataFromDb is returning promises
getDataFromDb('myTable', name)

    .then(function(data) {
        // We got the data, but the next function is callback only
        // so we have to wrap it up with promises
        return new Promise(function(resolve) {
            getPeopleWithCallback(data, resolve);
        });
    })

    .then(function(people) {
        // We now get the people, now let's decide
        if ('good' in people) {
            return 'yeay';
        }
        // Lets clean up things first
        else {
            // Suppose that this function is returning promises
            return cleanUpPeople(people).then(function() {
                return 'yeay after clean';
            });
        }
    });
```

Meh. Let's write that again in Setlist.

```javascript
function* yeayFunction(name) {
    // Get the data from Db (promise function)
    let data = yield getDataFromDb('myTable', name);

    // Get people with callback function
    // Setlist only accepts Promises, so we should promisify it with
    // List.async() function
    let people = yield List.async(getPeopleWithCallback)(data);

    // Lets decide
    if ('good' in people) {
        // Yeay it's good
        return 'yeay';
    }
    // You should cleaned up first
    else {
        yield cleanUpPeople(people);
        // Now it is okay to return
        return 'yeay after clean';
    }
}
```

Then, run the `yeayFunction()` with the `List()` function.

```javascript
List(yeayFunction('Joe'));
```

Done. No more indentation hell, and of course, no callback hells.

## Setlist Chain

You can chain multiple generator function execution with `List(...).next()`.

```javascript
// Chain multiple execution with .next()
List(yeayFunction('Joe'))
    .next(anotherFunction())
    .next(lastFunction());
```

Or, if you prefer creating new generator function, you can also call them with
yield keyword. The yield keyword also pass the return value of child generator
function to the parent.

```javascript
// Or collect them in new generator function
function* taskList() {
    let status = yield yeayFunction('Joe');
    yield processFunction(status);
    yield lastFunction();
}
// Just execute the parent generator function
List(taskList());
```

## Working with Callback Functions

In the past, asynchronous function usually equipped with callback as their last
argument. So, the execution result of async function will be passed directly
to the callback function as argument. Thus, any errors occured when the async
function should be handled manually.

```javascript
function callbackHandler(err, value, handle) {
    // Check for execution error
    if (err) {
        ...
    } else {
        callNextFunction(...);
    }
}

startProcess(callbackHandler);
```

Promisify the callback function also not helping the situation. This is mainly
caused by the promisifier only pass the `resolve()` function as the callback.
As a result, error callbacks will treated as `resolved`, not `rejected`.
Moreover, the second and third result argument will lost because resolve
function only accepts single argument.

With Setlist, you can directly `throw` error from the generator function and
Setlist will indicate the parent promise as rejected. And yes, the return
of calling `List()` is Promise object so you can chain them with `.catch()`
to catch errors.

The `List.async()` also automatically packs the arguments from callback with
array if the argument count is 2 or more.

```javascript
function* taskList() {
    // Run callback function
    let status = yield List.async(startProcess)();

    // Now the status var holds array containing 3 items
    // and arranged as [err, value, handle]
    if (status[0]) { // Err argument
        // Directly throw error, the execution of taskList() will not continue
        throw status[0];
    }

    // Continue to the next step
    yield callNextFunction(...);
}

List(taskList())
    .catch(function(err) {
        // Handle error here
        ...
    });
```

Or, you can also pass the callback function directly to the yield with `bind()`
if the function require arguments beside the callback.

```javascript
// This is also okay
let status = yield startProcess.bind(null, ...);
```

## Setlist Timeout

It is possible to attach timeout to the Setlist, limiting the execution time
and return promise rejetion on timeout. To activate timeout, pass the time of
timeout (in ms) as the second argument of `List(..., [timeout])`

```javascript
// Setlist with time limit of 2s
List(mySetlist(), 2000);

// Setlist without time limit
List(myOtherSetlist());
```

## Testing

You can test the package by

```
npm test
```

It may not the best testing in the world as this is my first project that using
a real proper test.

## Bugs

If you encounter any issues related to the Setlist library, please report them
at <https://github.com/withmandala/setlist/issues>

## License

SetlistJS is MIT licensed.
