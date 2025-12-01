import {
  db,
  SQL,
  getUsers,
  userVisitedCountries,
  checkVisited,
  addCountry,
  getCountryCode,
} from "../db/pool.js";

export async function countryController(req, res) {
  const { country, operation } = req.body;
  console.log("Country: " + country + ", Operation: " + operation);
  let userID = Number(req.params.id);
  /** @type {import("pg").QueryResult<{ country_code: string }>} */
  let countryCodeList = [];

  /**Look up country code of country entered by user */
  try {
    /** @type {import("pg").QueryResult<{ country_code: string }>} */
    countryCodeList = await getCountryCode(country);
    // console.log("Country code list: " + JSON.stringify(countryCodeList));
    if (countryCodeList.rows.length === 0) {
      console.log("Country code list is empty: " + countryCodeList.rows);
      return res.redirect(
        `/user/${encodeURIComponent(userID)}?error=${encodeURIComponent(
          "Country does NOT exist"
        )}`
      );
    }
  } catch (err) {
    console.error(err);
    console.log("Country doesn't exist");
    return err;
  }

  /** Early return if no country entered */
  if (country.length <= 0) {
    console.log("Enter a country");
    return;
  }

  /** Get users visited countries as array of country codes*/
  const countriesVisited = await userVisitedCountries(userID);

  // console.log("countryCodeList: " + JSON.stringify(countryCodeList));
  console.log(
    `Adding in porgress...REQ PARAMS(user ID): ${JSON.stringify(req.params.id)}`
  ); // TO GET ID: req.params.id
  let users = await getUsers();
  let visitedCountries = await checkVisited();
  if (operation === "add") {
    if (countriesVisited.includes(countryCodeList.rows[0].country_code)) {
      console.log("Country already in visited list");
      return res.redirect(
        `/user/${encodeURIComponent(userID)}?error=${encodeURIComponent(
          "Country already in visited list"
        )}`
      );
    }
    try {
      const addedCountry = await addCountry(
        countryCodeList.rows[0].country_code,
        userID
      );
      visitedCountries.push(addedCountry);
      console.log(
        `Added: ${addedCountry.rows[0].country_code}. Updated countries list: ${visitedCountries}`
      );
      res.redirect(`/user/${encodeURIComponent(userID)}`);
    } catch (err) {
      console.error(err);
      return res.render("index.ejs", {
        countries: visitedCountries,
        error: "Country already exists",
        users: users,
        selectedUserID: userID,
      });
    }
  }

  if (operation === "delete") {
    try {
      const country_code = countryCodeList.rows[0].country_code;
      const deletedCountry = await db.query(SQL.deleteCountry, [
        country_code,
        userID,
      ]);
      console.log(deletedCountry.rows);
      visitedCountries = visitedCountries.filter(
        (country) => country !== country_code
      );
      if (deletedCountry.rows.length > 0) {
        console.log(
          `Deleted: ${deletedCountry.rows[0].country_code}. Updated countries list: ${visitedCountries}`
        );
        res.redirect(`/user/${encodeURIComponent(userID)}`);
      } else {
        console.log("Country was not in the list");
        return res.redirect(
          `/user/${encodeURIComponent(userID)}?error=${encodeURIComponent(
            "Country was not in the visted list"
          )}`
        );
      }
    } catch (err) {
      console.error(err);
      res.render("index.ejs", {
        countries: visitedCountries,
        error: err,
        users: usersList,
        selectedUserID: userID,
      });
    }
  }
}
