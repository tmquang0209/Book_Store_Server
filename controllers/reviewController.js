const axios = require("axios");
const fs = require("fs");
const OpenAI = require("openai");

require("dotenv").config();

const connectDb = require("../models/database");
const testimonialModel = require("../models/testimonial");
const jsonFormat = require("../Utils/json");

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

                return res.json(jsonFormat("success", "Generate review successfully", await Promise.all(update)));
            } catch (err) {
                console.log(err);
                return res.json(jsonFormat("error", "Error when generate review", err));
            }
        } else {
            return res.json(jsonFormat("error", "Error when generate review", null));
        }
    },

    getReview: async (req, res) => {
        try {
            await connectDb();
            const result = await testimonialModel.find({});

            return res.json(jsonFormat("success", "Get review successfully", result));
        } catch (err) {
            console.log(err);
            return res.json(jsonFormat("error", "Error when get review", err));
        }
    },
};

module.exports = reviewController;
