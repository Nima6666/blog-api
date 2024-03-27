const { reset } = require("nodemon");
const admin = require("../model/admin");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const post = require("../model/post");

module.exports.adminCreate = async (req, res) => {
  try {
    await admin.find({}).then((adminFound) => {
      if (adminFound.length > 0) {
        res.status(400).json({
          message: "the admin has already been registered for this server",
        });
      } else {
        bcryptjs.hash(req.body.password, 10, async (err, hashedPassword) => {
          const theAdmin = new admin({
            username: req.body.username,
            password: hashedPassword,
          });

          try {
            await theAdmin.save();

            res.json({
              message: "admin created successfully",
              theAdmin,
            });
          } catch (err) {
            res.json({ message: err });
          }
        });
      }
    });
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
};

module.exports.adminLogin = async (req, res) => {
  try {
    const adminfound = await admin.findOne({ username: req.body.username });
    if (adminfound) {
      const isValidPassword = await bcryptjs.compare(
        req.body.password,
        adminfound.password
      );
      if (isValidPassword) {
        const infoObject = {
          id: adminfound._id,
        };
        const expiryInfo = {
          expiresIn: "1h",
        };

        const token = jwt.sign(infoObject, process.env.SECRET, expiryInfo);
        res.json({
          token: token,
          username: adminfound.username,
        });
      } else {
        res.status(403).json({
          message: "incorrect username or password",
        });
      }
    } else {
      res.status(403).json({
        message: "incorrect username or password",
      });
    }
  } catch (err) {
    res.json({
      message: err,
    });
  }
};

module.exports.getPosts = async (req, res) => {
  try {
    const posts = await post.find({});
    const postsWithUrl = posts.map((post) => ({
      ...post,
      url: post.url,
    }));
    res.json(postsWithUrl);
  } catch (error) {
    res.json({ error });
  }
};

module.exports.createPost = async (req, res) => {
  try {
    const postCreation = new post(req.body);
    const postCreated = await postCreation.save();
    res.json({
      message: "post Creation",
      postCreated,
    });
  } catch (err) {
    res.status(500).json({
      message: err,
    });
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

    res.json({
      success: true,
      post: postFoundUsingID,
      message: "post found",
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
};

module.exports.deletePost = async (req, res) => {
  const id = req.params.id;

  try {
    const postFoundUsingID = await post.findById(id);

    if (!postFoundUsingID) {
      return res.status(404).json({
        success: false,
        message: "post not found",
      });
    }

    await postFoundUsingID.deleteOne();

    res.json({
      success: true,
      message: "post deleted successfully",
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
};

module.exports.publish = async (req, res) => {
  const id = req.params.id;

  try {
    const postFoundUsingID = await post.findById(id);

    if (!postFoundUsingID) {
      return res.status(404).json({
        success: false,
        message: "post not found",
      });
    }

    await postFoundUsingID.updateOne({
      published: !postFoundUsingID.published,
      date: Date.now(),
    });
    const updatedOne = await post.findById(id);

    res.json({
      success: true,
      message: "post publish status updated",
      updatedOne,
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
};

module.exports.edit = async (req, res) => {
  const id = req.params.id;

  try {
    const postFoundUsingID = await post.findById(id);

    if (!postFoundUsingID) {
      return res.status(404).json({
        success: false,
        message: "post not found",
      });
    }

    await postFoundUsingID.updateOne({
      title: req.body.title,
      content: req.body.content,
    });

    const editedOne = await post.findById(id);

    res.json({
      success: true,
      message: "Post Edited",
      editedOne,
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
};
