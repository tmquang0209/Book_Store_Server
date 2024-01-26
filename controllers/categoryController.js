const connectDb = require("../models/database");
const categoryModel = require("../models/category");
const jwt = require("../Utils/jwtToken");
const jsonFormat = require("../Utils/json");
const { validationResult } = require("express-validator");
const productModel = require("../models/product");

const categoryController = {
    getAllCategories: async (req, res) => {
        try {
            await connectDb();
            const categories = await categoryModel.find();

            //encrypt json using jwt
            const result = categories.length === 0 ? jsonFormat(false, "No categories found", null) : jsonFormat(true, "Categories found", categories);
            res.json(result);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Error", err));
        }
    },

    getCategoryById: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, "Error", errors.array());
                return res.json(result);
            }

            await connectDb();
            const { category_id } = req.params;
            const category = await categoryModel.findOne({ category_id });

            const result = category ? jsonFormat(true, "Category found", category) : jsonFormat(false, "Category not found", null);
            res.json(result);
        } catch (err) {
            res.json(err);
        }
    },

    createCategory: async (req, res) => {
        console.log("Create category");
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
            // check empty
            const { name, description } = req.body;

            // check exists
            const check = await categoryModel.findOne({ name });
            if (check) {
                const result = jsonFormat(false, "Category already exists", null);
                return res.json(result);
            }
            // create category
            const category = await categoryModel.create({ name, description });
            const result = jsonFormat(true, "Category created", category);
            res.json(result);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Error", err));
        }
    },

    updateCategory: async (req, res) => {
        console.log("Update category");
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
            const { category_id } = req.params;
            const { name, description } = req.body;

            const category = await categoryModel.findOneAndUpdate({ category_id }, { name, description }, { new: true });
            if (!category) {
                const result = jsonFormat(false, "Category not found", null);
                return res.json(result);
            }

            const result = jsonFormat(true, "Category updated", category);
            res.json(result);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Error", err));
        }
    },

    deleteCategory: async (req, res) => {
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

            const { category_id } = req.params;
            await connectDb();
            const category = await categoryModel.findOneAndDelete({ category_id });
            if (!category) {
                const result = jsonFormat(false, "Category not found", null);
                return res.json(result);
            }

            // check category in product
            const checkProduct = await productModel.findOne({ category_id });
            if (checkProduct) {
                const result = jsonFormat(false, "This category cannot be deleted because it exists in product", null);
                return res.json(result);
            }

            const result = jsonFormat(true, "Category deleted", category);
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

            const { category_id } = req.params;
            // auth from header
            const { authorization } = req.headers;

            //check permission
            jwt.checkPermission(res, authorization, "admin");

            await connectDb();
            const category = await categoryModel.findOne({ category_id });
            if (!category) {
                const result = jsonFormat(false, "Category not found", null);
                return res.json(result);
            }

            const status = category.status === true ? false : true;
            const updateCategory = await categoryModel.findOneAndUpdate({ category_id }, { status }, { new: true });
            const result = jsonFormat(true, "Category updated", updateCategory);
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

            const { name } = req.params;
            await connectDb();
            const categories = await categoryModel.find({ name: { $regex: name, $options: "i" } });
            const result = categories.length === 0 ? jsonFormat(false, "No categories found", null) : jsonFormat(true, "Categories found", categories);
            res.json(result);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Error", err));
        }
    },
};

module.exports = categoryController;
