const userRouter = require("express").Router();
const userController = require("../controllers/userController");
const validate = require("../Utils/validate");

userRouter.get("/getUserByToken", userController.getUserByToken);
userRouter.get("/getAllUsers", userController.getAllUsers);
userRouter.get("/getUserById/:user_id", validate.userById, userController.getUserById);
userRouter.post("/createUser", validate.createUser, userController.createUser);
userRouter.put("/updateUserById", validate.updateUser, userController.updateUser);
userRouter.delete("/deleteUserById", validate.deleteUser, userController.deleteUser);
userRouter.get("/updateStatus/:user_id", validate.updateUser, userController.updateStatus);
userRouter.post("/login", validate.loginUser, userController.login);
userRouter.post("/register", validate.registerUser, userController.signup);
userRouter.post("/forgotPassword", validate.forgotPassword, userController.forgotPassword);
userRouter.post("/verifyCode", validate.verifyCode, userController.verifyCode);
userRouter.post("/updateAddress", validate.updateAddress, userController.updateAddress);
userRouter.post("/changePassword", validate.changePassword, userController.changePassword);
userRouter.post("/createNewPassword", validate.createNewPassword, userController.createNewPassword);

module.exports = userRouter;
