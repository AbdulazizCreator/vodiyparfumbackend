const Users = require("../models/userModel");
const Payments = require("../models/paymentModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userCtrl = {
  register: async (req, res) => {
    try {
      const { name, lname, login, phoneNumber, password } = req.body;

      const user = await Users.findOne({ login });
      if (user) return res.status(400).json({ msg: "Bu foydalanuvchi mavjud" });

      if (password.length < 6)
        return res.status(400).json({ msg: "Kodning minimal uzunligi 6 " });

      // const passwordHash = await bcrypt.hash(password, 10);
      const newUser = new Users({
        name,
        lname,
        login,
        phoneNumber,
        password,
        // password: passwordHash,
      });
      await newUser.save();

      const accesstoken = createAccessToken({ id: newUser._id });
      const refreshtoken = createRefreshToken({ id: newUser._id });

      res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
      });

      res.json({ accesstoken });

      res.json("success");
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  login: async (req, res) => {
    try {
      const { login, password } = req.body;

      const user = await Users.findOne({ login });
      if (!user)
        return res.status(400).json({ msg: "Bu foydalanuvchi mavjud emas" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: "No'g'ri parol" });

      // If login success , create access token and refresh token
      const accesstoken = createAccessToken({ id: user._id });
      const refreshtoken = createRefreshToken({ id: user._id });

      res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
      });

      res.json({ accesstoken });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("refreshtoken", { path: "/user/refresh_token" });
      return res.json({ msg: "Siz chiqdingiz" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  refreshToken: (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      if (!rf_token)
        return res.status(400).json({ msg: "Please Login or Register" });

      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err)
          return res.status(400).json({ msg: "Please Login or Register" });

        const accesstoken = createAccessToken({ id: user.id });

        res.json({ accesstoken });
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getUser: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select("-password");
      if (!user)
        return res.status(400).json({ msg: "Foydalanuvchi mavjud emas." });

      res.json(user);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getUsers: async (req, res) => {
    try {
      const users = await Users.find();
      res.json(users);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateUser: async (req, res) => {
    try {
      const { name, lname, login, phoneNumber, password } = req.body;

      await Users.findOneAndUpdate(
        { _id: req.params.id },
        {
          name,
          lname,
          login,
          phoneNumber,
          password,
        }
      );

      res.json({ msg: "Foydaluvchi o'zgartirildi" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  addCart: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id);
      if (!user)
        return res.status(400).json({ msg: "Bu foydalanuvchi mavjud emas" });
      const { cart } = req.body;
      cart.forEach((item) => {
        if (item.quantity > item.number) {
          return res
            .status(400)
            .json({ msg: "Bizda buncha mahsulot mavjud emas !" });
        }
      });
      await Users.findOneAndUpdate(
        { _id: req.user.id },
        {
          cart: cart,
        }
      );
      console.log(cart);
      return res.json({ msg: "Kartaga qo'shildi" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  history: async (req, res) => {
    try {
      const history = await Payments.find({ user_id: req.user.id });

      res.json(history);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

const createAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "11m" });
};
const createRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

module.exports = userCtrl;
