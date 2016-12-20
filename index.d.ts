/**
 * TypeScript definition for Setlist
 * Copyright (c) 2016 Fadhli Dzil Ikram
 */

interface Promisifier {
  (...args: any[]): Promise<any>
}

interface GenFunction {
  (...args: any[]): IterableIterator<any>
}

interface run {
  (fn: PromiseLike<any> | GenFunction | IterableIterator<any>): Promise<any>
  callbackify(fn: Function): Function
  promisify(fn: Function): Promisifier
  proxify(fn: Object): void
  isPromise(obj: any): obj is PromiseLike<any>
  isGenerator(obj: any): obj is IterableIterator<any>
  isGeneratorFunction(obj: any): obj is GenFunction
}

declare module 'setlist' {
  var run: run
  export = run
}