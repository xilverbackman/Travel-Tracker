import { checkVisited, getUsers, userVisitedCountries } from "../db/pool.js";

const countries = await checkVisited();

export async function userController(req, res) {
  const id = Number(req.params.id);
  console.log("REQ PARAMS: " + JSON.stringify(req.params));
  console.log(`REQ BODY: ${JSON.stringify(id)}`);
  try {
    const users = await getUsers();
    const listOfUsers = users.map((u) => u.id);
    // console.log(`USERS + Countries: ${JSON.stringify(users)`}`);

    // const usersList = users.map(u => u.name)
    const userID = Number(req.params.id);
    console.log(`User ID ${JSON.stringify(userID)}`);
    const countries = await userVisitedCountries(userID);
    console.log(`REQ BODY: ${countries}`);
    res.render("index.ejs", {
      countries: countries,
      users: users,
      selectedUserID: id,
      error: req.query.error || null, // <- add this
    });
  } catch (err) {
    console.error(err);
    return res.status(500).render("index.ejs", {
      countries: countries,
      error: err,
      users: users,
      selectedUserID: id,
      error: req.query.error || null, // <- add this
    });
  }
}
