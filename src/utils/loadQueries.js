import fs from 'node:fs';
import path from 'node:path';

/**
 * Loads named SQL queries from a `.sql` file into a frozen object.
 *
 * The SQL file is expected to contain blocks in the form:
 *
 *   -- name: getUsers
 *   SELECT * FROM users;
 *
 *   -- name: getCountryCode
 *   SELECT country_code FROM countries WHERE ...
 *
 * Each `-- name: <key>` header starts a new block. The SQL lines until the
 * next header (or EOF) are joined and stored under that key.
 *
 * @function loadQueries
 * @param {string} filePath
 *        Absolute or relative path to a `.sql` file.
 *
 * @returns {Readonly<Record<string, string>>}
 *          A frozen object where each key is the query name and each value
 *          is the corresponding SQL string.
 *
 * @throws {Error}
 *         If a query block is empty, or if a query name is duplicated.
 *
 * @example
 * const SQL = loadQueries(path.join(process.cwd(), "db/queries.sql"));
 * // SQL.getUsersCountries -> "SELECT ...;"
 */
export function loadQueries(filePath) {
  const text = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''); // strip BOM
  const out = Object.create(null);
  let name = null;
  let buf = [];

  const flush = () => {
    if (!name) return;
    const sql = buf.join('\n').trim();
    if (!sql) throw new Error(`Empty SQL for block "${name}"`);
    if (out[name]) throw new Error(`Duplicate query name: ${name}`);
    out[name] = sql;
    name = null;
    buf = [];
  };

  for (const raw of text.split(/\r?\n/)) {
    const m = raw.match(/^\s*--\s*name:\s*([A-Za-z0-9_-]+)\s*$/);
    if (m) { flush(); name = m[1]; }
    else { buf.push(raw); }
  }
  flush();

  return Object.freeze(out); // Readonly<Record<string, string>>
}
