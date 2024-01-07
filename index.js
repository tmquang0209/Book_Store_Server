const app = require("express")();
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");

const userRouter = require("./API/user");
const categoryRouter = require("./API/category");
const productRouter = require("./API/product");
const orderRouter = require("./API/order");

app.use(bodyParser.json());
app.use(cors());

app.use("/user/", userRouter);
app.use("/category/", categoryRouter);
app.use("/product/", productRouter);
app.use("/order/", orderRouter);

app.listen(3000, () => {
    console.log("listening on *:3000");
});
