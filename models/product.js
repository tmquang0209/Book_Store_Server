const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const productSchema = new mongoose.Schema({
    product_id: {
        type: Number,
    },

    name: {
        type: String,
        required: true,
    },

    price: {
        type: Number,
        required: true,
    },

    thumbnail: {
        type: String,
        default: "",
    },

    images: [
        {
            type: String,
            required: true,
        },
    ],

    description: {
        type: String,
        required: true,
    },

    category_id: {
        type: Number,
        required: true,
    },

    quantity: {
        inStock: {
            type: Number,
            default: 0,
            required: true,
        },
        sold: {
            type: Number,
            default: 0,
            required: true,
        },
    },

    reviews: [
        {
            user_id: {
                type: Number,
                required: true,
            },
            rating: {
                type: Number,
                default: 0,
            },
        },
    ],

    created_at: {
        type: Date,
        default: Date.now(),
    },
});

productSchema.plugin(AutoIncrement, { inc_field: "product_id" });

const productModel = mongoose.model("Product", productSchema);

module.exports = productModel;
