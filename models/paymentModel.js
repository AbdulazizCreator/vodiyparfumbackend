const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    lname: {
      type: String,
      required: true,
    },
    login: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    cart: {
      type: Array,
      default: [],
    },
    comment: {
      type: String,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payments", paymentSchema);
