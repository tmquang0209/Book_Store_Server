const app = require("express")();
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");

const userRouter = require("./API/user");
const categoryRouter = require("./API/category");
const productRouter = require("./API/product");
const orderRouter = require("./API/order");
const reviewRouter = require("./API/review");
const bannerRouter = require("./API/banner");

app.use(bodyParser.json());
app.use(cors());

app.use("/user/", userRouter);
app.use("/category/", categoryRouter);
app.use("/product/", productRouter);
app.use("/order/", orderRouter);
app.use("/review/", reviewRouter);
app.use("/banner/", bannerRouter);

app.listen(process.env.PORT || 3001, () => {
    console.log("listening on *:3000");
});
