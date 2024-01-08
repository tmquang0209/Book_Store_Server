const connectDb = require("../models/database");
const categoryModel = require("../models/category");
const productModel = require("../models/product");
const jwt = require("../Utils/jwtToken");
const jsonFormat = require("../Utils/json");

const productController = {
    getAllProducts: async (req, res) => {
        try {
            await connectDb();
            const products = await productModel.find();

            //encrypt json using jwt
            const result = products.length === 0 ? jsonFormat(false, "No products found", null) : jsonFormat(true, "Products found", products);
            res.json(result);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Error", err));
        }
    },

    getProductById: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, "Error", errors.array());
                return res.json(result);
            }

            await connectDb();
            const { product_id } = req.params;
            const product = await productModel.findOne({ product_id });

            const result = product ? jsonFormat(true, "Product found", product) : jsonFormat(false, "Product not found", null);
            res.json(result);
        } catch (err) {
            res.json(err);
        }
    },

    createProduct: async (req, res) => {
        console.log("Create product");
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, "Error", errors.array());
                return res.json(result);
            }

            const { name, description, price, category_id } = req.body;
            // auth from header
            const { authorization } = req.headers;

            //check permission
            jwt.checkPermission(res, authorization, "admin");

            await connectDb();
            // check empty
            if (!name || !description || !price || !category_id) {
                const missingName = !name ? "name" : "";
                const missingDescription = !description ? "description" : "";
                const missingPrice = !price ? "price" : "";
                const missingCategory = !category_id ? "category_id" : "";
                const result = jsonFormat(false, `Please fill ${missingName} ${missingDescription} ${missingPrice} ${missingCategory}`, null);
                return res.json(result);
            }

            // check exists
            const check = await productModel.findOne({ name });
            if (check) {
                const result = jsonFormat(false, "Product already exists", null);
                return res.json(result);
            }

            //check category exists
            const checkCat = await categoryModel.findOne({ category_id });
            if (!checkCat) {
                const result = jsonFormat(false, "Category not found", null);
                return res.json(result);
            }

            const newProduct = new productModel({
                name,
                description,
                price,
                category_id,
            });

            await newProduct.save();
            const result = jsonFormat(true, "Product created", newProduct);
            res.json(result);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Error", err));
        }
    },

    updateProduct: async (req, res) => {
        console.log("Update product");
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, "Error", errors.array());
                return res.json(result);
            }

            await connectDb();
            const { product_id } = req.params;
            const { name, description, price, category_id } = req.body;

            // auth from header
            const { authorization } = req.headers;
            jwt.checkPermission(res, authorization, "admin");

            if (!name || !description || !price || !category_id) {
                const missingName = !name ? "name" : "";
                const missingDescription = !description ? "description" : "";
                const missingPrice = !price ? "price" : "";
                const missingCategory = !category_id ? "category_id" : "";
                const result = jsonFormat(false, `Please fill ${missingName} ${missingDescription} ${missingPrice} ${missingCategory}`, null);
                return res.json(result);
            }

            const product = await productModel.findOne({ product_id });
            if (!product) {
                const result = jsonFormat(false, "Product not found", null);
                return res.json(result);
            }

            const updateProduct = await productModel.findOneAndUpdate({ product_id }, { name, description, price, category_id }, { new: true });
            const result = jsonFormat(true, "Product updated", updateProduct);
            res.json(result);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Error", err));
        }
    },

    deleteProduct: async (req, res) => {
        console.log("Delete product");
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, "Error", errors.array());
                return res.json(result);
            }

            // auth from header
            const { authorization } = req.headers;

            //check permission
            jwt.checkPermission(res, authorization, "admin");

            await connectDb();
            const { product_id } = req.params;
            const product = await productModel.findOne({ product_id });
            if (!product) {
                const result = jsonFormat(false, "Product not found", null);
                return res.json(result);
            }

            await productModel.findOneAndDelete({ product_id });
            const result = jsonFormat(true, "Product deleted", null);
            res.json(result);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Error", err));
        }
    },

    updateStatus: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, "Error", errors.array());
                return res.json(result);
            }

            // auth from header
            const { authorization } = req.headers;

            //check permission
            jwt.checkPermission(res, authorization, "admin");

            await connectDb();
            const { product_id } = req.params;
            const product = await productModel.findOne({ product_id });

            if (!product) {
                const result = jsonFormat(false, "Product not found", null);
                return res.json(result);
            }

            const status = product.status === true ? false : true;
            const updateProduct = await productModel.findOneAndUpdate({ product_id }, { status }, { new: true });

            const result = jsonFormat(true, "Product status updated", updateProduct);
            res.json(result);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Error", err));
        }
    },

    searchByName: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, "Error", errors.array());
                return res.json(result);
            }

            await connectDb();
            const { name } = req.params;
            const products = await productModel.find({ name: { $regex: name, $options: "i" } });

            const result = products.length === 0 ? jsonFormat(false, "No products found", null) : jsonFormat(true, "Products found", products);
            res.json(result);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Error", err));
        }
    },
};

module.exports = productController;
