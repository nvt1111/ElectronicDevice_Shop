const crypto = require('crypto')

const key1 = crypto.randomBytes(32).toString('hex');
const key2 = crypto.randomBytes(32).toString('hex');

console.table({ key1, key2 })
//node helpers/generate_key.js dùng lệnh này chạy ra 2 key cho mình
// key1: dành cho accessToken
// key2: dành cho refresh-token
// 2 key này dùng để mã hoá và bảo mật