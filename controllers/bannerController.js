const { validationResult } = require("express-validator");
const connectDb = require("../models/database");
const bannerModel = require("../models/banner");
const jsonFormat = require("../Utils/json");

const bannerController = {
    getAllBanner: async (req, res) => {
        try {
            await connectDb();
            const banner = await bannerModel.find();
            const result = banner.length !== 0 ? jsonFormat(true, "Success", banner) : jsonFormat(true, "No banners found", null);

            return res.json(result);
        } catch (error) {
            console.error(error);
            res.json(jsonFormat(false, "Error", error));
        }
    },

    getBannerById: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, "Error", errors.array());
                return res.json(result);
            }

            const { banner_id } = req.params;

            await connectDb();
            const banner = await bannerModel.findOne({ banner_id });

            const result = banner.length !== 0 ? jsonFormat(true, "Success", banner) : jsonFormat(true, "No banners found", null);

            return res.json(result);
        } catch (error) {
            console.error(error);
            return res.json(jsonFormat(false, "Error", error));
        }
    },

    createBanner: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, "Error", errors.array());
                return res.json(result);
            }

            await connectDb();
            const banner = await bannerModel.create(req.body);

            const result = jsonFormat(true, "Banner created successfully", banner);

            return res.json(result);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    updateBanner: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, "Error", errors.array());
                return res.json(result);
            }

            const { banner_id } = req.params;

            await connectDb();
            const banner = await bannerModel.findOneAndUpdate({ banner_id }, req.body, { new: true });

            const result = jsonFormat(true, "Success", banner);

            return res.json(result);
        } catch (error) {
            console.error(error);
            return res.json(jsonFormat(false, "Error", error));
        }
    },

    deleteBanner: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, "Error", errors.array());
                return res.json(result);
            }

            const { banner_id } = req.params;

            await connectDb();
            await bannerModel.findOneAndDelete({ banner_id });

            const result = jsonFormat(true, "Success", "Banner deleted successfully");

            return res.json(result);
        } catch (error) {
            console.error(error);
            return res.json(jsonFormat(false, "Error", error));
        }
    },

    updateStatus: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, "Error", errors.array());
                return res.json(result);
            }

            const { banner_id } = req.params;

            await connectDb();

            const banner = await bannerModel.findOne({ banner_id });

            if (!banner) {
                const result = jsonFormat(false, "Banner not found", null);
                return res.json(result);
            }

            const status = banner.status === true ? false : true;

            const updateBanner = await bannerModel.findOneAndUpdate({ banner_id }, { status }, { new: true });

            const result = jsonFormat(true, "Banner status updated", updateBanner);
            return res.json(result);
        } catch (error) {
            console.error(error);
            return res.json(jsonFormat(false, "Error", error));
        }
    },
};

module.exports = bannerController;
