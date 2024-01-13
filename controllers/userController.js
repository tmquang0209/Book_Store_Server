const connectDb = require("../models/database");
const userModel = require("../models/user");
const jwt = require("../Utils/jwtToken");
const bcrypt = require("../Utils/bcrypt");
const jsonFormat = require("../Utils/json");
const { validationResult } = require("express-validator");

const userController = {
    getUserByToken: async (req, res) => {
        try {
            const { authorization } = req.headers;
            const decodeAuth = jwt.decode(authorization);
            console.log(decodeAuth);
            return res.json(jsonFormat(true, "User found", { ...decodeAuth, token: jwt.generateToken({ ...decodeAuth._doc }) }));
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
            // jwt.checkPermission(res, authorization, "admin");

            await connectDb();
            const { user_id } = req.params;
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
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, errors.array()[0].msg, null);
                return res.json(result);
            }

            // auth from header
            const { authorization } = req.headers;

            const { user_id, first_name, last_name, telephone } = req.body;
            jwt.checkValidValue(res, authorization, user_id);

            await connectDb();
            const user = await userModel.findOneAndUpdate({ user_id }, { first_name, last_name, telephone }, { new: true });

            if (!user) {
                const result = jsonFormat(false, "User not found", null);

                return res.json(result);
            }

            res.json(jwt.generateToken(jsonFormat(true, "User updated", user)));
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
};

module.exports = userController;
