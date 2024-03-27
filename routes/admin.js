const router = require("express").Router();
const adminController = require("../controller/adminController");
const isAuth = require("../middleware/userAuth");

router.post("/", adminController.adminCreate);

router.post("/login", adminController.adminLogin);

router.get("/posts", isAuth.isAuthenticated, adminController.getPosts);

router.post("/posts", isAuth.isAuthenticated, adminController.createPost);

router.get("/posts/:id", isAuth.isAuthenticated, adminController.getPost);

router.delete("/posts/:id", isAuth.isAuthenticated, adminController.deletePost);

router.patch("/posts/:id", isAuth.isAuthenticated, adminController.publish);

router.put("/posts/:id", isAuth.isAuthenticated, adminController.edit);

module.exports = router;
