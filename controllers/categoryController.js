const connectDb = require("../models/database");
const categoryModel = require("../models/category");
const jwt = require("../Utils/jwtToken");
const jsonFormat = require("../Utils/json");

const categoryController = {
    getAllCategories: async (req, res) => {
        try {
            await connectDb();
            const categories = await categoryModel.find();

            //encrypt json using jwt
            const result = categories.length === 0 ? jsonFormat(false, "No categories found", null) : jsonFormat(true, "Categories found", categories);
            const decode = jwt.generateToken(result);

            res.json(decode);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Error", err));
        }
    },

    getCategoryById: async (req, res) => {
        try {
            await connectDb();
            const { category_id } = req.params;
            const category = await categoryModel.findOne({ category_id });

            const result = category ? jsonFormat(true, "Category found", category) : jsonFormat(false, "Category not found", null);
            const decode = jwt.generateToken(result);

            res.json(decode);
        } catch (err) {
            res.json(err);
        }
    },

    createCategory: async (req, res) => {
        console.log("Create category");
        try {
            // auth from header
            const { authorization } = req.headers;
            const decodeAuth = jwt.decode(authorization);

            //check permission
            if (decodeAuth.data.role !== "admin") {
                const result = jsonFormat(false, "Permission denied", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            await connectDb();
            // check empty
            const { name, description } = req.body;
            if (!name || !description) {
                const missingName = !name ? "name" : "";
                const missingDescription = !description ? "description" : "";
                const result = jsonFormat(false, `Please fill ${missingName} ${missingDescription}`, null);
                console.log(result);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            // check exists
            const check = await categoryModel.findOne({ name });
            if (check) {
                const result = jsonFormat(false, "Category already exists", null);

                const decode = jwt.generateToken(result);
                return res.json(decode);
            }
            // create category
            const category = await categoryModel.create({ name, description });
            const result = jsonFormat(true, "Category created", category);
            const decode = jwt.generateToken(result);
            res.json(decode);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Error", err));
        }
    },

    updateCategory: async (req, res) => {
        console.log("Update category");
        try {
            // auth from header
            const { authorization } = req.headers;
            const decodeAuth = jwt.decode(authorization);

            //check permission
            if (decodeAuth.data.role !== "admin") {
                const result = jsonFormat(false, "Permission denied", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            await connectDb();
            const { category_id } = req.params;
            const { name, description } = req.body;
            if (!name || !description) {
                const missingName = !name ? "name" : "";
                const missingDescription = !description ? "description" : "";
                const result = jsonFormat(false, `Please fill ${missingName} ${missingDescription}`, null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            const category = await categoryModel.findOneAndUpdate({ category_id }, { name, description }, { new: true });
            if (!category) {
                const result = jsonFormat(false, "Category not found", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            const result = jsonFormat(true, "Category updated", category);
            const decode = jwt.generateToken(result);
            res.json(decode);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Error", err));
        }
    },

    deleteCategory: async (req, res) => {
        try {
            // auth from header
            const { authorization } = req.headers;
            const decodeAuth = jwt.decode(authorization);

            //check permission
            if (decodeAuth.data.role !== "admin") {
                const result = jsonFormat(false, "Permission denied", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            const { category_id } = req.params;
            await connectDb();
            const category = await categoryModel.findOneAndDelete({ category_id });
            if (!category) {
                const result = jsonFormat(false, "Category not found", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            const result = jsonFormat(true, "Category deleted", category);
            const decode = jwt.generateToken(result);
            res.json(decode);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Error", err));
        }
    },

    updateStatus: async (req, res) => {
        try {
            const { category_id } = req.params;
            // auth from header
            const { authorization } = req.headers;
            const decodeAuth = jwt.decode(authorization);

            //check permission
            if (decodeAuth.data.role !== "admin") {
                const result = jsonFormat(false, "Permission denied", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            await connectDb();
            const category = await categoryModel.findOne({ category_id });
            if (!category) {
                const result = jsonFormat(false, "Category not found", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            const status = category.status === true ? false : true;
            const updateCategory = await categoryModel.findOneAndUpdate({ category_id }, { status }, { new: true });
            const result = jsonFormat(true, "Category updated", updateCategory);
            const decode = jwt.generateToken(result);
            res.json(decode);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Error", err));
        }
    },

    searchByName: async (req, res) => {
        try {
            const { name } = req.params;
            await connectDb();
            const categories = await categoryModel.find({ name: { $regex: name, $options: "i" } });
            const result = categories.length === 0 ? jsonFormat(false, "No categories found", null) : jsonFormat(true, "Categories found", categories);
            const decode = jwt.generateToken(result);
            res.json(decode);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Error", err));
        }
    },
};

module.exports = categoryController;
