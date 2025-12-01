import pg from "pg";
import path from "path";
import dotenv from "dotenv";
import { loadQueries } from "../utils/loadQueries.js";

dotenv.config();

const dbConfig = JSON.parse(process.env.DB_CONFIG);
export const db = new pg.Pool(dbConfig);
export const SQL = loadQueries(path.join(process.cwd(), "src/db/queries.sql"));

/** @type {pg.Pool} */
const test = await db.query(SQL.getCountryCode, ["china"]);
console.log(SQL.getCountryCode);
console.log(
  `~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`,
  `\nSQL test: ${JSON.stringify(test.rows)}`,
  `\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
);

/**
 * Fetch all users (id + name), ordered by id ascending.
 *
 * @returns {Promise<Array<{ id: number, name: string }>>}
 *          Resolves to an array like:
 *          [{ id: 1, name: "ShadPipi" }, { id: 2, name: "MaPipi" }]
 *
 * @throws {Error} Propagates any database error from `db.query`.
 *
 * @example
 * const users = await getUsers();
 * // users: Array<{id:number,name:string}>
 */
export async function getUsers() {
  const res = await db.query("SELECT * FROM users ORDER BY id ASC");
  let users = [];
  res.rows.forEach((user) => {
    users.push({ name: user.name, id: user.id, colour: user.colour });
  });
  return users;
}

/**
 * Return the **unique list of ISO country codes** visited by a user.
 *
 * Implementation notes:
 * - Runs a parameterized query: `SQL.getUsersCountries` with `$1 = user`.
 * - Maps the result rows to `country_code` (string).
 * - Deduplicates with `Set` and returns an array of codes in first-seen order.
 *
 * @param {UserIdentifier} user
 *        User identifier for the lookup (e.g. username `"MaPipi"`).
 *        If your query keys by `id`, change the typedef to `number`.
 *
 * @returns {Promise<string[]>}
 *          Promise resolving to an array of **unique** country codes
 *          (e.g., `["US","CA","CN"]`). Empty array if none found.
 *
 * @example
 * const codes = await countryList(2);
 * // codes => ["CN"]
 */
export async function userVisitedCountries(userID) {
  const res = await db.query(SQL.getUsersCountries, [userID]);
  // console.log("countryList function: " + JSON.stringify(res.rows));
  return [...new Set(res.rows.map((r) => r.country_code))];
}

/**
 * Fetches ALL visited country codes from ALL users from the database
 * @returns {Promise<string[]>} List of country codes
 * @example ["US", "CN", "BD"]
 */
export async function checkVisited() {
  const res = await db.query("SELECT country_code FROM visited_countries");
  return res.rows.map((row) => row.country_code);
}

/**
 * Finds a user by name from a list of users
 * @param {Array<{name: string}>} allUsers - List of user objects
 * @param {string} username - The username to find
 * @returns {{name: string} | undefined} - The matched user or undefined
 */
function findUser(allUsers, username) {
  return allUsers.find((user) => user.name === username);
}

export async function addCountry(country_code, user_id) {
  const res = await db.query(SQL.addCountry, [country_code, user_id]);
  console.log(res.rows);
  return res;
}

export async function addUser(username, colour) {
  const res = await db.query(SQL.addUser, [username, colour]);
  return res;
}

export async function deleteUser(userID) {
  const res = await db.query(SQL.deleteUser, [userID]);
  return res;
}

/**
 * Fetch the database record for a country name and return its PostgreSQL result object.
 *
 * --------------------------------------------------------------
 * PURPOSE
 * --------------------------------------------------------------
 * Accept a human-readable country name (e.g. "Canada", "japan",
 * "Bangladesh") and look up its ISO country code from the `countries`
 * table. The SQL file defines the query under:
 *
 *   -- name: getCountryCode
 *   SELECT country_code
 *   FROM countries
 *   WHERE LOWER(country_name) LIKE '%' || $1 || '%';
 *
 * This function runs that query, logs the returned rows,
 * and returns the **full pg.Result** object so callers can inspect:
 *   - result.rows
 *   - result.rows[0]
 *   - result.rowCount
 *   - etc.
 *
 * --------------------------------------------------------------
 * PARAMETERS
 * --------------------------------------------------------------
 * @param {string} countryName
 *        The raw country name entered by the user. It may contain
 *        uppercase/lowercase letters, partial matches ("can"),
 *        or the full country name ("Canada").
 *
 *        This function DOES NOT mutate the input. If callers want
 *        case-insensitive matching, they must pass a lowercase
 *        value (countryName.toLowerCase()), OR the SQL must use
 *        ILIKE instead of LOWER() ... LIKE.
 *
 * --------------------------------------------------------------
 * RETURN VALUE
 * --------------------------------------------------------------
 * @returns {Promise<pg.QueryResult>}
 *          A Promise that resolves to the PostgreSQL query result.
 *
 *          Structure of pg.QueryResult:
 *            {
 *              rows: Array<{ country_code: string }>,
 *              rowCount: number,
 *              command: string,
 *              oid: number,
 *              fields: Array<FieldDef>
 *            }
 *
 *          Example return value:
 *            {
 *              rows: [ { country_code: "CA" } ],
 *              rowCount: 1,
 *              ...
 *            }
 *
 *          If no country matches the query, `rows` will be an empty array:
 *            {
 *              rows: [],
 *              rowCount: 0,
 *              ...
 *            }
 *
 * --------------------------------------------------------------
 * THROWS
 * --------------------------------------------------------------
 * @throws {Error}
 *         Any underlying PostgreSQL errors from `db.query`.
 *         For example:
 *         - network failure
 *         - malformed SQL query
 *         - missing parameters
 *
 * --------------------------------------------------------------
 * USAGE EXAMPLES
 * --------------------------------------------------------------
 *
 *  // Retrieve the database record for "Canada"
 *  const result = await getCountryCode("canada".toLowerCase());
 *  if (result.rows.length > 0) {
 *      console.log(result.rows[0].country_code);  // "CA"
 *  }
 *
 *  // Use it inside a controller
 *  const lookup = await getCountryCode(country.toLowerCase());
 *  if (lookup.rows.length === 0) {
 *      // Country does not exist
 *  } else {
 *      const code = lookup.rows[0].country_code;
 *      // Insert into visited_countries, etc.
 *  }
 *
 */
export async function getCountryCode(countryName) {
  const res = await db.query(SQL.getCountryCode, [countryName.toLowerCase()]);
  console.log(`Country code: ${JSON.stringify(res.rows)}`);
  return res;
}
