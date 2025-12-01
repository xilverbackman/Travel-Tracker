import {
  addUser,
  checkVisited,
  getCountryCode,
  getUsers,
  deleteUser,
} from "../db/pool.js";

export async function deleteMembersController(req, res) {
  const id = Number(req.params.id);
  console.log(`Colour chosen: ${JSON.stringify(req.body)}`);

  const users = await getUsers();
  const countries = await checkVisited();
  console.log(users);
  try {
    const deleted_user = await deleteUser(id);
    console.log(deleted_user);
    return res.redirect("/")
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
