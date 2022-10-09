const express = require("express");
const cors = require("cors");
const superagent = require("superagent");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { User } = require("./database");
require("dotenv").config();

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
  })
);

const port = process.env.PORT || 8000;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_url = process.env.REDIRECT_URL || "http://localhost:3000";

app.listen(port, () => {
  console.log(`server started at ${port}`);
});

app.get("/users/tokens", async (req, res) => {
  let response = await superagent
    .post("https://github.com/login/oauth/access_token")
    .send({
      client_id: client_id,
      code: req.query.code,
      client_secret: client_secret,
    })
    .set("Accept", "application/json")
    .on("error", (err) => console.log(err));

  const access_token = response.body.access_token;

  response = await superagent
    .get("https://api.github.com/user")
    .set("Accept", "application/vnd.github+json")
    .set("User-Agent", "GitHub-Leaderboard")
    .set("Authorization", `Bearer ${access_token}`)
    .on("error", (err) => console.log(err));

  const username = response.body.login;
  let tracked_users = [];

  const queryResult = await User.find({ username }).exec();

  if (queryResult.length === 0) {
    new User({
      username,
      tracked_users,
    }).save();
  } else {
    tracked_users = queryResult[0].tracked_users;
  }

  res
    .cookie("username", username)
    .cookie("tracked_users", tracked_users)
    .cookie("access_token", access_token)
    .redirect(redirect_url);
});

app.post("/trackuser", async (req, res) => {
  const { username, tracked_users } = req.body;
  await User.updateOne({ username }, { $set: { tracked_users } });
  res.cookie("tracked_users", tracked_users).send("success");
});
