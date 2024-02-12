const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const userSchema = new mongoose.Schema({
    user_id: {
        type: Number,
    },

    username: {
        type: String,
        require: true,
    },

    password: {
        type: String,
        require: true,
    },

    first_name: {
        type: String,
        require: true,
    },

    last_name: {
        type: String,
        require: true,
    },

    email: {
        type: String,
        require: false,
    },

    birthday: {
        type: String,
        require: false,
    },

    gender: {
        type: String,
        require: false,
    },

    telephone: {
        type: String,
        require: true,
    },

    address: {
        address: {
            type: String,
            require: false,
        },
        ward: {
            type: String,
            require: false,
        },
        district: {
            type: String,
            require: false,
        },
        province: {
            type: String,
            require: false,
        },
    },

    status: {
        type: Boolean,
        default: true,
    },

    created_at: {
        type: Date,
        default: Date.now(),
        require: true,
    },

    role: {
        type: String,
        default: "user",
    },

    modified_at: {
        type: Date,
        default: Date.now(),
        require: true,
    },
});

userSchema.plugin(AutoIncrement, { inc_field: "user_id" });

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
