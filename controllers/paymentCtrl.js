const Payments = require("../models/paymentModel");
const Users = require("../models/userModel");
const Products = require("../models/productModel");

const paymentCtrl = {
  getPayments: async (req, res) => {
    try {
      const payments = await Payments.find();
      res.json(payments);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  createPayment: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select(
        "name lname login phoneNumber"
      );
      if (!user)
        return res.status(400).json({ msg: "Foydalanuvchi mavjud emas !" });
      const { cart, comment } = req.body;

      const { _id, name, lname, login, phoneNumber } = user;

      // cart.forEach((item) => {
      //   if (item.quantity > item.number) {
      //     return res
      //       .status(400)
      //       .json({ msg: "Bizda buncha mahsulot mavjud emas !" });
      //   }
      // });

      const newPayment = new Payments({
        user_id: _id,
        name,
        lname,
        login,
        phoneNumber,
        cart,
        comment,
      });

      cart.filter((item) => {
        return sold(item._id, item.quantity, item.sold, item.number);
      });

      await newPayment.save();
      res.json({ msg: "Muvaffaqqatliyatli yakunlandi", newPayment });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  sendConfirm: async (req, res) => {
    try {
      const product = await Payments.findOne({ _id: req.params.id });
      product.status = true;
      await Payments.findOneAndUpdate({ _id: req.params.id }, product);
      res.json({ msg: "Buyurtma uchun tashakkur !" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

const sold = async (id, quantity, oldSold, number) => {
  await Products.findOneAndUpdate(
    { _id: id },
    {
      sold: quantity + oldSold,
      number: number - quantity,
    }
  );
};

module.exports = paymentCtrl;
