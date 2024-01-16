const connectDb = require("../models/database");
const categoryModel = require("../models/category");
const productModel = require("../models/product");
const jwt = require("../Utils/jwtToken");
const jsonFormat = require("../Utils/json");
const { validationResult } = require("express-validator");

const productController = {
    getAllProducts: async (req, res) => {
        try {
            const { keyword, category, sort, from, to } = req.query || req.params;

            await connectDb();
            let products = await productModel.find();

            if (keyword) {
                products = products.filter((product) => product.name.toLowerCase().includes(keyword.toLowerCase()));
            }

            if (category) {
                products = products.filter((product) => product.category_id === Number(category));
            }

            if (sort) {
                switch (sort) {
                    case "best-selling":
                        products = products.sort((a, b) => a.quantity.sold - b.quantity.sold);
                        break;
                    case "featured":
                        products = products.sort((a, b) => a.quantity.sold - b.quantity.sold);
                        break;
                    case "newest":
                        products = products.sort((a, b) => a.createdAt - b.createdAt);
                        break;
                    case "oldest":
                        products = products.sort((a, b) => b.createdAt - a.createdAt);
                        break;
                    case "a-z":
                        products = products.sort((a, b) => a.name.localeCompare(b.name));
                        break;
                    case "z-a":
                        products = products.sort((a, b) => b.name.localeCompare(a.name));
                        break;
                    case "low-high":
                        products = products.sort((a, b) => a.price - b.price);
                        break;
                    case "high-low":
                        products = products.sort((a, b) => b.price - a.price);
                        break;
                    default:
                        break;
                }
            }

            if (from) {
                products = products.filter((product) => product.price >= from);
            }

            if (to) {
                products = products.filter((product) => product.price <= to);
            }

            const result = products.length === 0 ? jsonFormat(false, "No products found", null) : jsonFormat(true, "Products found", products);
            res.json(result);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Error", err));
        }
    },

    getProductById: async (req, res) => {
        console.log("Get product by id");
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, "Error", errors.array());
                return res.json(result);
            }

            await connectDb();
            const { product_id } = req.params;
            const product = await productModel.findOne({ product_id });

            const category = await categoryModel.findOne({ category_id: product.category_id });

            const avgRating = product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length;
            const reviews = { totalReview: product.reviews.length, avgRating };

            // format product
            const formatProduct = {
                product_id: product.product_id,
                name: product.name,
                description: product.description,
                price: product.price,
                thumbnail: product.thumbnail,
                images: product.images,
                reviews: reviews,
                category,
                createdAt: product.createdAt,
            };

            const result = product ? jsonFormat(true, "Product found", formatProduct) : jsonFormat(false, "Product not found", null);
            res.json(result);
        } catch (err) {
            res.json(jsonFormat(false, "Error", null));
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

            const { name, description, price, category_id, quantity } = req.body;
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
                quantity: {
                    inStock: quantity,
                },
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

    getProductByCategory: async (req, res) => {
        try {
            await connectDb();
            const { category_id } = req.params;
            const products = await productModel.find({ category_id });

            const result = products.length === 0 ? jsonFormat(false, "No products found", null) : jsonFormat(true, "Products found", products);
            res.json(result);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Error", err));
        }
    },

    getTrendingProducts: async (req, res) => {
        console.log("get trending products");
        try {
            await connectDb();
            const products = await productModel.find().limit(5);

            const result = products.length === 0 ? jsonFormat(false, "No products found", null) : jsonFormat(true, "Products found", products);

            res.json(result);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Error", err));
        }
    },

    getTopSellerProducts: async (req, res) => {
        try {
            await connectDb();
            const products = await productModel.find().sort({ order: 1 }).limit(5);

            const result = products.length === 0 ? jsonFormat(false, "No products found", null) : jsonFormat(true, "Products found", products);
            res.json(result);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Error", err));
        }
    },
};

module.exports = productController;
