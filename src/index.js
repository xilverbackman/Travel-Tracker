// app
import express from "express";

// middleware
import bodyParser from "body-parser";
import methodOverride from "method-override";

// misc
import dotenv from "dotenv";
import addMembersRouter from "./router/addMembers.js";
import { countryController } from "./controllers/countryController.js";
import { homeController } from "./controllers/homeController.js";
import { userController } from "./controllers/userController.js";
import { getUsers } from "./db/pool.js";
import { deleteMembersController } from "./controllers/deleteMembersController.js";

dotenv.config();

const app = express();
const port = 3000;

// serves CSS, images, etc.
app.use(bodyParser.urlencoded({ extended: true }));
// fills req.body for forms
app.use(express.static("public"));
// looks at req.query._method
app.use(methodOverride("_method"));

app.use("/members", addMembersRouter());

// Routes
app.get("/", homeController);
app.post("/add/:id", countryController);
app.get("/user/:id", userController);
app.get("/member", async (req, res) => {
  let users = await getUsers();
  res.render("addMember.ejs", {
    users: users,
  });
});
app.delete("/members/:id", deleteMembersController);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
// Next goal -> link id to ejs to add countries
