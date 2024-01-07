const categoryRouter = require("express").Router();
const categoryController = require("../controllers/categoryController");

categoryRouter.get("/", categoryController.getAllCategories);
categoryRouter.get("/:category_id", categoryController.getCategoryById);
categoryRouter.post("/create", categoryController.createCategory);
categoryRouter.put("/update/:category_id", categoryController.updateCategory);
categoryRouter.delete("/delete/:category_id", categoryController.deleteCategory);
categoryRouter.get("/updateStatus/:category_id", categoryController.updateStatus);
categoryRouter.get("/search/:name", categoryController.searchByName);

module.exports = categoryRouter;
