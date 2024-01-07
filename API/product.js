const productRouter = require("express").Router();
const productController = require("../controllers/productController");

productRouter.get("/", productController.getAllProducts);
productRouter.get("/:product_id", productController.getProductById);
productRouter.post("/create", productController.createProduct);
productRouter.put("/update/:product_id", productController.updateProduct);
productRouter.delete("/delete/:product_id", productController.deleteProduct);
productRouter.get("/updateStatus/:product_id", productController.updateStatus);
productRouter.get("/search/:name", productController.searchByName);

module.exports = productRouter;
