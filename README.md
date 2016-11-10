SetlistJS
==========

Setlist will sequential-ish your asynchronous code with ES6 Generator Function
and Promise. It is supposed to reduce the complexity of `Promise.then()` flow
[as demonstrated below](#why-using-setlist) by using yield keyword and
automagically return the promised value.

Setlist is licensed under the MIT license. The current version of Setlist is
v0.1.0.

## Quick Jumplist

- [Writing correct generator function](#generator-function)
- [How to execute Setlist](#execute-setlist)
- [Promisify callback function](#asynchronous-function-with-callback)
- [Set timeout to Setlist](#timeouts)

## Setup

Install it with `npm`.

    npm install --save setlist

Then import it to your project with

```javascript
const Setlist = require('setlist');
```

Now, you are good to go!

## Usage

### Getting Started with Setlist

> **RULE OF THUMB** - To minimize headache when using the Setlist, make sure
> that there is always a `yield` keyword before calling **asynchronous
> function** and **generator function**.
>
> You **should not** use `yield` when working with blocking or synchronous
> function.

#### Generator Function

First, wrap up your asynchronous function with a generator function, that is
`function* ()`. Please note that the asynchronous function should return a
promise. If not, please refer to promisify callback function section below.

**What the hell is promise anyway?** Please take a look at the
<https://www.promisejs.org>

```javascript
function* MySetlist(name) {

    // First, we want to fetch person model from db (async)
    let person = yield Person.findByName(name);

    // Then, find the job of the person (async)
    let job = yield person.findJob();

    // Then modify some code (synchronous function)
    modifyJobInformation(job, 'okay');

    // Store back the data (asynchronous)
    if (yield job.save()) {
        
        // Successfuly safe the job
        return true;

    } else {

        // Uh oh, error. Log first to the database (async)
        yield Log.write(job, 'writeError');
        // Tell user we cannot save the job
        return false;

    }

}
```

#### Execute Setlist

Finally, run your generator function by calling `Setlist()` right away! You can
chain them with ordinary promise function or with another generator function by
calling `.next()` function.

```javascript
// You can continue it with Promise based async
Setlist(MySetlist('Joe'))
    .then(...)
    .then(...)
    .catch(...);

// Or chain some generator function like a boss
Setlist(MySetlist('Joe'))
    .next(AnotherSetlist())
    .next(LastSetlist());
```

If you need the return value from calling another generator function, you can
just wrap them in a parent generator function.

```javascript
function* SubSetlistOne() {
    ...
}

function* SubSetlistTwo(param) {
    ...
}

function* ParentSetlist() {

    let result = yield SubSetlistTwo(yield SubSetlistOne());

    // Or, you can also do this

    let resultOne = yield SubSetlistOne();
    let resultTwo = yield SubSetlistTwo(resultOne);

}
```

Or, you can run multiple setlist in parallel by doing

```javascript
// This function will run concurrently
Setlist(ParallelSetlistOne());
Setlist(ParallelSetlistTwo());
```

### Why using Setlist?

Let's wrote the `MySetlist()` function entirely by just using Promise function.

```javascript
function MySetlist(name) {

    Person.findByName(name).then(function(person) {
    
        return person.findJob()

    }).then(function(job) {

        modifyJobInformation(job, 'okay');
        return job.save()

    }).then(function(saved) {

        if (saved) {
            return true;
        } else {
            return Log.write(job, 'writeError').then(function() {
                return false;
            })
        }

    });

}
```

Can you read the code? Good.

### Asynchronous Function with Callback

If your async function use callbacks, you can wrap it with `Setlist.async()`
function (assuming that the callback function is the last parameter).

```javascript
function CallbackFunction(param, callback) {
    // Function prototype
}

function* SetlistFunction(param) {
    let result = yield Setlist.async(CallbackFunction)(param);
}
```

Or, you can just pass it to the yield keyword and bind them with required
parameter besides the callback.

```javascript
function* SetlistFunction(param) {
    let result = yield CallbackFunction.bind(null, param);
}
```

Alternatively, if somehow your async code does not put the callback on the last
parameter, you can wrap it manually using promise.

```javascript
function PromisedFunction(param) {

    return new Promise(function(resolve, reject) {

        try {
            CallbackFunction(resolve, param);
        } catch (err) {
            reject(err);
        }

    });

}
```

### Synchronous Function

You **should not** use `yield` keyword on synchronous function (e.g.
`yield LongFunction()`) or plain objects (e.g. `yield (1 + 2)`). It will add the
function call stack and benefits **nothing** at all.

### Timeouts

It is possible to attach timeout to the Setlist, limiting the execution time
and return promise rejetion on timeout. To activate timeout, pass the time of
timeout (in ms) as the second argument of `Task(..., [timeout])`

```javascript
// Setlist with time limit of 2s
Setlist(AsyncTask(), 2000);

// Setlist without time limit
Setlist(OtherAsyncTask());
```

## Testing

You can test the package by

    npm test

It may not the best testing in the world as this is my first project that using
a real proper test.

## Bugs

If you encounter any issues related to the Setlist library, please report them
at <https://github.com/withmandala/setlist/issues>
