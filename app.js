const express = require("express");
const morgan = require("morgan");
require("dotenv/config");
require("./helpers/oauth2");
const passport = require("passport");
const app = express();
const cors = require("cors");
const DBconnect = require("./connections/DBconnect");
const initRoutes = require("./routes/index");
const session = require("express-session");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const i18n = require("./config/i18n");

// npm install cookie-parser
app.use(cors());
app.use("*", cors()); // cho phep tat ca http
app.use(cors({
  origin: 'https://web-electronic-shop.onrender.com', // Cho phép yêu cầu từ miền này
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Cho phép sử dụng cookie hoặc token xác thực
  optionsSuccessStatus: 204, // Cho phép tiêu đề OPTIONS mà không gặp lỗi CORS
}));

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(i18n.init);

app.use(express.json()); //bodyparser
// app.use(morgan('dev'));
// Middleware để xử lý dữ liệu từ form
app.use(express.urlencoded({ extended: false }));

app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.set("view engine", "ejs");
app.use(express.static("public/styles")); // ơ dau cung truy cạp dc
app.use(express.static("public")); // ơ dau cung truy cạp dc
app.use(methodOverride("_method")); // để sử dụng pthuc PUT

app.use(
  session({
    secret: "your-secret-key", // Khóa bí mật để mã hóa session (có thể thay đổi)
    resave: false, // Không lưu lại session mỗi lần yêu cầu được gửi lại
    saveUninitialized: true, // Lưu session ngay cả khi chưa có dữ liệu
  })
);

app.use(passport.initialize());
app.use(passport.session());

DBconnect;
app.listen(5001, () => {
  console.log("Server is running http://localhost:5001");
});

const Category = require("./models/category");
const Product = require("./models/product");
const Order = require("./models/order");
const User = require("./models/user");

// Truy vấn và truyền categories vào res.locals để sử dụng trên toàn bộ ứng dụng
// middlewares sử dụng cho mọi ware
const category = require("./models/category");
app.use(async (req, res, next) => {
  try {
    const categories = await Category.find();
    const products = await Product.find().populate("category");
    const orders = await Order.find();
    const users = await User.find();
    res.locals.categories = categories;
    res.locals.products = products;
    res.locals.orders = orders;
    res.locals.users = users;
    next();
  } catch (error) {
    console.error("Không lấy được data từ MongoDB:", error);
    next(error);
  }
});

app.get("/", (req, res) => {
  const isLoggedIn = req.session.isLoggedIn || false;
  const user = req.session.user || null;
  res.render("index", { isLoggedIn: isLoggedIn, user: user });
});

app.get("/success", (req, res, next) => {
  const message = res.locals.message;
  res.render("success", { message });
});

app.get("/change-language/:lang", (req, res) => {
  const lang = req.params.lang;
  res.cookie("lang", lang);
  res.redirect("/");
});

initRoutes(app);