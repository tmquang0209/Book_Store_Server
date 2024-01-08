const jwt = require("jsonwebtoken");
const jsonFormat = require("./json");
require("dotenv").config();

const generateToken = (payload, time = "1h") => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: time,
    });
    return token;
};

// decode token
const decode = (token) => jwt.verify(token, process.env.JWT_SECRET);

const checkPermission = (res, token, role) => {
    const decodeToken = decode(token);
    if (decodeToken.role === role) {
        res.status(401).json(jsonFormat(false, "Permission denied", null));
    }
};

const checkLogin = (res, token) => {
    const decodeToken = decode(token);
    if (!decodeToken) {
        res.status(401).json(jsonFormat(false, "Permission denied", null));
    }
};

const checkValidValue = (res, token, userId) => {
    const decodeToken = decode(token);
    if (decodeToken.user_id !== userId) {
        return res.status(401).json(jsonFormat(false, "Permission denied", null));
    }
};

module.exports = { generateToken, decode, checkPermission, checkLogin, checkValidValue };
