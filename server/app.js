const express = require('express');
const morgan = require('morgan');
require('dotenv/config');
const app = express();
const cors = require('cors');
const DBconnect = require("./connections/DBconnect")
const initRoutes = require('./routes/index')

app.use(cors());
app.use('*', cors()); // cho phep tat ca http
// middleware
app.use(express.json());//bodyparser
app.use(morgan('dev'));
// Middleware để xử lý dữ liệu từ form
app.use(express.urlencoded({ extended: false }));
//
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.set('view engine', 'ejs')
app.use(express.static('public/styles')) ;// ơ dau cung truy cạp dc

DBconnect
app.listen(3000, ()=>{
    console.log('Server is running http://localhost:3000')
})

app.get('/', (req,res)=>{
  res.render('index')
  // res.redirect('users/register')
})
initRoutes(app);

