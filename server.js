const express = require("express");
const app = express();
const cors = require("cors");
const superagent = require("superagent");
const cookieParser = require("cookie-parser");
require("dotenv").config();
app.use(cookieParser());

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
