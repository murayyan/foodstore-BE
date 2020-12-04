const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const deliveryAddressSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "Nama alamat harus diisi"],
      maxLength: [255, "Panjang maksimal nama alamat adalah 255 karakter"],
    },
    village: {
      type: String,
      required: [true, "Kelurahan harus diisi"],
      maxlength: [255, "Panjang maksimal kelurahan adalah 255 karakter"],
    },
    district: {
      type: String,
      required: [true, "Kecamatan harus diisi"],
      maxlength: [255, "Panjang maksimal kecamatan adalah 255"],
    },
    regency: {
      type: String,
      required: [true, "Kabupaten harus diisi"],
      maxlength: [255, "Panjang maksimal kabupaten adalah 255 karakter"],
    },
    province: {
      type: String,
      required: [true, "Provinsi harus diisi"],
      maxlength: [255, "Panjang maksimal provinsi adalah 255 karakter"],
    },
    detail: {
      type: String,
      required: [true, "Detail alamat harus diisi"],
      maxlength: [1000, "Panjang maksimal detail alamat adalah 10000karakter"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = model("DeliveryAddress", deliveryAddressSchema);
