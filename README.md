SetlistJS
==========

[![Build Status](https://travis-ci.org/withmandala/setlist.svg?branch=master)](https://travis-ci.org/withmandala/setlist)
[![Coverage Status](https://coveralls.io/repos/github/withmandala/setlist/badge.svg?branch=master)](https://coveralls.io/github/withmandala/setlist?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/withmandala/setlist/badge.svg)](https://snyk.io/test/github/withmandala/setlist)

Setlist will sequential-ish your asynchronous code with ES6 Generator Function
and Promise - Say goodbye to indentation hell.

## TOC

- [Setup](#setup)
- [Getting Started](#getting-started)
- [Setlist Chain](#setlist-chain)
- [Wrapping Callback Function](#wrapping-callback-functions-with-promise)
- [Transform Generator Function Class with Promise](#wrapping-class-or-object-with-promise)
- [Create Callback Handler with Generator Function](#create-callback-handler-using-generator-function)
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
const run = require('setlist');
```

## Getting Started

This topics requires you to understand the basics of **Promise**
<https://www.promisejs.org>

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

> **RULE OF THUMB**  
> There is always a `yield` keyword before calling
> **asynchronous function** and **generator function**.  
> **Do not** use `yield` when working with synchronous function.

Then, run the `yeayFunction()` with the `run()` function.

```javascript
run(yeayFunction('Joe'));
```

Done. No more indentation hell, and of course, no callback hells.

## Setlist Chain

You can chain multiple generator function execution with `run(...).next()`.

```javascript
// Chain multiple execution with .next()
run(yeayFunction('Joe'))
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
// Execute the parent generator function
run(taskList());
```

## Wrapping Callback Functions with Promise

Setlist does not work with callback functions. So, in order to use your
callback functions from the past, you can wrap them with `run.promisify()`.

For example, the `setlist` promisify will wrap the file system `fs.readFile()`
function so it can be chained in our generator function.

```javascript
// Import fs library
const fs = require('fs');

// Create generator function
function* readConfig(filename) {
    // Get file content
    let content = yield run.promisify(fs.readFile)(filename);

    // Do something with it
    return processFileContent(content);
}

// Or do with promise style
run.promisify(fs.readFile)(filename)
    .then(function(content) {
        return processFileContent(content);
    });
```

## Wrapping Class or Object with Promise

If you are planning to write down classes or objects with generator function,
you can transform them into Promise on runtime by calling `run.proxify()`
and pass in your class or object after the class definition.

For class object,it will also automatically transform the prototype object.
Note that you should convert extended class with the `proxify` if you define
new generator function in the extended class.

```javascript
class baseClass {
    * method() {
        ...
    }

    static * staticMethod() {
        ...
    }
}

// Convert base class
run.proxify(baseClass);

class extendedClass extends baseClass {
    * extMethod() {
        ...
    }
}

// Convert extended class
run.proxify(extendedClass);

// No need to convert because there is no generator functions
class anotherClass extends baseClass {
    syncMethod() {
        ...
    }
}

// But this calls will return promise because we already
// transform the base class
anotherClass.staticMethod();
```

## Create Callback Handler using Generator Function

Some function that require callback handler, such as REPL eval function,
are more reliably written with generator function, at least in my opinion.

To wrap the generator function so it can be used with the callback handler
you can use `run.callbackify()` function.

```javascript
// Import REPL library
const repl = require('repl');

// Create repl eval callback handler
function* evalHandle(cmd) {
    // Get result from evaluated code
    let result;
    try {
        let result = eval(cmd);
    } catch(error) {
        // Get recoverable status (See REPL documentation from Node.js)
        if (isRecoverable(error)) {
            return REPL.Recoverable(error);
        } else {
            // You can just throw error here and the callbackify will properly
            // pass the error to the callback
            throw error;
        }
    }

    // Return result to the callback if the eval suceeds
    return result;
}

// Start repl session
repl.start({ eval: run.callbackify(evalHandle) });
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

Copyright (c) 2016 Fadhli Dzil Ikram. SetlistJS is MIT licensed.
