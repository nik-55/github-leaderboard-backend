const express = require("express");
const app = express();
const cors = require("cors");
const superagent = require("superagent");
const cookieParser = require("cookie-parser");
require("dotenv").config();
app.use(cookieParser());
const bodyParser = require("body-parser");
const { User } = require("./database");

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 8000;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

app.listen(port, () => {
  console.log(`server started at ${port}`);
});

app.use(
  cors({
    origin: ["*"],
  })
);

app.get("/users/tokens", async (req, res) => {
  const code = req.query.code;
  superagent
    .post("https://github.com/login/oauth/access_token")
    .send({
      client_id: client_id,
      code: code,
      client_secret: client_secret,
    })
    .set("Accept", "application/json")
    .end((err, result) => {
      if (err) res.send("Authenciation Failed");
      else {
        const access_token = result.body.access_token;
        res
          .cookie("access_token", access_token)
          .redirect(`http://localhost:3000`);
      }
    });
});

app.post("/trackuser", async (req, res) => {
  const { username, tracked_users } = req.body;
  const user = new User({
    username,
    tracked_users,
  });
  await user.save();
  res.send("User successfully saved");
});
