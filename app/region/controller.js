const csv = require("csvtojson");
const path = require("path");

const getProvinces = async (req, res, next) => {
  const db_provinces = path.resolve(__dirname, "./data/provinces.csv");
  try {
    const data = await csv().fromFile(db_provinces);
    return res.json(data);
  } catch (err) {
    return res.json({
      error: 1,
      message: "Tidak bisa mengambil data provinsi, hubungi administrator",
    });
  }
};

const getRegencies = async (req, res, next) => {
  const db_regencies = path.resolve(__dirname, "./data/regencies.csv");
  try {
    let { parent_code } = req.query;
    const data = await csv().fromFile(db_regencies);
    if (!parent_code) return res.json(data);
    return res.json(
      data.filter((regency) => regency.province_code === parent_code)
    );
  } catch (err) {
    return res.json({
      error: 1,
      message:
        "Tidak bisa mengambil data kabupaten/kota, hubungi administrator",
    });
  }
};

const getDistricts = async (req, res, next) => {
  const db_districts = path.resolve(__dirname, "./data/districts.csv");
  try {
    let { parent_code } = req.query;
    const data = await csv().fromFile(db_districts);
    if (!parent_code) return res.json(data);
    return res.json(
      data.filter((district) => district.regency_code === parent_code)
    );
  } catch (err) {
    return res.json({
      error: 1,
      message: "Tidak bisa mengambil data kecamatan, hubungi administrator",
    });
  }
};

const getVillages = async (req, res, next) => {
  const db_villages = path.resolve(__dirname, "./data/villages.csv");
  try {
    let { parent_code } = req.query;
    const data = await csv().fromFile(db_villages);
    if (!parent_code) return res.json(data);
    return res.json(
      data.filter((village) => village.district_code === parent_code)
    );
  } catch (err) {
    return res.json({
      error: 1,
      message: "Tidak bisa mengambil data kelurahan, hubungi administrator",
    });
  }
};

module.exports = { getProvinces, getRegencies, getDistricts, getVillages };
