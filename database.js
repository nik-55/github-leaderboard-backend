const mongoose = require("mongoose");

require("dotenv").config();
const mongo_db_server = process.env.MONGO_DB_SERVER;

mongoose
  .connect(mongo_db_server)
  .then(() => {
    console.log("Connected To database");
  })
  .catch((err) => {
    console.log("Error in connecting to db");
  });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  tracked_users: {
    type: [String],
  },
});

const User = new mongoose.model("User", userSchema);

module.exports = { User };
