const orderModel = require("../models/order");
const productModel = require("../models/product");
const userModel = require("../models/user");

const connectDb = require("../models/database");
const jwt = require("../Utils/jwtToken");
const jsonFormat = require("../Utils/json");

const orderController = {
    createOrder: async (req, res) => {
        try {
            const { user_id, contact, address, products } = req.body;
            const { authorization } = req.headers;

            await connectDb();
            // check empty
            if (!contact || !address || !products) {
                // const missingUserId = !user_id ? "user_id" : "";
                const missingUserId = "";
                const missingContact = !contact ? "contact" : "";
                const missingAddress = !address ? "address" : "";
                const missingProducts = !products ? "products" : "";
                const missing = `${missingUserId} ${missingContact} ${missingAddress} ${missingProducts}`;
                const result = jsonFormat(false, `Missing ${missing}`, null);

                return res.json(result);
            }

            // check user_id
            // if (user_id) {
            //     const result = jsonFormat(false, "User not found", null);
            //     return res.json(result);
            // }

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
            const order = await orderModel.create({ user_id, contact, address, products });
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

            await connectDb();
            // check empty
            if (!order_id) {
                const result = jsonFormat(false, "Missing order_id", null);

                return res.json(result);
            }

            // check order_id
            const order = await orderModel.findOne({ order_id });
            if (!order) {
                const result = jsonFormat(false, "Order not found", null);

                return res.json(result);
            }

            const result = jsonFormat(true, "Get order successfully", order);

            res.json(result);
        } catch (err) {
            res.json(err);
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

            jwt.checkValidValue(res, authorization, user_id);

            await connectDb();
            // check empty
            if (!user_id) {
                const result = jsonFormat(false, "Missing user_id", null);
                return res.json(result);
            }

            // check user_id
            const orders = await orderModel.find({ user_id });
            if (!orders) {
                const result = jsonFormat(false, "Orders not found", null);
                return res.json(result);
            }

            const result = jsonFormat(true, "Get orders successfully", orders);
            res.json(result);
        } catch (err) {
            res.json(jwt.generateToken(jsonFormat(false, err, null)));
        }
    },

    updateStatus: async (req, res) => {
        try {
            const { order_id } = req.params;
            const { status } = req.body;
            const { authorization } = req.headers;

            // check permission
            jwt.checkPermission(res, authorization, "admin");

            await connectDb();
            // check empty
            if (!order_id || !status) {
                const missingOrderId = !order_id ? "order_id" : "";
                const missingStatus = !status ? "status" : "";
                const missing = `${missingOrderId} ${missingStatus}`;
                const result = jsonFormat(false, `Missing ${missing}`, null);
                return res.json(result);
            }

            // check order_id
            const order = await orderModel.findOne({ order_id });
            if (!order) {
                const result = jsonFormat(false, "Order not found", null);
                return res.json(result);
            }

            // update status
            const update = await orderModel.updateOne({ order_id }, { status });
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
