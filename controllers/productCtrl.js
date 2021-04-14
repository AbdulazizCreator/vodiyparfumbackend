const Products = require("../models/productModel");
const Payments = require("../models/paymentModel");

const newDate = (a) => {
  return a.toISOString().split("T")[0];
};

const cartSumQuantity = (cart) => {
  if (cart.length !== 0) {
    let sum = cart
      .map((o) => o.quantity)
      .reduce((a, c) => {
        return a + c;
      });

    return sum;
  } else {
    return 0;
  }
};

// Filter, sorting and paginating

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filtering() {
    const queryObj = { ...this.queryString }; //queryString = req.query

    const excludedFields = ["page", "sort", "limit"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lt|lte|regex)\b/g,
      (match) => "$" + match
    );

    //    gte = greater than or equal
    //    lte = lesser than or equal
    //    lt = lesser than
    //    gt = greater than
    this.query.find(JSON.parse(queryStr));

    return this;
  }

  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  paginating() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 9;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

const productCtrl = {
  getProducts: async (req, res) => {
    try {
      const features = new APIfeatures(Products.find(), req.query)
        .filtering()
        .sorting()
        .paginating();

      const products = await features.query;

      res.json({
        status: "success",
        result: products.length,
        products: products,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getLastTenDayStatics: async (req, res) => {
    try {
      const today_date = new Date();
      const payments = await Payments.find();
      days = parseInt(req.params.id);
      days_products = [];
      for (i = 0; i < days; i++) {
        days_products.push(
          payments.filter(
            (item) =>
              newDate(item.createdAt) ===
              newDate(new Date(today_date.getTime() - i * 24 * 60 * 60 * 1000))
          )
        );
      }

      numbers = Array(days).fill(0);

      days_products.forEach((item, index) =>
        item.forEach((item2) => {
          numbers[index] += cartSumQuantity(item2.cart);
        })
      );

      res.json(numbers);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  createProduct: async (req, res) => {
    try {
      const { title, price, description, images, number, category } = req.body;
      if (!images) return res.status(400).json({ msg: "Rasm joylanmagan !" });

      const product = await Products.findOne({ title });
      if (product) return res.status(400).json({ msg: "Bu mahsulot mavjud" });

      const newProduct = new Products({
        title,
        price,
        description,
        images,
        number,
        category,
      });

      await newProduct.save();
      res.json({ msg: "Mahsulot yaratildi" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      await Products.findByIdAndDelete(req.params.id);
      res.json({ msg: "Mahsulot o'chirildi" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateProduct: async (req, res) => {
    try {
      const { title, price, description, images, number, category } = req.body;
      if (!images) return res.status(400).json({ msg: "Rasm joylanmadi !" });

      await Products.findOneAndUpdate(
        { _id: req.params.id },
        {
          title,
          price,
          description,
          images,
          number,
          category,
        }
      );

      res.json({ msg: "Mahsulot o'zgartirildi" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = productCtrl;
