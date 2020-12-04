const router = require("express").Router();
const regionController = require("./controller");
router.get("/region/provinces", regionController.getProvinces);
router.get("/region/regencies", regionController.getRegencies);
router.get("/region/disctricts", regionController.getDistricts);
router.get("/region/villages", regionController.getVillages);

module.exports = router;
