/**
 * SetlistJS - Test Suite
 * Functionality test for Setlist
 * @author Fadhli Dzil Ikram
 */

const $ = require('../lib/setlist');
const should = require('should');

let promise = Promise.resolve();
let genFn = function* () {};
let fn = function () {};
let obj = {};

describe('Internal type checking test', function() {
  it('isPromise() should correctly identify promise-like', function() {
    $.isPromise(promise).should.equal(true);
    $.isPromise(genFn).should.equal(false);
    $.isPromise(genFn()).should.equal(false);
    $.isPromise(fn).should.equal(false);
    $.isPromise(obj).should.equal(false);
    $.isPromise(undefined).should.equal(false);
  });
  it('isGenerator() should correctly identify generator', function() {
    $.isGenerator(promise).should.equal(false);
    $.isGenerator(genFn).should.equal(false);
    $.isGenerator(genFn()).should.equal(true);
    $.isGenerator(fn).should.equal(false);
    $.isGenerator(obj).should.equal(false);
    $.isPromise(undefined).should.equal(false);
  });
  it('isGeneratorFunction() should correctly identify gen fn', function() {
    $.isGeneratorFunction(promise).should.equal(false);
    $.isGeneratorFunction(genFn).should.equal(true);
    $.isGeneratorFunction(genFn()).should.equal(false);
    $.isGeneratorFunction(fn).should.equal(false);
    $.isGeneratorFunction(obj).should.equal(false);
    $.isGeneratorFunction(undefined).should.equal(false);
  });
});

describe('Generator runner sanity checking test', function() {
  it('Should return identical promise on promise input', function() {
    $(promise).should.equal(promise);
  });
  it('Should return promise on generator function input', function() {
    $(genFn).should.be.a.Promise();
  });
  it('Should return promise on generator input', function() {
    $(genFn()).should.be.a.Promise();
  });
  it('Should throw on invalid input (ordinary function)', function() {
    (function() {
      $(fn)
    }).should.throw();
  });
  it('Should throw on invalid input (ordinary object)', function() {
    (function() {
      $(obj)
    }).should.throw();
  });
});

describe('Generator runner functional test', function() {
  it('Non-async return', function() {
    let gf = function* (v) { return v };
    return $(gf(true)).should.fulfilledWith(true);
  });
  it('Non-async yield return', function() {
    let gf = function* (v) { return yield v };
    return $(gf(true)).should.fulfilledWith(true);
  });
  it('Promise return', function() {
    let gf = function* (v) { return Promise.resolve(v) };
    return $(gf(true)).should.fulfilledWith(true);
  });
  it('Promise yield return', function() {
    let gf = function* (v) { return yield Promise.resolve(v) };
    return $(gf(true)).should.fulfilledWith(true);
  });
  it('Generator function return', function() {
    let gf = function* (v) { return function* (v) { return v }(v) };
    return $(gf(true)).should.fulfilledWith(true);
  });
  it('Generator function yield return', function() {
    let gf = function* (v) { return yield function* (v) { return v }(v) };
    return $(gf(true)).should.fulfilledWith(true);
  });
});

describe('Generator runner error catching test', function() {
  it('Catch promise error globally', function() {
    let gf = function* () { yield Promise.reject(new Error('TestError')) };
    return $(gf).should.be.rejectedWith('TestError');
  });
  it('Catch promise error locally', function() {
    let gf = function* () {
      try {
        yield Promise.reject(new Error('TestError'));
      } catch(err) {
        if (err.message === 'TestError') {
          return true;
        }
        throw err;
      }
    };
    return $(gf).should.fulfilledWith(true);
  });
  it('Catch generator function error globally', function() {
    let gf = function* () {
      yield function* () {
        throw new Error('TestError');
      }();
    };
    return $(gf).should.be.rejectedWith('TestError');
  });
  it('Catch generator function error locally', function() {
    let gf = function* () {
      try {
        yield function* () {
          throw new Error('TestError');
        }();
      } catch(err) {
        if (err.message === 'TestError') {
          return true;
        }
        throw err;
      }
    };
    return $(gf).should.fulfilledWith(true);
  });
});

describe('Utility sanity checking test', function() {
  it('Callbackify should return function', function() {
    $.callbackify(genFn).should.be.a.Function();
  });
  it('Callbackify should throw on non-gen fn input', function() {
    (function() {
      $.callbackify(fn);
    }).should.throw();
  });
  it('Promisify should return function', function() {
    $.promisify(fn).should.be.a.Function();
  });
  it('Promisified function should return promise on call', function() {
    $.promisify(fn)().should.be.a.Promise();
  });
  it('Promisify should throw on non-function input', function() {
    (function() {
      $.promisify(obj);
    }).should.throw();
  });
  it('Proxify should throw on non-object input', function() {
    (function() {
      $.proxify('obj');
    }).should.throw();
  });
});

describe('Callbackify functional test', function() {
  let gfCallback = function* (v) { return v }
  let gfCallbackError = function* () { throw new Error('TestError') }
  let callbackParent = function (fn, v) {
    return new Promise(function(resolve, reject) {
      $.callbackify(fn)(v, callbackHandle);

      function callbackHandle(err, value) {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      }
    });
  }

  it('Should resolve as value when return from gen fn', function() {
    return callbackParent(gfCallback, true).should.fulfilledWith(true);
  });
  it('Should catch error from gen fn and map proper callback', function() {
    return callbackParent(gfCallbackError, true).should
        .rejectedWith('TestError');
  });
});

describe('Promisify functional test', function() {
  let callbackFn = function(err, v, cb) {
    process.nextTick(() => cb(err, v));
  }
  let callbackMulti = function(err, v, w, x, cb) {
    process.nextTick(() => cb(err, v, w, x));
  }
  
  it('Should properly pass value to the promise .then()', function() {
    return $.promisify(callbackFn)(null, true).should.fulfilledWith(true);
  });
  it('Should properly pass error to .catch()', function() {
    return $.promisify(callbackFn)(new Error('TestError'), null).should
        .rejectedWith('TestError');
  });
  it('Should properly pass array to .then() on multi arguments', function() {
    return $.promisify(callbackMulti)(null, true, 1, false).should
        .fulfilledWith([true, 1, false]);
  });
});

describe('Proxify functional test', function() {
  let baseClass = class {
    * base() {
      return yield Promise.resolve(this.var);
    }

    setVar(v) {
      this.var = v;
    }

    static * base() {
      return yield Promise.resolve(this.var);
    }

    static setVar(v) {
      this.var = v;
    }
  }
  let extendedClass = class extends baseClass {
    * ext() {
      return yield this.base();
    }

    static * ext() {
      return yield this.base();
    }
  }

  // Proxify class
  $.proxify(baseClass);
  $.proxify(extendedClass);

  extendedClass.setVar(true);
  let extendedObject = new extendedClass();
  extendedObject.setVar(true);

  it('Should properly resolve this keyword on prototype', function() {
    return extendedObject.ext().should.fulfilledWith(true);
  });
  it('Should properly resolve this keyword on constructor', function() {
    return extendedClass.ext().should.fulfilledWith(true);
  });
})
