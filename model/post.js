const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const blogSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  published: { type: Boolean, default: false },
  likes: [{ type: Schema.Types.ObjectId, ref: "Users" }],
  date: { type: Date, default: null },
  comment: [
    {
      user: { type: Schema.Types.ObjectId, ref: "Users" },
      email: { type: String, required: true },
      text: { type: String, required: true },
      fullName: { type: String, required: false },
      imageURL: { type: String, required: false },
      date: { type: Date, default: null },
    },
  ],
});

blogSchema.virtual("url").get(function () {
  return `${this._id}`;
});

module.exports = mongoose.model("Post", blogSchema);
