import { Router } from "express";

/**
 * Creates and configures a router for handling member-related routes.
 *
 * @function addMembersRouter
 * @param {Object} options
 * @param {import('pg').Pool | import('pg').Client} options.db
 *        A PostgreSQL client or pool instance used to execute SQL queries.
 *
 * @param {Object<string, string>} [options.SQL={}]
 *        An object containing preloaded SQL queries. Keys are query names,
 *        values are SQL strings.
 *
 * @returns {import('express').Router}
 *          An Express Router instance containing the `/new` endpoint and
 *          any additional member-related routes.
 *
 * @description
 * This function acts as a router factory. It receives external dependencies
 * (database connection + SQL strings), builds an Express Router, attaches
 * route handlers to it, and returns the router so it can be mounted with
 * `app.use("/members", ...)`.
 */

export default function addMembersRouter() {
  const router = Router();
  router.post("/new", async (req, res) => {
    console.log("New user added");
    res.redirect("/");
  });
  return router;
}
