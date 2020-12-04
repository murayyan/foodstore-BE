// (1) import mongoose
const mongoose = require("mongoose");
// (2) dapatkan module model dan Schema dari package mongoose
const { model, Schema } = mongoose;
// (3) buat schema
const tagSchema = Schema({
  name: {
    type: String,
    minlength: [3, "Panjang nama tag minimal 3 karakter"],
    maxLength: [20, "Panjang nama tag maksimal 20 karakter"],
    required: [true, "Nama tag harus diisi"],
  },
});
// (4) buat model berdasarkan schema sekaligus export
module.exports = model("Tag", tagSchema);
