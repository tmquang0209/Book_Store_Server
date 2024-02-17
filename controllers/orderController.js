const orderModel = require("../models/order");
const productModel = require("../models/product");

const connectDb = require("../models/database");
const jwt = require("../Utils/jwtToken");
const jsonFormat = require("../Utils/json");
const { validationResult } = require("express-validator");
const userModel = require("../models/user");
const orderStatus = require("../Utils/constant");

const orderController = {
    createOrder: async (req, res) => {
        try {
            const { contact, address, products } = req.body;
            const { authorization } = req.headers;

            await connectDb();
            // check empty
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, "Error", errors.array());
                return res.json(result);
            }

            jwt.checkPermission(res, authorization, "admin");

            // check user_id
            const user_id = jwt.decode(authorization)._doc.user_id;
            const user = await userModel.findOne({ user_id });

            if (!user) {
                const result = jsonFormat(false, "User not found", null);
                return res.json(result);
            }

            // check products
            const productsId = products.map((product) => product.product_id);
            const productsDb = await productModel.find({ product_id: { $in: productsId } });
            if (productsDb.length !== productsId.length) {
                const result = jsonFormat(false, "Products not found", null);

                return res.json(result);
            }

            // check quantity
            const productsQuantity = products.map((product) => product.quantity);
            const productsDbQuantity = productsDb.map((product) => product.quantity.inStock);
            const checkQuantity = productsQuantity.every((quantity, index) => quantity <= productsDbQuantity[index]);
            if (!checkQuantity) {
                const result = jsonFormat(false, "Quantity not enough", null);

                return res.json(result);
            }

            // create order
            const shipping_log = [
                {
                    status: orderStatus.PENDING,
                    description: "Create order",
                    created_by: user_id,
                },
            ];
            const order = await orderModel.create({ user_id, contact, address, products, shipping_log });
            if (!order) {
                const result = jsonFormat(false, "Create order failed", null);

                return res.json(result);
            }

            const result = jsonFormat(true, "Create order successfully", order);

            res.json(result);
        } catch (err) {
            res.json(err);
        }
    },

    getOrder: async (req, res) => {
        try {
            const { order_id } = req.params;
            const { authorization } = req.headers;

            // check empty
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, "Error", errors.array());
                return res.json(result);
            }

            await connectDb();

            // check order_id
            const order = await orderModel.findOne({ order_id });
            if (!order) {
                const result = jsonFormat(false, "Order not found", null);

                return res.json(result);
            }
            // get product name
            const productsId = order.products.map((product) => product.product_id);
            const productsDb = await productModel.find({ product_id: { $in: productsId } });
            if (productsDb.length !== productsId.length) {
                const result = jsonFormat(false, "Products not found", null);
                return res.json(result);
            }
            const products = productsDb.map((product) => {
                const productOrder = order.products.find((productOrder) => productOrder.product_id === product.product_id);
                return {
                    product_id: product.product_id,
                    name: product.name,
                    quantity: productOrder.quantity,
                    price: productOrder.price,
                };
            });
            const result = jsonFormat(true, "Get order successfully", { ...order._doc, products });

            res.json(result);
        } catch (err) {
            res.json(err);
        }
    },

    cancelOrder: async (req, res) => {
        try {
            const { order_id } = req.params;
            const { authorization } = req.headers;
            const { description } = req.body;

            // check permission
            const userInfo = jwt.decode(authorization)._doc;

            if (userInfo.role !== "admin" && userInfo.role !== "user") {
                const result = jsonFormat(false, "Permission denied", null);
                return res.json(result);
            }

            await connectDb();

            // check order_id
            const order = await orderModel.findOne({ order_id });
            if (!order) {
                const result = jsonFormat(false, "Order not found", null);
                return res.json(result);
            }

            // check user_id
            if (userInfo.role === "user" && order.user_id !== userInfo.user_id) {
                const result = jsonFormat(false, "Permission denied", null);
                return res.json(result);
            }

            // check status
            if (order.status !== orderStatus.PENDING) {
                const result = jsonFormat(false, "Order can't cancel", null);
                return res.json(result);
            }

            if (!order) {
                const result = jsonFormat(false, "Cancel order failed", null);
                return res.json(result);
            }

            order.status = orderStatus.CANCELED;
            order.shipping_log = Array.isArray(order.shipping_log)
                ? [
                      ...order.shipping_log,
                      {
                          status: orderStatus.CANCELED,
                          description,
                          created_by: userInfo.user_id,
                      },
                  ]
                : [
                      {
                          status: orderStatus.CANCELED,
                          description,
                          created_by: userInfo.user_id,
                      },
                  ];

            // Save the updated order back to the database
            await order.save();

            const result = jsonFormat(true, "Cancel order successfully", null);
            res.json(result);
        } catch (err) {
            console.log(err);
            res.json(jsonFormat(false, err, null));
        }
    },

    getAllOrders: async (req, res) => {
        try {
            const { authorization } = req.headers;
            jwt.checkPermission(res, authorization, "admin");

            await connectDb();
            const orders = await orderModel.find();
            if (!orders) {
                const result = jsonFormat(false, "Orders not found", null);

                return res.json(result);
            }

            const result = jsonFormat(true, "Get orders successfully", orders);

            res.json(result);
        } catch (err) {
            res.json(err);
        }
    },

    getAllOrdersByUserId: async (req, res) => {
        try {
            const { authorization } = req.headers;
            const { user_id } = req.params;

            // check empty
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, "Error", errors.array());
                return res.json(result);
            }

            const resultAuth = jwt.checkValidValue(res, authorization, user_id);
            if (!resultAuth) {
                return;
            }

            await connectDb();

            // check user_id
            const orders = await orderModel.find({ user_id });
            if (!orders) {
                const result = jsonFormat(false, "Orders not found", null);
                return res.json(result);
            }

            const result = jsonFormat(true, "Get orders successfully", orders);
            res.json(result);
        } catch (err) {
            res.json(jsonFormat(false, err, null));
        }
    },

    updateStatus: async (req, res) => {
        try {
            const { order_id } = req.params;
            const { status, description } = req.body;
            const { authorization } = req.headers;

            // check permission
            jwt.checkPermission(res, authorization, "admin");

            // check empty
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, "Error", errors.array());
                return res.json(result);
            }

            await connectDb();

            // check order_id
            const order = await orderModel.findOne({ order_id });
            if (!order) {
                const result = jsonFormat(false, "Order not found", null);
                return res.json(result);
            }

            // update status
            const update = await orderModel.updateOne(
                { order_id },
                {
                    status,
                    $push: {
                        shipping_log: {
                            status,
                            description,
                            created_by: jwt.decode(authorization)._doc.user_id,
                        },
                    },
                }
            );
            
            // order.shipping_log
            if (!update) {
                const result = jsonFormat(false, "Update status failed", null);
                return res.json(result);
            }

            const result = jsonFormat(true, "Update status successfully", null);
            res.json(result);
        } catch (err) {
            res.json(err);
        }
    },
};

module.exports = orderController;
