const orderRouter = require("express").Router();
const validate = require("../Utils/validate");

const orderController = require("../controllers/orderController");

orderRouter.get("/", orderController.getAllOrders);
orderRouter.get("/:order_id/detail", validate.getOrder, orderController.getOrder);
orderRouter.put("/:order_id/cancel", validate.getOrder, orderController.cancelOrder);
orderRouter.get("/user/:user_id", orderController.getAllOrdersByUserId);
orderRouter.post("/create", validate.createOrder, orderController.createOrder);
// orderRouter.put("/update/:order_id", orderController.updateOrder);
// orderRouter.delete("/delete/:order_id", orderController.deleteOrder);
orderRouter.get("/updateStatus/:order_id", orderController.updateStatus);
// orderRouter.get("/search/:name", orderController.searchByName);

module.exports = orderRouter;
