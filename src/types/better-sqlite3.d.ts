declare module "better-sqlite3" {
  class Database {
    constructor(filename: string, options?: Record<string, unknown>);
    pragma(source: string): unknown;
    exec(source: string): void;
    close(): void;
  }
  export default Database;
}
