import { Value as LibSQLValue } from '@libsql/client';

export type InValue = LibSQLValue;
export type Row = Record<string, LibSQLValue>;

export interface DatabaseResult {
  rows: Row[];
  rowsAffected: number;
  lastInsertRowid: number | bigint;
}