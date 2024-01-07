const userRouter = require("express").Router();
const userController = require("../controllers/userController");

userRouter.get("/getAllUsers", userController.getAllUsers);
userRouter.get("/getUserById/:id", userController.getUserById);
userRouter.post("/createUser", userController.createUser);
userRouter.put("/updateUserById/:id", userController.updateUser);
userRouter.delete("/deleteUserById", userController.deleteUser);
userRouter.get("/updateStatus/:id", userController.updateStatus);
userRouter.post("/login", userController.login);
userRouter.post("/register", userController.signup);
userRouter.post("/forgotPassword", userController.forgotPassword);

module.exports = userRouter;
