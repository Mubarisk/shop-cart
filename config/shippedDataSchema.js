const mongoose = require("mongoose");
const schema5 = new mongoose.Schema(
  {
    delivery: {
      address: { type: String },
      phone: { type: String },
      pincode: { type: String },
    },
    userId: {
      type: String,
      require: true,
    },
    paymentMethod: {
      type: String,
      require: true,
    },
    products: [
      {
        id: { type: String },
        item: { type: String },
        qty: { type: String },
      },
    ],
    status: {
      type: String,
      require: true,
    },
    total: {
      type: Number,
      require: true,
    },
    Date: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "shipped" }
);
module.exports = mongoose.model("shipped", schema5);
