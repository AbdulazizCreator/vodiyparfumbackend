const router = require("express").Router();
const userCtrl = require("../controllers/userCtrl");
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");

router.post("/register", userCtrl.register);

router.post("/login", userCtrl.login);

router.get("/logout", userCtrl.logout);

router.get("/refresh_token", userCtrl.refreshToken);

router.get("/infor", auth, userCtrl.getUser);

router.get("/users", auth, authAdmin, userCtrl.getUsers);
router.put("/users/:id", auth, authAdmin, userCtrl.updateUser);

router.patch("/addcart", auth, userCtrl.addCart);

router.get("/history", auth, userCtrl.history);

module.exports = router;
