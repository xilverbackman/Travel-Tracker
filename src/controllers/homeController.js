import { checkVisited } from "../db/pool.js";
import { getUsers } from "../db/pool.js";

export async function homeController(req, res) {
  let users = await getUsers();
  let usersList = users.map((u) => u.name);
  console.log(users);

  console.log(`USERS LIST: ${usersList}`);
  let countries = await checkVisited();
  res.render("index.ejs", {
    countries: countries,
    users: users, // an array
    selectedUserID: null,
    error: req.query.error || null
  });
}
