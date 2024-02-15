const reviewRouter = require("express").Router();
const reviewController = require("../controllers/reviewController");

const validate = require("../Utils/validate");

reviewRouter.post("/", reviewController.generateReview);
reviewRouter.get("/allReviews", reviewController.getReview);
reviewRouter.post("/userReview", validate.createReview, reviewController.reviewFromUser);
reviewRouter.get("/productsCanReview/:order_id", validate.getOrder, reviewController.getProductsCanReview);

module.exports = reviewRouter;
