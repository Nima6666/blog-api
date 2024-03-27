const post = require("../model/post");
const passport = require("passport");
const bcrypt = require("bcryptjs");

const mongoose = require("mongoose");

const User = require("../model/User");
module.exports.getPosts = async (req, res) => {
  try {
    const posts = await post.find({ published: true });
    setTimeout(() => {
      res.json({ posts });
    }, 500);
  } catch (error) {
    res.json({ error });
  }
};

module.exports.getPost = async (req, res) => {
  const id = req.params.id;

  try {
    const postFoundUsingID = await post.findById(id);

    if (!postFoundUsingID) {
      return res.status(404).json({
        success: false,
        message: "post not found",
      });
    }

    setTimeout(() => {
      res.json(postFoundUsingID);
    }, 500);
  } catch (err) {
    res.json({
      message: err,
    });
  }
};

module.exports.getLoggedInUser = async (req, res) => {
  try {
    const foundUser = await googleUser.findById(req.body.id);
    res.json(foundUser);
  } catch (err) {
    res.json(err);
  }
};

module.exports.getCurrentUser = (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.error(err);
  }
};

module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.clearCookie("connect.sid", { path: "/", domain: null });
    res.json({
      success: true,
      message: "user logged out successfully",
    });
  });
};

module.exports.createUser = async (req, res) => {
  try {
    bcrypt.hash(req.body.password, 10, async (err, hashedpassword) => {
      if (err) {
        return res.json(err);
      }
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedpassword,
      });
      try {
        await user.save();
        return res.json({
          message: "User created successfully",
        });
      } catch (err) {
        return res.status(500).json({
          message: "Failed to create user. Please try again later.",
        });
      }
    });
  } catch (err) {
    res.json(err);
  }
};

module.exports.likeHandler = async (req, res) => {
  const postId = req.params.id;

  try {
    const postToLike = await post.findById(postId);

    if (!postToLike) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (postToLike.likes.includes(req.user._id.toString())) {
      postToLike.likes = postToLike.likes.filter(
        (likeId) => likeId.toString() !== req.user._id.toString()
      );
      await postToLike.save();
    } else {
      postToLike.likes.push(req.user._id);
      await postToLike.save();
    }
    return res.status(200).json({ updatedPost: postToLike });
  } catch (error) {
    res.json(error);
  }
};

module.exports.comment = async (req, res) => {
  const postId = req.params.id;

  try {
    const postToComment = await post.findById(postId);

    if (!postToComment) {
      return res.status(404).json({ message: "Post not found" });
    }

    postToComment.comment.push({
      user: req.user._id,
      email: req.user.email,
      text: req.body.comment,
      date: Date.now(),
      fullName: req.user.name,
      imageURL: req.user.profileImg ? req.user.profileImg : null,
    });

    await postToComment.save();
    return res.status(200).json({ updatedPost: postToComment });
  } catch (error) {
    res.json(error);
  }
};
