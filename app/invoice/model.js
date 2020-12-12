const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const invoiceSchema = Schema(
  {
    sub_total: {
      type: Number,
      required: [true, "sub_total harus diisi"],
    },
    delivery_fee: {
      type: Number,
      required: [true, "delivery_fee harus diisi"],
    },
    delivery_address: {
      province: { type: String, required: [true, "provinsi harusdiisi."] },
      regency: { type: String, required: [true, "kabupaten harusdiisi."] },
      district: { type: String, required: [true, "kecamatan harusdiisi."] },
      village: { type: String, required: [true, "kelurahan harusdiisi."] },
      detail: { type: String },
    },
    total: {
      type: Number,
      required: [true, "total harus diisi"],
    },
    payment_status: {
      type: String,
      enum: ["waiting_payment", "paid"],
      default: "waiting_payment",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  { timestamps: true }
);
module.exports = model("Invoice", invoiceSchema);
