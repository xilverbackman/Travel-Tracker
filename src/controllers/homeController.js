import { checkVisited } from "../db/pool.js";
import { getUsers } from "../db/pool.js";

let users = await getUsers();
let usersList = users.map((u) => u.name);

export async function homeController(req, res) {
  console.log(`USERS LIST: ${usersList}`);
  let countries = await checkVisited();
  res.render("index.ejs", {
    countries: countries,
    users: users,
    selectedUserID: users.id,
  });
}
