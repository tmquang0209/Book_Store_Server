const bannerRouter = require("express").Router();
const bannerController = require("../controllers/bannerController");
const validate = require("../Utils/validate");

bannerRouter.get("/", bannerController.getAllBanner);
bannerRouter.post("/create", validate.createBanner, bannerController.createBanner);
bannerRouter.put("/update/:banner_id", validate.updateBanner, bannerController.updateBanner);
bannerRouter.delete("/delete/:banner_id", validate.deleteBanner, bannerController.deleteBanner);
bannerRouter.get("/updateStatus/:banner_id", validate.updateStatusBanner, bannerController.updateStatus);
bannerRouter.get("/:banner_id/detail", validate.bannerById, bannerController.getBannerById);

module.exports = bannerRouter;
