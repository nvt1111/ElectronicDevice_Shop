const mongoose = require('mongoose');
const mongoURI = 'mongodb://localhost/Eshop';

// Kết nối MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Đã kết nối thành công đến MongoDB');
    // Tiếp tục xử lý ứng dụng của bạn
  })
  .catch((error) => {
    console.error('Lỗi khi kết nối đến MongoDB:', error);
  });