const connectDb = require("../models/database");
const userModel = require("../models/user");
const jwt = require("../Utils/jwtToken");
const bcrypt = require("../Utils/bcrypt");
const jsonFormat = require("../Utils/json");

const userController = {
    getAllUsers: async (req, res) => {
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
            const users = await userModel.find();

            //encrypt json using jwt
            const result = users.length === 0 ? jsonFormat(false, "No users found", null) : jsonFormat(true, "Users found", users);
            const decode = jwt(result);

            res.json(decode);
        } catch (err) {
            console.error(err);
            res.json(jsonFormat(false, "Error", err));
        }
    },

    getUserById: async (req, res) => {
        try {
            await connectDb();
            const { user_id } = req.params;
            const user = await userModel.findOne({ user_id });

            const result = user ? jsonFormat(true, "User found", user) : jsonFormat(false, "User not found", null);
            const decode = jwt.generateToken(result);

            res.json(decode);
        } catch (err) {
            res.json(err);
        }
    },

    //for admin
    createUser: async (req, res) => {
        console.log("Create user");
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
            const { username, password, first_name, last_name, telephone } = req.body;
            if (!username || !password || !first_name || !last_name || !telephone) {
                const missingUsername = !username ? "username" : "";
                const missingPassword = !password ? "password" : "";
                const missingFirstName = !first_name ? "first_name" : "";
                const missingLastName = !last_name ? "last_name" : "";
                const missingTelephone = !telephone ? "telephone" : "";
                const result = jsonFormat(false, `Please fill ${missingUsername} ${missingPassword} ${missingFirstName} ${missingLastName} ${missingTelephone}`, null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }
            // check exists
            const check = await userModel.findOne({ username });
            if (check) {
                const result = jsonFormat(false, "Username already exists", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }
            // create user
            // encrypt password using bcrypt
            const hash = await bcrypt.hashPassword(password);
            req.body.password = hash;

            const user = await userModel.create(req.body);

            const result = jsonFormat(true, "User created", user);
            const decode = jwt.generateToken(result);
            return res.json(decode);
        } catch (err) {
            res.json(err);
        }
    },

    updateUser: async (req, res) => {
        try {
            await connectDb();
            const { user_id, first_name, last_name, telephone } = req.body;
            const user = await userModel.findOneAndUpdate({ user_id }, { first_name, last_name, telephone }, { new: true });

            if (!user) {
                const result = jsonFormat(false, "User not found", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            res.json(jwt.generateToken(jsonFormat(true, "User updated", user)));
        } catch (err) {
            res.json(err);
        }
    },

    //admin
    deleteUser: async (req, res) => {
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
            const { user_id } = req.body;
            const user = await userModel.findOneAndDelete({
                user_id,
            });

            const result = user ? jsonFormat(true, "User deleted", user) : jsonFormat(false, "User not found", null);
            const decode = jwt.generateToken(result);
            res.json(decode);
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
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            await connectDb();
            const { id } = req.params;
            console.log(req.params);
            const user = await userModel.findOne({ user_id: id });

            if (!user) {
                const result = jsonFormat(false, "User not found", null);
                console.log(result);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            const status = user.status === true ? false : true;
            const updateUser = await userModel.findOneAndUpdate({ user_id: id }, { status }, { new: true });

            const result = jsonFormat(true, "User status updated", updateUser);
            console.log(result);
            const decode = jwt.generateToken(result);
            res.json(decode);
        } catch (err) {
            console.error(err);
            res.json(err);
        }
    },

    login: async (req, res) => {
        try {
            await connectDb();
            const { username, password } = req.body;
            if (!username || !password) {
                const missingUsername = !username ? "username" : "";
                const missingPassword = !password ? "password" : "";
                const result = jsonFormat(false, `Please fill ${missingUsername} ${missingPassword}`, null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            const user = await userModel.findOne({ username });
            if (!user) {
                const result = jsonFormat(false, "Username not found", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            const checkPassword = await bcrypt.comparePassword(password, user.password);
            if (!checkPassword) {
                const result = jsonFormat(false, "Password incorrect", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            const result = jsonFormat(true, "Login success", user);
            const decode = jwt.generateToken(result);
            res.json(decode);
        } catch (err) {
            console.error(err);
            res.json(err);
        }
    },

    signup: async (req, res) => {
        try {
            await connectDb();
            const { username, password, first_name, last_name, telephone } = req.body;
            if (!username || !password || !first_name || !last_name || !telephone) {
                const missingUsername = !username ? "username" : "";
                const missingPassword = !password ? "password" : "";
                const missingFirstName = !first_name ? "first_name" : "";
                const missingLastName = !last_name ? "last_name" : "";
                const missingTelephone = !telephone ? "telephone" : "";
                const result = jsonFormat(false, `Please fill ${missingUsername} ${missingPassword} ${missingFirstName} ${missingLastName} ${missingTelephone}`, null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            const check = await userModel.findOne({ username });
            if (check) {
                const result = jsonFormat(false, "Username already exists", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            const hash = await bcrypt.hashPassword(password);
            req.body.password = hash;

            const user = await userModel.create(req.body);

            const result = jsonFormat(true, "Signup success", user);
            const decode = jwt.generateToken(result);
            res.json(decode);
        } catch (err) {
            console.error(err);
            res.json(err);
        }
    },

    forgotPassword: async (req, res) => {
        try {
            await connectDb();
            const { username } = req.body;
            if (!username) {
                const result = jsonFormat(false, "Please fill username", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            const user = await userModel.findOne({ username });
            if (!user) {
                const result = jsonFormat(false, "Username not found", null);
                const decode = jwt.generateToken(result);
                return res.json(decode);
            }

            const result = jsonFormat(true, "User found", user);
            const decode = jwt.generateToken(result);
            res.json(decode);
        } catch (err) {
            console.error(err);
            res.json(err);
        }
    },
};

module.exports = userController;
