/**
 * SetlistJS - Test Suite
 * Functionality test for Setlist
 * @author Fadhli Dzil Ikram
 * @version 0.1.0
 */

'use strict';

const $ = require('../lib/setlist');
const s = require('./snippets');
const should = require('should');

describe('Setlist test (alias $)', function() {
    describe('Method probes', function() {
        it('$ should be a function and take 2 arguments', function() {
            $.should.be.a.Function().with.lengthOf(2);
        });
        it('$.identify() should be a function and take 1 argument', function() {
            $.identify.should.be.a.Function().with.lengthOf(1);
        });
        it('$.next() should be a function and take 1 argument', function() {
            $.next.should.be.a.Function().with.lengthOf(1);
        });
        it('$.async() should be a function and take 1 argument', function() {
            $.async.should.be.a.Function().with.lengthOf(1);
        });
        it('$.worker() should be a function and take 4 arguments', function() {
            $.worker.should.be.a.Function().with.lengthOf(4);
        });
    });
    describe('Object identifier $.identify() test', function() {
        it('Should recognize promise object', function() {
            $.identify(s.prom).should.equal('Promise');
        });
        it('Should recognize generator function', function() {
            $.identify(s.gf()).should.equal('GeneratorFunction');
        });
        it('Should recognize plain function', function() {
            $.identify(s.fn).should.equal('Function');
        });
        it('Should not recognize plain object', function() {
            $.identify(s.obj).should.equal(false);
        });
    });
    describe('Async wrapper $.async() test', function() {
        it('Should throw when passed non-function object', function() {
            (function() {
                $.async(s.obj);
            }).should.throwError();
        });
        it('Should return as function', function() {
            $.async(s.async).should.be.a.Function();
        });
        it('Should return promise when return fn invoked', function() {
            $.identify($.async(s.async)()).should.equal('Promise');
        });
        it('Should resolve the promise', function() {
            return $.async(s.callback)(true).should.fulfilledWith(true);
        })
    });
    describe('Task worker $.worker() test', function() {
        it('Should return value from gf', function() {
            return s.probe($.worker, s.gf(true)).should
                .fulfilledWith(true);
        });
        it('Should return value from child gf', function() {
            return s.probe($.worker, s.gfParent(true)).should
                .fulfilledWith(true);
        });
        it('Should return value from promise', function() {
            return s.probe($.worker, s.gfPromise(true)).should
                .fulfilledWith(true);
        });
        it('Should return value from callback fn', function() {
            return s.probe($.worker, s.gfCallback(true)).should
                .fulfilledWith(true);
        });
        it('Should return value from yielded value', function() {
            return s.probe($.worker, s.gfYield(true)).should
                .fulfilledWith(true);
        });
        it('Should return value from mixed yields', function() {
            return s.probe($.worker, s.gfMix(true)).should
                .fulfilledWith(true);
        });
        it('Should return value from parent mixed yields', function() {
            return s.probe($.worker, s.gfMixParent(true)).should
                .fulfilledWith(true);
        });
        it('Should handle synchronous throw', function() {
            return s.probe($.worker, s.gfErrSync()).should
                .rejectedWith('SnippetError');
        });
        it('Should handle child synchronous throw', function() {
            return s.probe($.worker, s.gfErrParent()).should
                .rejectedWith('SnippetError');
        });
        it('Should handle promise throw', function() {
            return s.probe($.worker, s.gfErrPromise()).should
                .rejectedWith('SnippetError');
        });
    });
    describe('Setlist $ test', function() {
        it('Should give timeout error when timeout elapsed', function() {
            return $(s.gfLong(), 1).should.rejectedWith('TimeoutError');
        });
        it('Should retun promise', function() {
            $.identify($(s.gf())).should.equal('Promise');
        });
        it('Should chainable with .next() function', function() {
            $(s.gf()).next.should.be.a.Function();
        });
        it('Chainable .next() should also return promise', function() {
            $.identify($(s.gf()).next(s.gf())).should.equal('Promise');
        });
        it('Should correctly return value after .next()', function() {
            return $(s.gf()).next(s.gf(true)).should.fulfilledWith(true);
        });
    });
});
