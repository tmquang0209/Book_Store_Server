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

const bannerValidate = {
    bannerById: [check("banner_id", "banner_id is required").not().isEmpty(), check("banner_id", "banner_id must be a number").isNumeric()],
    createBanner: [check("name", "name is required").not().isEmpty(), check("image", "image is required").not().isEmpty(), check("link", "link is required").not().isEmpty()],
    updateBanner: [
        check("banner_id", "banner_id is required").not().isEmpty(),
        check("banner_id", "banner_id must be a number").isNumeric(),
        check("name", "name is required").not().isEmpty(),
        check("image", "image is required").not().isEmpty(),
        check("link", "link is required").not().isEmpty(),
    ],

    deleteBanner: [check("banner_id", "banner_id is required").not().isEmpty(), check("banner_id", "banner_id must be a number").isNumeric()],
    updateStatusBanner: [check("banner_id", "banner_id is required").not().isEmpty(), check("banner_id", "banner_id must be a number").isNumeric()],
};

const orderValidate = {
    createOrder: [
        check("contact", "contact is required").not().isEmpty(),
        check("contact.full_name", "contact.full_name is required").not().isEmpty(),
        check("contact.phone_number", "contact.phone_number is required").not().isEmpty(),
        check("address", "address is required").not().isEmpty(),
        check("address.address", "address.address is required").not().isEmpty(),
        check("address.province", "address.province is required").not().isEmpty(),
        check("address.district", "address.district is required").not().isEmpty(),
        check("address.ward", "address.ward is required").not().isEmpty(),
        check("products", "products is required").not().isEmpty(),
        check("products", "products must be an array").isArray(),
        check("payment", "payment is required").not().isEmpty(),
    ],
    getOrder: [check("order_id", "order_id is required").not().isEmpty(), check("order_id", "order_id must be a number").isNumeric()],
};

const validate = {
    ...userValidate,
    ...categoryValidate,
    ...productValidate,
    ...bannerValidate,
    ...orderValidate,
};

module.exports = validate;
