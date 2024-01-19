const orderModel = require("../models/order");
const productModel = require("../models/product");

const connectDb = require("../models/database");
const jwt = require("../Utils/jwtToken");
const jsonFormat = require("../Utils/json");
const { validationResult } = require("express-validator");

const orderController = {
    createOrder: async (req, res) => {
        try {
            const { user_id, contact, address, products } = req.body;
            const { authorization } = req.headers;

            await connectDb();
            // check empty
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, "Error", errors.array());
                return res.json(result);
            }

            jwt.checkPermission(res, authorization, "admin");

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

            // check empty
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, "Error", errors.array());
                return res.json(result);
            }

            jwt.checkValidValue(res, authorization, user_id);

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
