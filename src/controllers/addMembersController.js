import { addUser, checkVisited, getCountryCode, getUsers } from "../db/pool.js";

export async function addMembersController(req, res) {
  const { name, color } = req.body;
  console.log(`Colour chosen: ${JSON.stringify(req.body)}`);

  let users = await getUsers();
  const countries = await checkVisited();
  console.log(users);
  try {
    const newUser = await addUser(name, color);
    console.log(newUser);
    return res.redirect("/");
  } catch (err) {
    console.log(err);
    return res.render("addMember.ejs", {
      err: err.detail,
    });
  }

  // res.render("index.ejs", {
  //   countries: countries,
  //   users: users,
  //   selectedUserID: users.id,
  // });
}
