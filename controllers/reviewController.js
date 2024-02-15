const axios = require("axios");
const fs = require("fs");
const OpenAI = require("openai");

require("dotenv").config();
const { validationResult } = require("express-validator");
const testimonialModel = require("../models/testimonial");
const jwt = require("../Utils/jwtToken");

const connectDb = require("../models/database");
const jsonFormat = require("../Utils/json");
const orderModel = require("../models/order");
const productModel = require("../models/product");
const orderStatus = require("../Utils/constant");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

const reviewController = {
    generateReview: async (req, res) => {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: `Generate me about 5 sentence book review in JSON format. Each sentence is a json. This is format:
    [
        {
            review: 'This book is a gripping psychological thriller that keeps you on the edge of your seat until the very end.'
        },
        {
            review: 'The characters are well-developed, and the plot twists keep you guessing.'
        },
        {
            review: "I couldn't put this book down once I started reading it."
        },
        {
            review: "The author's writing style is engaging and the pacing is perfect."
        },
        {
            review: 'Highly recommended for anyone who enjoys a suspenseful and addictive read.'
        }
    ].
    return is array of json.`,
                },
            ],
            model: "gpt-3.5-turbo",
        });

        const contentArray = JSON.parse(completion.choices[0].message.content);

        if (contentArray) {
            try {
                const update = contentArray.map(async (item) => {
                    try {
                        const cloneUser = await axios.get("https://randomuser.me/api/");
                        const result = {
                            description: item.review,
                            name: cloneUser.data.results[0].name.first + " " + cloneUser.data.results[0].name.last,
                            image: cloneUser.data.results[0].picture.large,
                        };

                        return result;
                    } catch (error) {
                        console.error("Error fetching random user:", error.message);
                        // Handle the error appropriately if needed
                        return {
                            description: item.review,
                            name: "Unknown",
                            image: "https://picsum.photos/200",
                        };
                    }
                });

                // save to db
                await connectDb();
                await testimonialModel.deleteMany({});
                await testimonialModel.insertMany(await Promise.all(update));

                return res.json(jsonFormat(true, "Generate review successfully", await Promise.all(update)));
            } catch (err) {
                console.log(err);
                return res.json(jsonFormat(false, "Error when generate review", err));
            }
        } else {
            return res.json(jsonFormat(false, "Error when generate review", null));
        }
    },

    getReview: async (req, res) => {
        try {
            await connectDb();
            const result = await testimonialModel.find({});

            return res.json(jsonFormat(true, "Get review successfully", result));
        } catch (err) {
            console.log(err);
            return res.json(jsonFormat(false, "Error when get review", err));
        }
    },

    getProductsCanReview: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const result = jsonFormat(false, errors.array()[0].msg, null);
                return res.json(result);
            }

            const { authorization } = req.headers;
            const { order_id } = req.params;

            if (!authorization) {
                return res.json(jsonFormat(false, "Authorization is required", null));
            }

            const decodeAuth = jwt.decode(authorization);

            if (!decodeAuth) {
                return res.json(jsonFormat(false, "Invalid token", null));
            }

            const user_id = decodeAuth._doc.user_id;

            await connectDb();
            const orders = await orderModel.find({ order_id, user_id });

            if (orders.length === 0 || !orders) {
                return res.json(jsonFormat(false, "Order not found", null));
            }

            const productsReview = await Promise.all(
                orders[0].products.map(async (item) => {
                    const product = await productModel.findOne({ product_id: item.product_id });

                    if (!product) {
                        return null; // or handle the error in an appropriate way
                    }

                    const reviewed = product.reviews.findIndex((review) => review.user_id === user_id);

                    if (reviewed === -1) {
                        return {
                            product_id: product.product_id,
                            name: product.name,
                            thumbnail: product.thumbnail,
                            price: product.price,
                            category: product.category,
                        };
                    }

                    return null;
                })
            );

            const filteredProducts = productsReview.filter((product) => product !== null);

            return res.json(jsonFormat(true, "Get products can review successfully", filteredProducts || []));
        } catch (err) {
            console.log(err);
            return res.json(jsonFormat(false, "Error when get products can review", err));
        }
    },

    reviewFromUser: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                const result = jsonFormat(false, errors.array()[0].msg, null);
                return res.json(result);
            }

            const { order_id, reviews } = req.body;
            const { authorization } = req.headers;

            if (!authorization) {
                return res.json(jsonFormat(false, "Authorization is required", null));
            }

            const decodeAuth = jwt.decode(authorization);

            if (!decodeAuth) {
                return res.json(jsonFormat(false, "Invalid token", null));
            }

            const user_id = decodeAuth._doc.user_id;

            await connectDb();
            const order = await orderModel.findOne({ order_id });

            if (!order) {
                return res.json(jsonFormat(false, "Order not found", null));
            }

            if (order.user_id !== user_id) {
                return res.json(jsonFormat(false, "You are not allowed to review this order", null));
            }

            if (order.status !== orderStatus.DELIVERED) {
                return res.json(jsonFormat(false, "You can only review delivered order", null));
            }

            reviews.foreach((item) => {
                // check if product_id is in order
                const product = order.products.find((product) => product.product_id === item.product_id);
                if (!product) {
                    return res.json(jsonFormat(false, "Product not found in order", null));
                }

                // check if product_id is in product
                const productDetail = productModel.findOne({ product_id: item.product_id });
                if (!productDetail) {
                    return res.json(jsonFormat(false, "Product not found", null));
                }

                // check reviewed
                const reviewed = productDetail.reviews.find((review) => review.user_id === user_id);
                if (!reviewed) {
                    productDetail.reviews.push({
                        user_id,
                        review: item.review,
                        rating: item.rating,
                    });
                    productDetail.save();
                }
            });

            return res.json(jsonFormat(true, "Review from user successfully", result));
        } catch (err) {
            console.log(err);
            return res.json(jsonFormat(false, "Error when review from user", err));
        }
    },
};

module.exports = reviewController;
