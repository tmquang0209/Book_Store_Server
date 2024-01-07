const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const orderStatus = require("../Utils/constant");

const orderSchema = new mongoose.Schema({
    order_id: {
        type: Number,
    },

    user_id: {
        type: Number,
        required: false,
    },

    contact: {
        full_name: {
            type: String,
            required: true,
        },
        phone_number: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
    },

    address: {
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
    },

    products: [
        {
            product_id: {
                type: Number,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
        },
    ],

    status: {
        type: String,
        required: true,
        default: orderStatus.PENDING,
    },

    created_at: {
        type: Date,
        default: Date.now(),
    },
});

orderSchema.plugin(AutoIncrement, { inc_field: "order_id" });

const orderModel = mongoose.model("Order", orderSchema);

module.exports = orderModel;
