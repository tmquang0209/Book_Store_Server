const reviewRouter = require("express").Router();
const reviewController = require("../controllers/reviewController");

reviewRouter.post("/", reviewController.generateReview);

module.exports = reviewRouter;
