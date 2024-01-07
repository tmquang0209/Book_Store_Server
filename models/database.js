const mongoose = require("mongoose");
require("dotenv").config();

const connectDb = () =>
    mongoose
        .connect(process.env.MONGODB_URI)
        .then(() => console.log("Connect success to Mongodb"))
        .catch((err) => console.error(err));

module.exports = connectDb;
