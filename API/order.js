const orderRouter = require("express").Router();

const orderController = require("../controllers/orderController");

orderRouter.get("/", orderController.getAllOrders);
orderRouter.get("/:order_id", orderController.getOrder);
orderRouter.get("/user/:user_id", orderController.getAllOrdersByUserId);
orderRouter.post("/create", orderController.createOrder);
// orderRouter.put("/update/:order_id", orderController.updateOrder);
// orderRouter.delete("/delete/:order_id", orderController.deleteOrder);
orderRouter.get("/updateStatus/:order_id", orderController.updateStatus);
// orderRouter.get("/search/:name", orderController.searchByName);

module.exports = orderRouter;
