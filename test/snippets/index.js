/**
 * SetlistJS - Test Snippets
 * Define some useful snippets for testing setlist functionality
 * @author Fadhli Dzil Ikram
 */

'use strict';

let s = module.exports;

// Define ordinary function
s.fn = function(v) {
    return v;
}

// Define generator function
s.gf = function*(v) {
    return v;
}

// Define plain object
s.obj = {
    test: true
}

// Define empty promise
s.prom = new Promise((r)=>r());

// Define general async generator
s.async = function(cb, x) {
    if (x !== undefined) {
        setTimeout(x, cb);
    } else {
        process.nextTick(cb);
    }
}

s.throw = function(cb, x) {
    let e = new Error('SnippetError');

    if (typeof x === 'function') {
        x(e);
    } else {
        throw e;
    }
}

// Define callback function
s.callback = function(v, cb) {
    s.async(cb.bind(null, v));
}

s.callbackMulti = function(a, b, c, d, cb) {
    s.async(cb.bind(null, a, b, c, d));
}

// Define promise function
s.promise = function(v) {
    return new Promise((r)=>s.async(r.bind(null, v)));
}

s.promiseErr = function() {
    return new Promise((r, x)=>s.async(s.throw.bind(null, r, x)));
}

// Create worker probe
s.probe = function(worker, fn) {
    return new Promise((r, x) => {
        try {
            worker(r, x, fn);
        } catch (err) {
            x(err);
        }
    });
}

// Create sample generator functions
s.gfParent = function*(v) {
    return yield s.gf(v);
}

s.gfPromise = function*(v) {
    return yield s.promise(v);
}

s.gfCallback = function*(v) {
    return yield s.callback.bind(s, v);
}

s.gfYield = function*(v) {
    return yield v;
}

s.gfMix = function*(v) {
    let val = yield s.gf(v);
    val = yield s.promise(val);
    val = yield s.callback.bind(s, val);
    return yield val;
}

s.gfMixParent = function*(v) {
    let val = yield s.gfMix(v);
    return yield s.gfMix(val);
}

s.gfErrSync = function*() {
    return s.throw();
}

s.gfErrParent = function*() {
    yield s.gfErrSync();
}

s.gfErrPromise = function*() {
    yield s.promiseErr();
}

s.gfLong = function*() {
    return yield s.async.bind(s, 1000);
}

s.objSrc = {
    gf: function*(v) { return yield s.promise(v) },
    fn: function(v) { return v }
}
