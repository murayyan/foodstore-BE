const fs = require("fs");
const path = require("path");
const Product = require("./model");
const Category = require("../category/model");
const Tag = require("../tag/model");
const config = require("../config");
const { policyFor } = require("../policy");

const store = async (req, res, next) => {
  try {
    let policy = policyFor(req.user);
    if (!policy.can("create", "Product")) {
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk membuat produk`,
      });
    }

    let payload = req.body;
    if (payload.category) {
      let category = await Category.findOne({
        name: { $regex: payload.category, $options: "i" },
      });
      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
      }
    }

    if (payload.tags && payload.tags.length) {
      let tags = await Tag.find({ name: { $in: payload.tags } });
      if (tags.length) {
        payload = { ...payload, tags: tags.map((tag) => tag._id) };
      }
    }

    if (req.file) {
      let tmp_path = req.file.path;
      let originalExt = req.file.originalname.split(".")[
        req.file.originalname.split(".").length - 1
      ];
      let filename = req.file.filename + "." + originalExt;
      let target_path = path.resolve(
        config.rootPath,
        `public/upload/${filename}`
      );
      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(target_path);
      src.pipe(dest);
      src.on("end", async () => {
        let product = new Product({ ...payload, image_url: filename });
        await product.save();
        return res.json(product);
      });
      src.on("error", async () => {
        next(err);
      });
    } else {
      // (1) buat Product baru menggunakan data dari `payload`
      let product = new Product(payload);
      // (2) simpan Product yang baru dibuat ke MongoDB
      await product.save();
      // (3) berikan response kepada client dengan mengembalikan product yang baru dibuat
      return res.json(product);
    }
  } catch (err) {
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
};

const index = async (req, res, next) => {
  try {
    let { limit = 10, skip = 0, q = "", category = "", tags = [] } = req.query;
    let criteria = {};
    // filter by keyoword
    if (q.length) {
      criteria = {
        ...criteria,
        name: { $regex: `${q}`, $options: "i" },
      };
    }
    // filter by category
    if (category.length) {
      category = await Category.findOne({
        name: { $regex: `${category}`, $options: "i" },
      });
      if (category) {
        criteria = { ...criteria, category: category._id };
      }
    }
    //filter by tags
    if (tags.length) {
      tags = await Tag.find({ name: { $in: tags } });
      criteria = { ...criteria, tags: { $in: tags.map((tag) => tag._id) } };
    }
    let count = await Product.find(criteria).countDocuments();
    let products = await Product.find(criteria)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("category")
      .populate("tags");
    return res.json({ count, data: products });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    let policy = policyFor(req.user);
    if (!policy.can("update", "Product")) {
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk mengupdate produk`,
      });
    }

    let payload = req.body;
    if (payload.category) {
      let category = await Category.findOne({
        name: { $regex: payload.category, $options: "i" },
      });
      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
      }
    }

    if (payload.tags && payload.tags.length) {
      let tags = await Tag.find({ name: { $in: payload.tags } });
      // (1) cek apakah tags membuahkan hasil
      if (tags.length) {
        // (2) jika ada, maka kita ambil `_id` untuk masing-masing `Tag` dan gabungkan dengan payload
        payload = { ...payload, tags: tags.map((tag) => tag._id) };
      }
    }

    if (req.file) {
      let tmp_path = req.file.path;
      let originalExt = req.file.originalname.split(".")[
        req.file.originalname.split(".").length - 1
      ];
      let filename = req.file.filename + "." + originalExt;
      let target_path = path.resolve(
        config.rootPath,
        `public/upload/${filename}`
      );
      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(target_path);
      src.pipe(dest);
      src.on("end", async () => {
        // (1) cari produk yang akan diupdate
        let product = await Product.findOne({ _id: req.params.id });
        // (2) dapatkan absolut path ke gambar dari produk yang akan
        let currentImage = `${config.rootPath}/public/upload/${product.image_url}`;
        // (3) cek apakah absolute path memang ada di file system
        if (fs.existsSync(currentImage)) {
          // (4) jika ada hapus dari file system
          fs.unlinkSync(currentImage);
        }
        // (5) update produk ke MongoDB
        product = await Product.findOneAndUpdate(
          { _id: req.params.id },
          { ...payload, image_url: filename },
          { new: true, runValidators: true }
        );
        return res.json(product);
      });
      src.on("error", async () => {
        next(err);
      });
    } else {
      // (6) update produk jika tidak ada file upload
      let product = await Product.findOneAndUpdate(
        { _id: req.params.id },
        payload,
        { new: true, runValidators: true }
      );
      return res.json(product);
    }
  } catch (err) {
    // ----- cek tipe error ---- //
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
};

const destroy = async (req, res, next) => {
  try {
    //--- cek policy ---/
    let policy = policyFor(req.user);
    if (!policy.can("delete", "Product")) {
      return res.json({
        error: 1,
        message: `Anda tidak memiliki akses untuk menghapus produk`,
      });
    }
    let product = await Product.findOneAndDelete({ _id: req.params.id });
    let currentImage = `${config.rootPath}/public/upload/${product.image_url}`;
    if (fs.existsSync(currentImage)) {
      fs.unlinkSync(currentImage);
    }
    return res.json(product);
  } catch (err) {
    next(err);
  }
};

module.exports = { index, update, store, destroy };
