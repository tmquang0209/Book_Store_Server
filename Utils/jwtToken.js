const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (payload, time = "1h") => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: time,
    });
    return payload;
};

// decode token
const decode = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = { generateToken, decode };
