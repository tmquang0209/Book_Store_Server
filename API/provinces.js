const provincesRouter = require("express").Router();
const provincesController = require("../controllers/provincesController");

provincesRouter.get("/", provincesController.getFull);

module.exports = provincesRouter;
