/**
 * SetlistJS TypeScript Definition
 * Enable correct type-hinting on VSCode
 * Copyright (c) 2016 Fadhli Dzil Ikram
 */

interface run {
  (fn: PromiseLike<any> | Function | IterableIterator<any>): Promise<any>;
  callbackify(fn: Function): Function;
  promisify(fn: Function): Function;
  proxify(obj: Object): void;
  isPromise(fn: any): fn is PromiseLike<any>;
  isGenerator(fn: any): fn is IterableIterator<any>;
  isFunctionGenerator(fn: any): fn is Function;
}

declare const run: run;

export = run;
