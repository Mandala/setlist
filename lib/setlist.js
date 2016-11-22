/**
 * SetlistJS Generator Runner
 * Sequential-ish your async code with generator function
 * Copyright (c) 2016 Fadhli Dzil Ikram
 */

'use strict'

const lo = require('lodash')

// Export modules
module.exports = run
run.callbackify = callbackify
run.promisify = promisify
run.proxify = proxify
run.isPromise = isPromise
run.isGenerator = isGenerator
run.isGeneratorFunction = isGeneratorFunction

// Main generator function
function run(fn) {
  // Return directly if it is promise
  if (isPromise(fn)) return fn
  // Initialize generator function on GenFn input
  else if (isGeneratorFunction(fn)) fn = fn()
  // Throw unknown input
  else if (!isGenerator(fn)) {
    throw new Error('Unknown generator run input')
  }

  // Create new promise generator runner
  return new Promise(function (resolve, reject) {
    // Run generator function
    exec()

    // Generator run function
    function exec(val) {
      try {
        next(fn.next(val))
      } catch (err) {
        reject(err)
      }
    }

    // Generator error function
    function error(val) {
      try {
        next(fn.throw(val))
      } catch (err) {
        reject(err)
      }
    }

    // Generator next function
    function next(r) {
      if (r.done) {
        resolve(r.value)
      } else {
        if (isPromise(r.value)) {
          r.value.then(exec).catch(error)
        } else if (isGenerator(r.value)) {
          run(r.value).then(exec).catch(error)
        } else {
          process.nextTick(() => exec(r.value))
        }
      }
    }
  })
}

// Wrap generator function with async-with-callback style function
function callbackify(fn) {
  // Check if the input was not generator function
  if (!isGeneratorFunction(fn)) {
    throw new Error('Callbackify input is not a Generator Function')
  }

  return function callbackifier() {
    // Get arguments from callback handler (without callback function)
    let args = Array.prototype.slice.call(arguments, 0, -1)
    // Get callback function itself
    let callback = arguments[arguments.length - 1]
    // Run the generator function with o-generator
    run(fn.apply(this, args))
    // Then handler (result return)
    .then((result) => callback(null, result))
    // Catch handler (error return)
    .catch ((error) => callback(error, null))
  }
}

// Wrap async-with-callback with function that returns promise
function promisify(fn) {
  // Check if the input is not function
  if (!lo.isFunction(fn)) {
    throw new Error('Promisify input is not a Function')
  }
  // Return with new proxy function
  return function promisifier() {
    let self = this
    // Get arguments from proxy
    let args = Array.from(arguments)
    // Return promise to user
    return new Promise((resolve, reject) => {
      // Push callback handler as the last argument
      args.push(callback)
      // Run the callback function
      fn.apply(self, args)
      // Define callback handler
      function callback(err, r) {
        // Get return value as Array
        let rArray = Array.prototype.slice.call(arguments, 1)
        // Check error status
        if (err) {
          reject(err)
        } else {
          if (rArray.length > 1) {
            // Resolve callback resolve as Array
            resolve(rArray)
          } else {
            resolve(r)
          }
        }
      }
    })
  }
}

// Wrap class and prototype method that contains generator function with
// promise proxy so it can be used without explicit usage of generator runner
function proxify(obj) {
  if (!lo.isObject(obj)) {
    throw new Error('Proxify input is not object')
  }
  // Proxify prototype if available
  if ('prototype' in obj) proxify(obj.prototype)
  // Get all own property member of the object
  let properties = Object.getOwnPropertyNames(obj)
  for (let property of properties) {
    // Skip constructor function
    if (property === 'constructor') continue
    // Skip if the property is not generator function
    if (!isGeneratorFunction(obj[property])) continue
    // Store current function
    let srcFunction = obj[property]
    // Inject object/class with proxified generator function
    obj[property] = function proxifier() {
      return run(srcFunction.apply(this, arguments))
    }
  }
}

function isPromise(fn) {
  return (lo.isObject(fn) && lo.isFunction(fn.then) &&
      lo.isFunction(fn.catch))
}

function isGenerator(fn) {
  return (lo.isObject(fn) && lo.isFunction(fn.next) &&
      lo.isFunction(fn.throw))
}

function isGeneratorFunction(fn) {
  return (lo.isFunction(fn) && lo.isObject(fn.constructor) &&
      fn.constructor.name === 'GeneratorFunction')
}
