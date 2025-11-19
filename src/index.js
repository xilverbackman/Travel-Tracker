import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import addMembersRouter from "./router/addMembers.js";
import { countryController } from "./controllers/countryController.js";
import { homeController } from "./controllers/homeController.js";
import { userController } from "./controllers/userController.js";
import { db, SQL } from "./db/pool.js";

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/members", addMembersRouter());

app.get("/", homeController);
app.post("/add/:id", countryController);
app.get("/user/:id", userController);

app.get("/member", async (req, res) => {
  res.render("addMember.ejs", {});
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
// Next goal -> link id to ejs to add countries
