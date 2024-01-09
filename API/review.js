const reviewRouter = require("express").Router();
const reviewController = require("../controllers/reviewController");

reviewRouter.post("/", reviewController.generateReview);
reviewRouter.get("/allReviews", reviewController.getReview);

module.exports = reviewRouter;
