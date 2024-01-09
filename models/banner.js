const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const bannerSchema = new mongoose.Schema({
    banner_id: {
        type: Number,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    author: {
        type: String,
    },
    image: String,
    link: String,
    status: {
        type: Boolean,
        default: true,
    },
    order: {
        type: Number,
        default: 0,
    },
});

bannerSchema.plugin(AutoIncrement, { inc_field: "banner_id" });

const bannerModel = mongoose.model("Banner", bannerSchema);

module.exports = bannerModel;
