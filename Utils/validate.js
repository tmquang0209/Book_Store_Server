const { check } = require("express-validator");

const userValidate = {
    loginUser: [check("username", "Username is required").not().isEmpty(), check("password", "Password is required").not().isEmpty()],

    registerUser: [
        check("username", "Username is required").not().isEmpty(),
        check("password", "Password is required").not().isEmpty(),
        check("first_name", "First name is required").not().isEmpty(),
        check("last_name", "Last name is required").not().isEmpty(),
        check("telephone", "Telephone is required").not().isEmpty(),
    ],

    forgotPassword: [check("username", "Username is required").not().isEmpty()],

    userById: [check("user_id", "user_id is required").not().isEmpty(), check("user_id", "user_id must be a number").isNumeric()],

    createUser: [
        check("username", "Username is required").not().isEmpty(),
        check("password", "Password is required").not().isEmpty(),
        check("first_name", "First name is required").not().isEmpty(),
        check("last_name", "Last name is required").not().isEmpty(),
        check("telephone", "Telephone is required").not().isEmpty(),
    ],

    updateUser: [
        check("user_id", "user_id is required").not().isEmpty(),
        check("user_id", "user_id must be a number").isNumeric(),
        check("first_name", "First name is required").not().isEmpty(),
        check("last_name", "Last name is required").not().isEmpty(),
        check("telephone", "Telephone is required").not().isEmpty(),
    ],

    deleteUser: [check("user_id", "user_id is required").not().isEmpty(), check("user_id", "user_id must be a number").isNumeric()],

    updateStatusUser: [check("user_id", "user_id is required").not().isEmpty(), check("user_id", "user_id must be a number").isNumeric()],
};

const categoryValidate = {
    categoryById: [check("category_id", "category_id is required").not().isEmpty(), check("category_id", "category_id must be a number").isNumeric()],

    createCategory: [check("name", "name is required").not().isEmpty()],

    updateCategory: [
        check("category_id", "category_id is required").not().isEmpty(),
        check("category_id", "category_id must be a number").isNumeric(),
        check("name", "name is required").not().isEmpty(),
    ],

    deleteCategory: [check("category_id", "category_id is required").not().isEmpty(), check("category_id", "category_id must be a number").isNumeric()],

    updateStatusCategory: [check("category_id", "category_id is required").not().isEmpty(), check("category_id", "category_id must be a number").isNumeric()],

    searchByName: [check("name", "name is required").not().isEmpty()],
};

const productValidate = {
    productById: [check("product_id", "product_id is required").not().isEmpty(), check("product_id", "product_id must be a number").isNumeric()],
    createProduct: [check("name", "name is required").not().isEmpty(), check("price", "price is required").not().isEmpty(), check("category_id", "category_id is required").not().isEmpty()],
    updateProduct: [
        check("product_id", "product_id is required").not().isEmpty(),
        check("product_id", "product_id must be a number").isNumeric(),
        check("name", "name is required").not().isEmpty(),
        check("price", "price is required").not().isEmpty(),
        check("category_id", "category_id is required").not().isEmpty(),
    ],
    deleteProduct: [check("product_id", "product_id is required").not().isEmpty(), check("product_id", "product_id must be a number").isNumeric()],
    updateStatusProduct: [check("product_id", "product_id is required").not().isEmpty(), check("product_id", "product_id must be a number").isNumeric()],
    searchByName: [check("name", "name is required").not().isEmpty()],
};

const validate = {
    ...userValidate,
    ...categoryValidate,
    ...productValidate,
};

module.exports = validate;
