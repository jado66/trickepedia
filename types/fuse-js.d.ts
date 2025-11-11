declare module "fuse.js" {
  interface FuseResult<T> {
    item: T;
    refIndex: number;
    score?: number;
  }
  interface FuseOptions<T> {
    keys?: (keyof T | string)[];
    threshold?: number;
  }
  class Fuse<T> {
    constructor(list: T[], options?: FuseOptions<T>);
    search(pattern: string): FuseResult<T>[];
  }
  export = Fuse;
}
