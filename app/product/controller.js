const fs = require("fs");
const path = require("path");
const Product = require("./model");
const config = require("../config");

async function store(req, res, next) {
  let payload = req.body;
  try {
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
}

async function index(req, res, next) {
  try {
    let products = await Product.find();
    return res.json(products);
  } catch (err) {
    next(err);
  }
}

module.exports = { index, store };
