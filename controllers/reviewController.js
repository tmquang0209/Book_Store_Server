const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

const reviewController = {
    generateReview: async (req, res) => {
        const chatCompletion = await openai.chat.completions.create({
            messages: [{ role: "user", content: "Say this is a test" }],
            model: "gpt-3.5-turbo",
        });

        console.log(chatCompletion);
    },
};

module.exports = reviewController;
