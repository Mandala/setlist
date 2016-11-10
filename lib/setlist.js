/**
 * SetlistJS - Library Code
 * Sequential-ish your async code with generator function
 * @author Fadhli Dzil Ikram
 * @version 0.1.0
 */

'use strict';

function Setlist(fn, timeout) {
    // Set timeout default settings
    timeout = timeout || 0;
    // Check for function inputs
    if (Setlist.identify(fn) !== 'GeneratorFunction') {
        throw new Error('InvalidParameter');
    }

    // Create new promise
    let promise = new Promise(startWorker);
    // Overload promise with helper functions
    promise.next = Setlist.next.bind(promise);

    // Start worker function
    function startWorker(resolve, reject) {
        // Set asynchronous timeout to prevent process lock up
        if (timeout > 0) {
            setTimeout(function() {
                reject(new Error('TimeoutError'));
            }, timeout);
        }
        // Start the task worker
        Setlist.worker(resolve, reject, fn);
    }

    // Return promise to the caller
    return promise;
}

Setlist.identify = function identify(obj) {
    if (obj instanceof Object && 'constructor' in obj) {
        let child = obj.constructor;

        if (child.name === 'Promise') {
            // Generic promise identifier
            return 'Promise';
        } else if (child.name === 'Function') {
            return 'Function';
        } else if ('constructor' in child &&
            child.constructor.name === 'GeneratorFunction') {
            // Generic generator function identifier
            return 'GeneratorFunction';
        } else {
            return false;
        }
    } else {
        return false;
    }
}

Setlist.next = function next(fn) {
    // Chain the parent function with new task
    return this.then(function() {
        // Return new promisified task
        return Setlist(fn);
    });
}

Setlist.async = function async(fn) {
    // Checks if the passed parameter is not a function
    if (typeof fn !== 'function') {
        throw new Error('InvalidParameter');
    }
    // Create local execution function
    function exec() {
        // Let's move the arguments
        let args = Array.from(arguments);
        // Return new promise and execute the async function
        return new Promise(function(resolve) {
            // Add new resolve (callback) function as the last parameter
            args.push(done);
            // We are good to go!
            fn.apply(null, args);
            // Create function that can pack args to resolve function
            function done() {
                // Capture arguments
                let a = arguments;
                // Call resolve based on arument length
                if (a.length === 0) {
                    // No arguments, call straightforward
                    resolve();
                } else if (a.length === 1) {
                    // Single argument, pass as ordinary value
                    resolve(a[0]);
                } else {
                    // Multiple arguments, pack them into array
                    resolve(Array.from(a));
                }
            }
        });
    }

    return exec;
}

Setlist.worker = function worker(done, halt, fn, value) {
    try {
        // Try to run generator function
        var r = fn.next(value);
    } catch (err) {
        // Whoops, this is not good
        halt(err);
    }

    // Checks if the generator function has done executing function
    if (r.done) {
        // Fullfill the parent promise with return value
        done(r.value);
    } else {
        // There is more work to do, let's identify the return value
        let id = Setlist.identify(r.value);
        let thenFunction = Setlist.worker.bind(null, done, halt, fn);

        if (id === 'GeneratorFunction') {
            // So, this is the parent generator function. Let's stop the parent
            // execution and switch context to the child function
            Setlist.worker(thenFunction, halt, r.value);
            //Setlist(r.value).catch(halt).then(thenFunction);
        } else if (id === 'Promise') {
            // Our friend know what to do as it yield promise to us
            // Let's promise the next running worker
            r.value.catch(halt).then(thenFunction);
        } else if (id === 'Function') {
            // Well, well, our friend needs help! Let's give them Promise
            Setlist.async(r.value)().catch(halt).then(thenFunction);
        } else {
            // Yuck! you shouldn't do this, mate
            thenFunction(r.value);
        }

    }
}

module.exports = Setlist;
