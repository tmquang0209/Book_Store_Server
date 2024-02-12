const userRouter = require("express").Router();
const { validationResult } = require("express-validator");
const userController = require("../controllers/userController");
const validate = require("../Utils/validate");

userRouter.get("/getUserByToken", userController.getUserByToken);
userRouter.get("/getAllUsers", userController.getAllUsers);
userRouter.get("/getUserById/:id", userController.getUserById);
userRouter.post("/createUser", userController.createUser);
userRouter.put("/updateUserById", validate.updateUser, userController.updateUser);
userRouter.delete("/deleteUserById", userController.deleteUser);
userRouter.get("/updateStatus/:user_id", userController.updateStatus);
userRouter.post("/login", validate.loginUser, userController.login);
userRouter.post("/register", validate.registerUser, userController.signup);
userRouter.post("/forgotPassword", validate.forgotPassword, userController.forgotPassword);
userRouter.post("/updateAddress", validate.updateAddress, userController.updateAddress);

module.exports = userRouter;
