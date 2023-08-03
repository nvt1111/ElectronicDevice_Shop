const express = require('express');
const morgan = require('morgan');
require('dotenv/config');
const app = express();
const cors = require('cors');
const DBconnect = require("./connections/DBconnect")
const initRoutes = require('./routes/index')
const session = require('express-session');
const bodyParser = require('body-parser');

app.use(cors());
app.use('*', cors()); // cho phep tat ca http
// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());//bodyparser
app.use(morgan('dev'));
// Middleware để xử lý dữ liệu từ form
app.use(express.urlencoded({ extended: false }));
//
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.set('view engine', 'ejs')
app.use(express.static('public/styles')) ;// ơ dau cung truy cạp dc
// app.set('view engine', 'pug');



app.use(session({
  secret: 'your-secret-key', // Khóa bí mật để mã hóa session (có thể thay đổi)
  resave: false, // Không lưu lại session mỗi lần yêu cầu được gửi lại
  saveUninitialized: true, // Lưu session ngay cả khi chưa có dữ liệu
}));

DBconnect
app.listen(3000, ()=>{
    console.log('Server is running http://localhost:3000')
})

const Category = require('./models/category');
const Product = require('./models/product');
const Order = require('./models/order');
const User = require('./models/user');
// Truy vấn và truyền categories vào res.locals để sử dụng trên toàn bộ ứng dụng
// middlewares sử dụng cho mọi ware
const category = require('./models/category')
app.use(async (req, res, next) => {
  try {
    const categories = await Category.find();
    const products = await Product.find().populate('category');
    const orders = await Order.find();
    const users = await User.find();
    res.locals.categories = categories;
    res.locals.products = products;
    res.locals.orders = orders;
    res.locals.users = users;
    next();// chuyển sang mdlleware khác
  } catch (error) {
    console.error('Error retrieving categories from MongoDB:', error);
    next(error);
  }
});

app.get('/', (req, res) => {
  const isLoggedIn = req.session.isLoggedIn || false;
  const user = req.session.user || null;
  res.render('index', { isLoggedIn: isLoggedIn, user: user });
});

initRoutes(app);

