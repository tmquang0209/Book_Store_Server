const connectDb = require("../models/database");
const userModel = require("../models/user");
const jwt = require("../Utils/jwtToken");
const bcrypt = require("../Utils/bcrypt");
const jsonFormat = require("../Utils/json");
const { validationResult } = require("express-validator");
const { json } = require("body-parser");

const userController = {
    getUserByToken: async (req, res) => {
        try {
            const { authorization } = req.headers;
            const decodeAuth = jwt.decode(authorization);

            await connectDb();
            const user = await userModel.findOne({ user_id: decodeAuth._doc.user_id });

            if (!user) {
                const result = jsonFormat(false, "User not found", null);
                return res.json(result);
            }

            const result = jsonFormat(true, "User found", { ...user._doc, token: jwt.generateToken({ ...user }) });
            res.json(result);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Token is expired", null));
        }
    },

    getAllUsers: async (req, res) => {
        try {
            // auth from header
            const { authorization } = req.headers;

            //check permission
            jwt.checkPermission(res, authorization, "admin");

            await connectDb();
            const users = await userModel.find();

            //encrypt json using jwt
            const result = users.length === 0 ? jsonFormat(false, "No users found", null) : jsonFormat(true, "Users found", users);

            res.json(result);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Error", err));
        }
    },

    getUserById: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, errors.array()[0].msg, null);
                return res.json(result);
            }

            // auth from header
            const { authorization } = req.headers;

            //check permission
            // if not admin or req.username != token
            jwt.checkPermission(res, authorization, "admin");

            await connectDb();
            const { user_id } = req.params;
            console.log(user_id);
            const user = await userModel.findOne({ user_id });

            const result = user ? jsonFormat(true, "User found", user) : jsonFormat(false, "User not found", null);

            res.json(result);
        } catch (err) {
            res.json(err);
        }
    },

    //for admin
    createUser: async (req, res) => {
        console.log("Create user");
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, errors.array()[0].msg, null);
                return res.json(result);
            }

            // auth from header
            const { authorization } = req.headers;

            //check permission
            jwt.checkPermission(res, authorization, "admin");

            await connectDb();
            // check empty
            const { username, password, first_name, last_name, telephone } = req.body;

            // check exists
            const check = await userModel.findOne({ username });
            if (check) {
                const result = jsonFormat(false, "Username already exists", null);

                return res.json(result);
            }
            // create user
            // encrypt password using bcrypt
            const hash = await bcrypt.hashPassword(password);
            req.body.password = hash;

            const user = await userModel.create(req.body);

            const result = jsonFormat(true, "User created", user);

            return res.json(result);
        } catch (err) {
            res.json(err);
        }
    },

    updateUser: async (req, res) => {
        console.log("Update user");
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, errors.array()[0].msg, null);
                return res.json(result);
            }

            // auth from header
            const { authorization } = req.headers;
            const { user_id, first_name, last_name, telephone, email, birthday, gender } = req.body;

            const resultAuth = jwt.checkValidValue(res, authorization, user_id);
            if (!resultAuth) {
                return;
            }

            await connectDb();
            const user = await userModel.findOneAndUpdate({ user_id }, { first_name, last_name, telephone, email, birthday, gender }, { new: true });

            if (!user) {
                const result = jsonFormat(false, "User not found", null);
                return res.json(result);
            }

            res.json(jsonFormat(true, "User updated", { ...user._doc, token: jwt.generateToken({ ...user }) }));
        } catch (err) {
            res.json(err);
        }
    },

    //admin
    deleteUser: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, errors.array()[0].msg, null);
                return res.json(result);
            }

            // auth from header
            const { authorization } = req.headers;

            //check permission
            jwt.checkPermission(res, authorization, "admin");

            await connectDb();
            const { user_id } = req.body;
            const user = await userModel.findOneAndDelete({
                user_id,
            });

            const result = user ? jsonFormat(true, "User deleted", user) : jsonFormat(false, "User not found", null);

            res.json(result);
        } catch (err) {
            res.json(err);
        }
    },

    // ban user
    updateStatus: async (req, res) => {
        try {
            // auth from header
            const { authorization } = req.headers;
            const decodeAuth = jwt.decode(authorization);

            //check permission
            if (decodeAuth.data.role !== "admin") {
                const result = jsonFormat(false, "Permission denied", null);

                return res.json(result);
            }

            await connectDb();
            const { user_id } = req.params;

            const user = await userModel.findOne({ user_id });

            if (!user) {
                const result = jsonFormat(false, "User not found", null);
                return res.json(result);
            }

            const status = user.status === true ? false : true;
            const updateUser = await userModel.findOneAndUpdate({ user_id }, { status }, { new: true });

            const result = jsonFormat(true, "User status updated", updateUser);

            res.json(result);
        } catch (err) {
            console.error(err);
            res.json(err);
        }
    },

    login: async (req, res) => {
        try {
            await connectDb();
            const { username, password } = req.body;

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const result = jsonFormat(false, errors.array()[0].msg, null);
                return res.json(result);
            }

            const user = await userModel.findOne({ username });
            if (!user) {
                const result = jsonFormat(false, "Username not found", null);
                return res.json(result);
            }

            const checkPassword = await bcrypt.comparePassword(password, user.password);
            if (!checkPassword) {
                const result = jsonFormat(false, "Password incorrect", null);

                return res.json(result);
            }

            const result = jsonFormat(true, "Login success", { ...user._doc, token: jwt.generateToken({ ...user }) });

            res.json(result);
        } catch (err) {
            console.error(err);
            res.json(err);
        }
    },

    signup: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const result = jsonFormat(false, errors.array()[0].msg, null);
                return res.json(result);
            }

            await connectDb();
            const { username, password, first_name, last_name, telephone } = req.body;

            const check = await userModel.findOne({ username });
            if (check) {
                const result = jsonFormat(false, "Username already exists", null);
                return res.json(result);
            }

            const hash = await bcrypt.hashPassword(password);
            req.body.password = hash;

            const user = await userModel.create(req.body);

            const result = jsonFormat(true, "Signup success", user);

            res.json(result);
        } catch (err) {
            console.error(err);
            res.json(err);
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, errors.array()[0].msg, null);
                return res.json(result);
            }

            await connectDb();
            const { username } = req.body;

            const user = await userModel.findOne({ username });
            if (!user) {
                const result = jsonFormat(false, "Username not found", null);
                return res.json(result);
            }

            const result = jsonFormat(true, "User found", user);
            res.json(result);
        } catch (err) {
            console.error(err);
            res.json(err);
        }
    },

    updateAddress: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, errors.array()[0].msg, null);
                return res.json(result);
            }

            const { authorization } = req.headers;
            const { address, ward, district, province } = req.body;

            if (!authorization) {
                const result = jsonFormat(false, "You must provide access token", null);
                return res.json(result);
            }

            const isLogged = jwt.checkLogin(res, authorization);

            const decodeAuth = jwt.decode(authorization);

            // update address to db
            await connectDb();
            const user = await userModel.findOneAndUpdate({ user_id: decodeAuth._doc.user_id }, { address: { address, ward, district, province } }, { new: true });

            if (!user) {
                const result = jsonFormat(false, "Can not update address", null);
                res.json(result);
            }

            const result = jsonFormat(true, "Update address successful", user);
            res.json(result);
        } catch (err) {
            console.error(err);
        }
    },

    changePassword: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, errors.array()[0].msg, null);
                return res.json(result);
            }

            const { authorization } = req.headers;
            const { old_password, new_password } = req.body;

            if (!authorization) {
                const result = jsonFormat(false, "You must provide access token", null);
                return res.json(result);
            }

            const isLogged = jwt.checkLogin(res, authorization);

            const decodeAuth = jwt.decode(authorization);

            await connectDb();
            const user = await userModel.findOne({ user_id: decodeAuth._doc.user_id });

            if (!user) {
                const result = jsonFormat(false, "User not found", null);
                return res.json(result);
            }

            const checkPassword = await bcrypt.comparePassword(old_password, user.password);
            if (!checkPassword) {
                const result = jsonFormat(false, "Old password incorrect", null);
                return res.json(result);
            }

            const hash = await bcrypt.hashPassword(new_password);
            const updateUser = await userModel.findOneAndUpdate({ user_id: decodeAuth._doc.user_id }, { password: hash }, { new: true });

            const result = jsonFormat(true, "Change password success", updateUser);
            res.json(result);
        } catch (err) {
            console.error(err);
        }
    },
};

module.exports = userController;
