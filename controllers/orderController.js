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
            const decodeAuth = jwt.decode(authorization);

            //check permission
            // if (decodeAuth.data.role !== "user") {
            //     const result = jsonFormat(false, "Permission denied", null);
            //     const decode = jwt.generateToken(result);
            //     return res.json(decode);
            // }

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
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            // check user_id
            if (decodeAuth.data.user_id) {
                const user = await userModel.findOne({ user_id: decodeAuth.data.user_id });
                if (!user) {
                    const result = jsonFormat(false, "User not found", null);
                    const decode = jwt.generateToken(result);
                    return res.json(decode);
                }
            }

            // check products
            const productsId = products.map((product) => product.product_id);
            const productsDb = await productModel.find({ product_id: { $in: productsId } });
            if (productsDb.length !== productsId.length) {
                const result = jsonFormat(false, "Products not found", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            // check quantity
            const productsQuantity = products.map((product) => product.quantity);
            const productsDbQuantity = productsDb.map((product) => product.quantity);
            const checkQuantity = productsQuantity.every((quantity, index) => quantity <= productsDbQuantity[index]);
            if (!checkQuantity) {
                const result = jsonFormat(false, "Quantity not enough", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            // create order
            const order = await orderModel.create({ user_id, contact, address, products });
            if (!order) {
                const result = jsonFormat(false, "Create order failed", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            const result = jsonFormat(true, "Create order successfully", order);
            const decode = jwt.generateToken(result);
            res.json(decode);
        } catch (err) {
            res.json(err);
        }
    },

    getOrder: async (req, res) => {
        try {
            const { order_id } = req.params;
            const { authorization } = req.headers;
            const decodeAuth = jwt.decode(authorization);

            //check permission
            // if (decodeAuth.data.role !== "user") {
            //     const result = jsonFormat(false, "Permission denied", null);
            //     const decode = jwt.generateToken(result);
            //     return res.json(decode);
            // }

            await connectDb();
            // check empty
            if (!order_id) {
                const result = jsonFormat(false, "Missing order_id", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            // check order_id
            const order = await orderModel.findOne({ order_id });
            if (!order) {
                const result = jsonFormat(false, "Order not found", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            const result = jsonFormat(true, "Get order successfully", order);
            const decode = jwt.generateToken(result);
            res.json(decode);
        } catch (err) {
            res.json(err);
        }
    },

    getAllOrders: async (req, res) => {
        try {
            const { authorization } = req.headers;
            const decodeAuth = jwt.decode(authorization);

            // check permission
            if (decodeAuth.data.role !== "user") {
                const result = jsonFormat(false, "Permission denied", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            await connectDb();
            const orders = await orderModel.find();
            if (!orders) {
                const result = jsonFormat(false, "Orders not found", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            const result = jsonFormat(true, "Get orders successfully", orders);
            const decode = jwt.generateToken(result);
            res.json(decode);
        } catch (err) {
            res.json(err);
        }
    },

    getAllOrdersByUserId: async (req, res) => {
        try {
            const { authorization } = req.headers;
            const decodeAuth = jwt.decode(authorization);

            // check permission
            if (!decodeAuth.data.role) {
                const result = jsonFormat(false, "Permission denied", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            const { user_id } = decodeAuth.data;

            await connectDb();
            // check empty
            if (!user_id) {
                const result = jsonFormat(false, "Missing user_id", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            // check user_id
            const orders = await orderModel.find({ user_id });
            if (!orders) {
                const result = jsonFormat(false, "Orders not found", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            const result = jsonFormat(true, "Get orders successfully", orders);
            const decode = jwt.generateToken(result);
            res.json(decode);
        } catch (err) {
            res.json(jwt.generateToken(jsonFormat(false, err, null)));
        }
    },

    updateStatus: async (req, res) => {
        try {
            const { order_id } = req.params;
            const { status } = req.body;
            const { authorization } = req.headers;
            const decodeAuth = jwt.decode(authorization);

            // check permission
            if (decodeAuth.data.role !== "admin") {
                const result = jsonFormat(false, "Permission denied", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            await connectDb();
            // check empty
            if (!order_id || !status) {
                const missingOrderId = !order_id ? "order_id" : "";
                const missingStatus = !status ? "status" : "";
                const missing = `${missingOrderId} ${missingStatus}`;
                const result = jsonFormat(false, `Missing ${missing}`, null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            // check order_id
            const order = await orderModel.findOne({ order_id });
            if (!order) {
                const result = jsonFormat(false, "Order not found", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            // update status
            const update = await orderModel.updateOne({ order_id }, { status });
            if (!update) {
                const result = jsonFormat(false, "Update status failed", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            const result = jsonFormat(true, "Update status successfully", null);
            const decode = jwt.generateToken(result);
            res.json(decode);
        } catch (err) {
            res.json(err);
        }
    },
};

module.exports = orderController;
