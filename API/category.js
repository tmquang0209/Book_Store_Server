const categoryRouter = require("express").Router();
const validate = require("../Utils/validate");
const categoryController = require("../controllers/categoryController");

categoryRouter.get("/", categoryController.getAllCategories);
categoryRouter.get("/:category_id", validate.categoryById, categoryController.getCategoryById);
categoryRouter.post("/create", validate.createCategory, categoryController.createCategory);
categoryRouter.put("/update/:category_id", validate.updateCategory, categoryController.updateCategory);
categoryRouter.delete("/delete/:category_id", validate.deleteCategory, categoryController.deleteCategory);
categoryRouter.get("/updateStatus/:category_id", validate.updateStatusCategory, categoryController.updateStatus);
categoryRouter.get("/search/:name", validate.searchByName, categoryController.searchByName);

module.exports = categoryRouter;
