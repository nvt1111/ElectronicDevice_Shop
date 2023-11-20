const mongoose = require('mongoose');
// const mongoURI = 'mongodb://localhost/Eshop';
// const mongoURI = 'mongodb+srv://nguyenvanthai:nguyenvanthai@electronic-shop.jk0hiuo.mongodb.net/Eshop'

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Đã kết nối thành công đến MongoDB');
  })
  .catch((error) => {
    console.error('Lỗi khi kết nối đến MongoDB:', error);
  });

