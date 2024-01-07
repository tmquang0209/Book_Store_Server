/**
 * Description:
 * This file is used to create a schema for category collection in database.
 * status: true means category is active and false means category is inactive.
 */
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const categorySchema = new mongoose.Schema({
    category_id: {
        type: Number,
    },

    name: {
        type: String,
        require: true,
    },

    image: {
        type: String,
    },

    description: {
        type: String,
        require: false,
    },

    status: {
        type: Boolean,
        default: true,
    },

    created_at: {
        type: Date,
        default: Date.now(),
    },
});

categorySchema.plugin(AutoIncrement, { inc_field: "category_id" });

const categoryModel = mongoose.model("Category", categorySchema);

module.exports = categoryModel;
