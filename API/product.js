const productRouter = require("express").Router();
const productController = require("../controllers/productController");
const validate = require("../Utils/validate");

productRouter.get("/", productController.getAllProducts);
productRouter.get("/trending", productController.getTrendingProducts);
productRouter.get("/topSeller", productController.getTopSellerProducts);
productRouter.get("/:product_id/detail", validate.productById, productController.getProductById);
productRouter.post("/create", validate.createProduct, productController.createProduct);
productRouter.put("/update/:product_id", validate.updateProduct, productController.updateProduct);
productRouter.delete("/delete/:product_id", validate.deleteProduct, productController.deleteProduct);
productRouter.get("/updateStatus/:product_id", validate.updateProduct, productController.updateStatus);
productRouter.get("/search/:name", validate.searchByName, productController.searchByName);
productRouter.get("/searchByCategory/:category_id", productController.getProductByCategory);
productRouter.get("/similarProducts/:product_id", validate.productById, productController.getSimilarProducts);

module.exports = productRouter;
