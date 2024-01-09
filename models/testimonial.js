const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const testimonialSchema = new mongoose.Schema({
    testimonial_id: {
        type: Number,
    },
    name: {
        type: String,
    },
    image: String,
    description: String,
    status: {
        type: Boolean,
        default: true,
    },
});

testimonialSchema.plugin(AutoIncrement, { inc_field: "testimonial_id" });

const testimonialModel = mongoose.model("Testimonial", testimonialSchema);

module.exports = testimonialModel;
