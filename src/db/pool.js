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
    users.push({ name: user.name, id: user.id });
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