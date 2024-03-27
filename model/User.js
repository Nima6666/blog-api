const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UsrSchema = new Schema({
  oAuth: { type: Boolean, default: false },
  name: { type: String, required: true },
  email: { type: String, required: true },
  profileImg: { type: String },
  sub: {
    type: String,
    required: function () {
      return this.oAuth;
    },
  },
  password: {
    type: String,
    required: function () {
      return !this.oAuth;
    },
  },
});

module.exports = mongoose.model("User", UsrSchema);
